import { NextResponse } from "next/server";
import {
  redis,
  fetchTweetsFromUser,
  fetchTwitterProfile,
} from "@/lib/twitter-utils";

// Generate contribution graph for a specific year
function generateContributionGraph(tweets: any[], year: number) {
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
  let currentDate = new Date(startDate);
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
function calculateUserStats(tweets: any[], year: number) {
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
  const tweetsByDate: Record<string, any[]> = {};
  yearTweets.forEach((tweet) => {
    const dateKey = new Date(tweet.tweet_created_at || tweet.created_at)
      .toISOString()
      .split("T")[0];
    if (!tweetsByDate[dateKey]) {
      tweetsByDate[dateKey] = [];
    }
    tweetsByDate[dateKey].push(tweet);
  });

  // Calculate best streak
  const dates = Object.keys(tweetsByDate).sort();
  let currentStreak = 0;
  let bestStreak = 0;

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const currentDate = new Date(dates[i]);
      const prevDate = new Date(dates[i - 1]);

      // Check if dates are consecutive
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }

    bestStreak = Math.max(bestStreak, currentStreak);
  }

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

  return {
    totalPosts,
    bestStreak,
    averagePostsPerDay,
    bestDay,
    userJoinYear: joinYear,
  };
}

// First, define an interface for our API response
interface TwitterStatsResponse {
  contributionGraph: {
    graph: any[][];
    monthRanges: Array<{
      month: number;
      startWeek: number;
      endWeek: number;
    }>;
  };
  totalPosts: number;
  bestStreak: number;
  averagePostsPerDay: number;
  bestDay: { date: string; count: number } | null;
  userJoinYear: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const yearParam = searchParams.get("year");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
  const stopDate = new Date(year - 1, 11, 31); // Get tweets from at least the previous year

  try {
    // Create unique cache keys for the user stats
    const statsCacheKey = `twitter:stats:${username.toLowerCase()}:${year}`;

    // Try to get cached stats first
    const cachedStats = await redis.get(statsCacheKey);
    if (cachedStats) {
      console.log(`Serving ${username}'s stats for ${year} from cache...`);
      return NextResponse.json(cachedStats);
    }

    // Fetch the user profile to ensure the user exists
    const userProfile = await fetchTwitterProfile(username);

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch tweets with a stop date to limit how far back we go
    console.log(
      `Fetching tweets for ${username} until ${stopDate.toISOString()}`
    );
    const userTweets = await fetchTweetsFromUser(username, stopDate);

    // Generate contribution graph and calculate stats
    const contributionData = generateContributionGraph(userTweets, year);
    const userStats = calculateUserStats(userTweets, year);

    // Combine data
    const result: TwitterStatsResponse = {
      contributionGraph: contributionData,
      ...userStats,
    };

    // Cache the stats for 5 minutes (300 seconds)
    await redis.setex(statsCacheKey, 300, result);
    console.log(`Cached stats for ${username} for ${year}`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in Twitter stats API route:", error);

    // Return appropriate error response
    if (error.message?.includes("Rate limit exceeded")) {
      return NextResponse.json(
        { error: "Twitter API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch Twitter stats", message: error.message },
      { status: 500 }
    );
  }
}
