import { NextResponse } from "next/server";
import {
  redis,
  fetchTweetsFromUser,
  fetchTwitterProfile,
  PartialTweet,
  CACHE_TTL,
  writeToCache,
} from "@/lib/twitter-utils";

// Generate contribution graph for a specific year
function generateContributionGraph(tweets: PartialTweet[], year: number) {
  // Create date objects for the start and end of the year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // Create a map of post counts by date
  const postsByDate: Record<string, number> = {};

  // Create a date formatter
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Initialize days with zero counts
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split("T")[0];
    postsByDate[dateKey] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Count posts for each date
  tweets.forEach((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);

    // Only count tweets from the specified year
    if (tweetDate.getFullYear() === year) {
      const dateKey = tweetDate.toISOString().split("T")[0];
      postsByDate[dateKey] = (postsByDate[dateKey] || 0) + 1;
    }
  });

  // Find the maximum posts in a day for level calculation
  const maxPosts = Math.max(...Object.values(postsByDate), 1);

  // Get number of days in the year
  const daysInYear =
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;

  // Calculate the day of the week for Jan 1st (0 = Sunday, 6 = Saturday)
  const firstDayOfYearWeekday = new Date(year, 0, 1).getDay();

  // Create a flat array of day data
  const allDays = [];

  startDate.setDate(1);
  startDate.setMonth(0);

  for (let d = 0; d < daysInYear; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);

    const dateKey = currentDate.toISOString().split("T")[0];
    const count = postsByDate[dateKey] || 0;

    // Calculate the contribution level (0-4)
    let level = 0;
    if (count > 0) {
      // Determine the level based on percentile of maximum
      if (count <= maxPosts * 0.25) level = 1;
      else if (count <= maxPosts * 0.5) level = 2;
      else if (count <= maxPosts * 0.75) level = 3;
      else level = 4;
    }

    allDays.push({
      date: dateFormatter.format(currentDate),
      count,
      level,
      month: currentDate.getMonth(), // Add month for better alignment
      day: currentDate.getDate(), // Add day for better tooltip
      weekday: currentDate.getDay(), // Add weekday for alignment
    });
  }

  // Now organize into week columns (for the GitHub-style graph)
  // Each column represents a week
  const numWeeks = Math.ceil((daysInYear + firstDayOfYearWeekday) / 7);

  // Create empty weeks
  const contributionGraph = [];
  for (let w = 0; w < numWeeks; w++) {
    contributionGraph.push(
      Array(7)
        .fill(null)
        .map(() => ({
          count: 0,
          level: 0,
          date: "",
          month: -1,
          day: 0,
          weekday: 0,
        }))
    );
  }

  // Add empty cells for days before the first day of the year
  for (let d = 0; d < firstDayOfYearWeekday; d++) {
    contributionGraph[0][d] = {
      count: 0,
      level: 0,
      date: "",
      month: -1,
      day: 0,
      weekday: d,
    };
  }

  // Fill in the actual days
  for (let d = 0; d < allDays.length; d++) {
    const weekIndex = Math.floor((d + firstDayOfYearWeekday) / 7);
    const dayOfWeek = (d + firstDayOfYearWeekday) % 7;

    if (weekIndex < numWeeks) {
      contributionGraph[weekIndex][dayOfWeek] = {
        ...allDays[d],
        weekday: dayOfWeek,
      };
    }
  }

  // Add month range information for improved labeling
  const monthRanges = [];
  let currentMonth = -1;
  let currentMonthStartWeek = -1;

  // Calculate which weeks contain which months
  for (let w = 0; w < contributionGraph.length; w++) {
    // Check the first day with valid month data in each week
    for (let d = 0; d < 7; d++) {
      const day = contributionGraph[w][d];
      if (day && day.month >= 0) {
        if (day.month !== currentMonth) {
          // If we found a new month, record the previous month's range
          if (currentMonth >= 0) {
            monthRanges.push({
              month: currentMonth,
              startWeek: currentMonthStartWeek,
              endWeek: w - 1,
            });
          }
          currentMonth = day.month;
          currentMonthStartWeek = w;
        }
        break;
      }
    }
  }

  // Add the final month
  if (currentMonth >= 0) {
    monthRanges.push({
      month: currentMonth,
      startWeek: currentMonthStartWeek,
      endWeek: contributionGraph.length - 1,
    });
  }

  return {
    graph: contributionGraph,
    monthRanges: monthRanges,
  };
}

// Calculate user statistics
function calculateUserStats(tweets: PartialTweet[], year: number) {
  // Filter tweets for the specific year
  const yearTweets = tweets.filter((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
    return tweetDate.getFullYear() === year;
  });

  // Calculate total posts for the year
  const totalPosts = yearTweets.length;

  // Find the earliest tweet to determine join year
  let joinYear = year;
  if (tweets.length > 0) {
    const dates = tweets.map(
      (t) => new Date(t.tweet_created_at || t.created_at)
    );
    const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    joinYear = earliestDate.getFullYear();
  }

  // Group tweets by date to calculate streaks
  const tweetsByDate: Record<string, PartialTweet[]> = {};
  yearTweets.forEach((tweet) => {
    const dateKey = new Date(tweet.tweet_created_at || tweet.created_at)
      .toISOString()
      .split("T")[0];
    if (!tweetsByDate[dateKey]) {
      tweetsByDate[dateKey] = [];
    }
    tweetsByDate[dateKey].push(tweet);
  });

  // Calculate best streak and current streak
  const dates = Object.keys(tweetsByDate).sort();
  let currentStreak = 0;
  let bestStreak = 0;
  let currentStreakStart: string | null = null;
  let bestStreakStart: string | null = null;
  let bestStreakEnd: string | null = null;

  // Helper to format date for display
  const formatDateForDisplay = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if today or yesterday has posts to determine if the streak is current
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const isCurrentStreak = tweetsByDate[today] || tweetsByDate[yesterday];

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
      currentStreakStart = dates[i];
    } else {
      const currentDate = new Date(dates[i]);
      const prevDate = new Date(dates[i - 1]);

      // Check if dates are consecutive
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        // If streak is broken, check if it was the best
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
          bestStreakStart = currentStreakStart;
          bestStreakEnd = dates[i - 1];
        }
        // Reset current streak
        currentStreak = 1;
        currentStreakStart = dates[i];
      }
    }

    // Check if we're at the end of the dates array
    if (i === dates.length - 1 && currentStreak > bestStreak) {
      bestStreak = currentStreak;
      bestStreakStart = currentStreakStart;
      bestStreakEnd = dates[i];
    }
  }

  // Format best streak period for display
  const bestStreakPeriod =
    bestStreakStart && bestStreakEnd
      ? `${formatDateForDisplay(bestStreakStart)} - ${formatDateForDisplay(
          bestStreakEnd
        )}`
      : null;

  // Calculate average posts per day (only counting days in the year)
  const daysInYear =
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
  const averagePostsPerDay = parseFloat((totalPosts / daysInYear).toFixed(1));

  // Find the day with most posts
  let bestDay = null;
  let maxPosts = 0;

  Object.entries(tweetsByDate).forEach(([date, tweets]) => {
    if (tweets.length > maxPosts) {
      maxPosts = tweets.length;
      bestDay = {
        date: new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        count: tweets.length,
      };
    }
  });

  // Calculate average engagement metrics
  let totalLikes = 0;
  let totalRetweets = 0;
  let totalReplies = 0;
  let totalViews = 0;

  yearTweets.forEach((tweet) => {
    totalLikes += tweet.favorite_count || 0;
    totalRetweets += tweet.retweet_count || 0;
    totalReplies += tweet.reply_count || 0;
    totalViews += tweet.views_count || tweet.view_count || 0;
  });

  const averageEngagement = {
    likes:
      totalPosts > 0 ? parseFloat((totalLikes / totalPosts).toFixed(1)) : 0,
    retweets:
      totalPosts > 0 ? parseFloat((totalRetweets / totalPosts).toFixed(1)) : 0,
    replies:
      totalPosts > 0 ? parseFloat((totalReplies / totalPosts).toFixed(1)) : 0,
    views:
      totalPosts > 0 ? parseFloat((totalViews / totalPosts).toFixed(1)) : 0,
  };

  // Find most active day of the week
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  yearTweets.forEach((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
    const dayOfWeek = tweetDate.getDay();
    dayOfWeekCounts[dayOfWeek]++;
  });

  const mostActiveDayOfWeek = {
    day: dayNames[dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts))],
    count: Math.max(...dayOfWeekCounts),
  };

  // Find most active month
  const monthCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Jan to Dec
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  yearTweets.forEach((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
    const month = tweetDate.getMonth();
    monthCounts[month]++;
  });

  const mostActiveMonth = {
    month: monthNames[monthCounts.indexOf(Math.max(...monthCounts))],
    count: Math.max(...monthCounts),
  };

  // Calculate hashtag statistics
  const hashtagCounts: Record<string, number> = {};
  yearTweets.forEach((tweet) => {
    if (tweet.entities && tweet.entities.hashtags) {
      tweet.entities.hashtags.forEach((tag) => {
        if (tag.text) {
          const tagText = tag.text.toLowerCase();
          hashtagCounts[tagText] = (hashtagCounts[tagText] || 0) + 1;
        }
      });
    }
  });

  // Convert hashtag counts to array and sort
  const hashtagsArray = Object.entries(hashtagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  // Top 5 hashtags
  const topHashtags = hashtagsArray.slice(0, 5);

  // Calculate tweet engagement trends by month (if data spans multiple months)
  const engagementByMonth: Record<
    string,
    {
      posts: number;
      likes: number;
      retweets: number;
      engagement: number;
    }
  > = {};

  const monthFormatOptions = { month: "short", year: "numeric" } as const;

  yearTweets.forEach((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
    const monthYearKey = tweetDate.toLocaleDateString(
      "en-US",
      monthFormatOptions
    );

    if (!engagementByMonth[monthYearKey]) {
      engagementByMonth[monthYearKey] = {
        posts: 0,
        likes: 0,
        retweets: 0,
        engagement: 0,
      };
    }

    engagementByMonth[monthYearKey].posts += 1;
    engagementByMonth[monthYearKey].likes += tweet.favorite_count || 0;
    engagementByMonth[monthYearKey].retweets += tweet.retweet_count || 0;
  });

  // Calculate engagement rate for each month
  Object.keys(engagementByMonth).forEach((month) => {
    const data = engagementByMonth[month];
    data.engagement =
      data.posts > 0
        ? parseFloat(((data.likes + data.retweets) / data.posts).toFixed(1))
        : 0;
  });

  // Sort engagement by month chronologically
  const engagementTrends = Object.entries(engagementByMonth)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  // 1. Find the most viral tweet
  let viralTweet = null;
  if (yearTweets.length > 0) {
    const mostViralTweet = yearTweets.reduce((mostViral, tweet) => {
      const currentEngagement =
        (tweet.favorite_count || 0) + (tweet.retweet_count || 0);
      const previousEngagement =
        (mostViral.favorite_count || 0) + (mostViral.retweet_count || 0);
      return currentEngagement > previousEngagement ? tweet : mostViral;
    }, yearTweets[0]);

    // Format for display
    const viralEngagement =
      (mostViralTweet.favorite_count || 0) +
      (mostViralTweet.retweet_count || 0);
    const avgEngagement =
      totalPosts > 0 ? (totalLikes + totalRetweets) / totalPosts : 0;

    viralTweet = {
      text: mostViralTweet.full_text || mostViralTweet.text || "",
      date: new Date(
        mostViralTweet.tweet_created_at || mostViralTweet.created_at
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      likes: mostViralTweet.favorite_count || 0,
      retweets: mostViralTweet.retweet_count || 0,
      engagement: viralEngagement,
      engagementRatio:
        avgEngagement > 0
          ? parseFloat((viralEngagement / avgEngagement).toFixed(1))
          : 0,
    };
  }

  // 2. Analyze posting times
  const hourCounts = Array(24).fill(0);
  yearTweets.forEach((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
    const hour = tweetDate.getHours();
    hourCounts[hour]++;
  });

  // Find peak posting hour
  const peakHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
  const formattedPeakHour = new Date(
    2023,
    0,
    1,
    peakHourIndex
  ).toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });

  const hourlyDistribution = hourCounts.map((count, hour) => ({
    hour,
    count,
    percentage:
      totalPosts > 0 ? ((count / totalPosts) * 100).toFixed(1) + "%" : "0%",
    formattedHour: new Date(2023, 0, 1, hour).toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    }),
  }));

  // 3. Analyze tweet sources
  const sourceCounts: Record<string, number> = {};
  yearTweets.forEach((tweet) => {
    if (tweet.source) {
      // Extract app name from source HTML
      let sourceName = tweet.source;
      try {
        const match = sourceName.match(/>([^<]+)</);
        sourceName = match ? match[1] : "Twitter";
      } catch (error) {
        sourceName = "Twitter";
      }

      sourceCounts[sourceName] = (sourceCounts[sourceName] || 0) + 1;
    }
  });

  // Convert to array and sort
  const tweetSources = Object.entries(sourceCounts)
    .map(([source, count]) => ({
      source,
      count,
      percentage:
        totalPosts > 0 ? ((count / totalPosts) * 100).toFixed(1) + "%" : "0%",
    }))
    .sort((a, b) => b.count - a.count);

  // Content Strategy Insights (Tweet Length and Media Impact) removed

  // 6. Calculate consistency score based on days passed in the current year
  const daysWithTweets = Object.keys(tweetsByDate).length;

  // Calculate days passed in the current year
  const currentDate = new Date();
  const isCurrentYear = year === currentDate.getFullYear();

  // If it's the current year, use days passed so far; otherwise use full year
  const daysPassed = isCurrentYear
    ? Math.floor((currentDate - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24)) +
      1
    : daysInYear;

  const consistencyScore = parseFloat(
    ((daysWithTweets / daysPassed) * 100).toFixed(1)
  );

  // Calculate posting pattern regularity
  let regularityScore = 0;
  const dateKeys = Object.keys(tweetsByDate)
    .map((date) => new Date(date).getTime())
    .sort();

  if (dateKeys.length > 1) {
    const timeDiffs = [];
    for (let i = 1; i < dateKeys.length; i++) {
      timeDiffs.push(dateKeys[i] - dateKeys[i - 1]);
    }

    // Standard deviation of time differences (lower = more regular)
    const avgTimeDiff =
      timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
    const stdDevTimeDiff = Math.sqrt(
      timeDiffs.reduce(
        (sum, diff) => sum + Math.pow(diff - avgTimeDiff, 2),
        0
      ) / timeDiffs.length
    );

    // Normalize to a 0-100 score (higher = more consistent)
    regularityScore = Math.max(
      0,
      Math.min(100, 100 - stdDevTimeDiff / (24 * 60 * 60 * 1000))
    );

    // Cap at 100
    regularityScore = Math.min(100, parseFloat(regularityScore.toFixed(1)));
  }

  // 7. Calculate engagement efficiency
  const totalEngagement = totalLikes + totalRetweets;
  const engagementPerPost =
    totalPosts > 0 ? parseFloat((totalEngagement / totalPosts).toFixed(1)) : 0;
  const engagementPerDay = parseFloat(
    (totalEngagement / daysInYear).toFixed(1)
  );
  const efficiencyScore =
    averagePostsPerDay > 0
      ? parseFloat((engagementPerDay / averagePostsPerDay).toFixed(1))
      : 0;

  // 8. Analyze replies and conversations
  const replyCount = yearTweets.filter(
    (tweet) => tweet.in_reply_to_status_id_str || tweet.in_reply_to_user_id_str
  ).length;

  const replyPercentage =
    totalPosts > 0
      ? parseFloat(((replyCount / totalPosts) * 100).toFixed(1))
      : 0;

  // Identify unique users replied to
  const uniqueUsersRepliedTo = new Set(
    yearTweets
      .filter((tweet) => tweet.in_reply_to_screen_name)
      .map((tweet) => tweet.in_reply_to_screen_name)
  );

  // 9. Analyze posting time effectiveness
  const hourlyEngagement: Record<
    number,
    { count: number; engagement: number }
  > = {};
  for (let i = 0; i < 24; i++) {
    hourlyEngagement[i] = { count: 0, engagement: 0 };
  }

  yearTweets.forEach((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
    const hour = tweetDate.getHours();
    const engagement = (tweet.favorite_count || 0) + (tweet.retweet_count || 0);

    hourlyEngagement[hour].count++;
    hourlyEngagement[hour].engagement += engagement;
  });

  // Calculate average engagement per hour
  const hourlyEngagementAvg = Object.entries(hourlyEngagement)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      formattedHour: new Date(2023, 0, 1, parseInt(hour)).toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          hour12: true,
        }
      ),
      count: data.count,
      avgEngagement:
        data.count > 0
          ? parseFloat((data.engagement / data.count).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  // Find optimal posting time (hour with highest engagement)
  const optimalPostingTime =
    hourlyEngagementAvg.length > 0
      ? hourlyEngagementAvg[0]
      : {
          hour: 0,
          formattedHour: "12 AM",
          avgEngagement: 0,
        };

  // 10. Determine Twitter personality type
  let personalityType = "";
  let personalityDescription = "";

  if (replyPercentage > 50) {
    personalityType = "Conversationalist";
    personalityDescription =
      "You love engaging in conversations and building connections on Twitter.";
  } else if (consistencyScore > 70) {
    personalityType = "Consistent Creator";
    personalityDescription =
      "You're a reliable presence, consistently sharing content with your audience.";
  } else if (bestStreak > 14) {
    personalityType = "Dedicated Tweeter";
    personalityDescription =
      "You're committed to your Twitter presence, maintaining impressive posting streaks.";
  } else if (efficiencyScore > 5) {
    personalityType = "Engagement Optimizer";
    personalityDescription =
      "You generate high engagement with relatively few tweets - quality over quantity.";
  } else {
    personalityType = "Casual Contributor";
    personalityDescription =
      "You use Twitter on your own terms, sharing thoughts when inspiration strikes.";
  }

  return {
    totalPosts,
    bestStreak,
    bestStreakPeriod,
    currentStreak: isCurrentStreak ? currentStreak : 0,
    averagePostsPerDay,
    bestDay,
    userJoinYear: joinYear,
    averageEngagement,
    mostActiveDayOfWeek,
    mostActiveMonth,
    topHashtags,
    engagementTrends,
    // New stats
    viralTweet,
    postingTimeAnalysis: {
      peakHour: formattedPeakHour,
      hourlyDistribution,
    },
    tweetSources,
    consistencyMetrics: {
      daysWithTweets,
      daysPassed,
      consistencyScore,
      regularityScore,
    },
    engagementEfficiency: {
      engagementPerPost,
      engagementPerDay,
      efficiencyScore,
    },
    conversationMetrics: {
      replyCount,
      replyPercentage,
      uniqueConversations: uniqueUsersRepliedTo.size,
    },
    tweetTimingEffectiveness: {
      optimalPostingTime,
      hourlyEngagementData: hourlyEngagementAvg,
    },
    twitterPersonality: {
      type: personalityType,
      description: personalityDescription,
    },
  };
}

// First, define an interface for our API response
interface TwitterStatsResponse {
  contributionGraph: {
    graph: Array<
      Array<{
        date: string;
        count: number;
        level: number;
        month: number;
        day: number;
        weekday: number;
      }>
    >;
    monthRanges: Array<{
      month: number;
      startWeek: number;
      endWeek: number;
    }>;
  };
  totalPosts: number;
  bestStreak: number;
  bestStreakPeriod: string | null;
  currentStreak: number;
  averagePostsPerDay: number;
  bestDay: { date: string; count: number } | null;
  userJoinYear: number;
  averageEngagement: {
    likes: number;
    retweets: number;
    replies: number;
    views: number;
  };
  mostActiveDayOfWeek: { day: string; count: number };
  mostActiveMonth: { month: string; count: number };
  topHashtags: Array<{ tag: string; count: number }>;
  engagementTrends: Array<{
    month: string;
    posts: number;
    likes: number;
    retweets: number;
    engagement: number;
  }>;
  // New stats
  viralTweet: {
    text: string;
    date: string;
    likes: number;
    retweets: number;
    engagement: number;
    engagementRatio: number;
  } | null;
  postingTimeAnalysis: {
    peakHour: string;
    hourlyDistribution: Array<{
      hour: number;
      count: number;
      percentage: string;
      formattedHour: string;
    }>;
  };
  tweetSources: Array<{
    source: string;
    count: number;
    percentage: string;
  }>;

  consistencyMetrics: {
    daysWithTweets: number;
    daysPassed: number;
    consistencyScore: number;
    regularityScore: number;
  };
  engagementEfficiency: {
    engagementPerPost: number;
    engagementPerDay: number;
    efficiencyScore: number;
  };
  conversationMetrics: {
    replyCount: number;
    replyPercentage: number;
    uniqueConversations: number;
  };
  tweetTimingEffectiveness: {
    optimalPostingTime: {
      hour: number;
      formattedHour: string;
      avgEngagement: number;
    };
    hourlyEngagementData: Array<{
      hour: number;
      formattedHour: string;
      count: number;
      avgEngagement: number;
    }>;
  };
  twitterPersonality: {
    type: string;
    description: string;
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const yearParam = searchParams.get("year");
  const apiKey = searchParams.get("apiKey");
  const refresh = searchParams.get("refresh") === "true"; // New parameter to force refresh

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 400 });
  }

  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
  const stopDate = new Date(year - 1, 11, 31); // Get tweets from at least the previous year

  try {
    // Create unique cache keys for the user stats
    const statsCacheKey = `twitter:stats:${username.toLowerCase()}:${year}`;

    // Try to get cached stats first (unless refresh is requested)
    if (!refresh) {
      const cachedStats = await redis.get(statsCacheKey);
      if (cachedStats) {
        console.log(`Serving ${username}'s stats for ${year} from cache...`);
        return NextResponse.json(cachedStats);
      }
    } else {
      console.log(
        `Refresh requested, skipping cache for ${username} (${year})`
      );
    }

    // Fetch the user profile to ensure the user exists
    const userProfile = await fetchTwitterProfile(username, apiKey);

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch tweets with a stop date to limit how far back we go
    console.log(
      `Fetching tweets for ${username} until ${stopDate.toISOString()}`
    );
    const userTweets = await fetchTweetsFromUser(
      username,
      stopDate,
      undefined,
      undefined,
      false,
      apiKey
    );

    // Generate contribution graph and calculate stats
    const contributionData = generateContributionGraph(userTweets, year);
    const userStats = calculateUserStats(userTweets, year);

    // Combine data
    const result: TwitterStatsResponse = {
      contributionGraph: contributionData,
      ...userStats,
    };

    // Cache the stats using our CACHE_TTL.STATS constant (8 hours)
    await writeToCache(statsCacheKey, result, CACHE_TTL.STATS);
    console.log(
      `Cached stats for ${username} for ${year} with ${
        CACHE_TTL.STATS / 3600
      }-hour TTL`
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error in Twitter stats API route:", error);

    // Return appropriate error response
    if (
      error instanceof Error &&
      error.message?.includes("Rate limit exceeded")
    ) {
      return NextResponse.json(
        { error: "Twitter API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch Twitter stats",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
