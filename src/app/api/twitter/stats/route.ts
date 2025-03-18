import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const API_KEY = process.env.SOCIALDATA_API_KEY;

// Function to fetch tweets from Twitter API
async function fetchTweets(username: string) {
  const query = `from:${username}`;

  try {
    const response = await fetch(
      `https://api.socialdata.tools/twitter/search?query=${encodeURIComponent(
        query
      )}&type=Latest`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch tweets: ${response.status}`);
    }

    const data = await response.json();

    // Log the response structure for debugging
    console.log(`Fetched ${data.tweets?.length || 0} tweets for ${username}`);

    return data.tweets || [];
  } catch (error) {
    console.error("Error fetching tweets:", error);
    throw error;
  }
}

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
    const tweetDate = new Date(tweet.tweet_created_at);

    // Only count tweets from the specified year
    if (tweetDate.getFullYear() === year) {
      const dateKey = tweetDate.toISOString().split("T")[0];
      postsByDate[dateKey] = (postsByDate[dateKey] || 0) + 1;
    }
  });

  // Find the maximum posts in a day to calculate level percentages
  const maxPosts = Math.max(...Object.values(postsByDate), 1);

  // Calculate post counts by day of week and build the contribution grid
  const contributionGraph = [];

  // Get number of days in the year
  const daysInYear =
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;

  // Calculate the day of the week for Jan 1st
  const firstDayOfYearWeekday = new Date(year, 0, 1).getDay();

  // We need to organize the data in week columns
  // First, create a flat array of day data
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
    });
  }

  // Now organize into week columns (for the GitHub-style graph)
  // Each column represents a week
  const numWeeks = Math.ceil((daysInYear + firstDayOfYearWeekday) / 7);

  // Create empty weeks
  for (let w = 0; w < numWeeks; w++) {
    contributionGraph.push(
      Array(7)
        .fill(null)
        .map(() => ({ count: 0, level: 0, date: "" }))
    );
  }

  // Fill in the days
  let dayIndex = 0;

  // Add empty cells for days before the first day of the year
  for (let d = 0; d < firstDayOfYearWeekday; d++) {
    contributionGraph[0][d] = { count: 0, level: 0, date: "" };
  }

  // Fill in the actual days
  for (let d = 0; d < allDays.length; d++) {
    const weekIndex = Math.floor((d + firstDayOfYearWeekday) / 7);
    const dayOfWeek = (d + firstDayOfYearWeekday) % 7;

    if (weekIndex < numWeeks) {
      contributionGraph[weekIndex][dayOfWeek] = allDays[d];
    }
  }

  return contributionGraph;
}

// Calculate user statistics
function calculateUserStats(tweets: any[], year: number) {
  // Filter tweets for the specific year
  const yearTweets = tweets.filter((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at);
    return tweetDate.getFullYear() === year;
  });

  // Calculate total posts for the year
  const totalPosts = yearTweets.length;

  // Find the earliest tweet to determine join year
  let joinYear = year;
  if (tweets.length > 0) {
    const dates = tweets.map((t) => new Date(t.tweet_created_at));
    const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    joinYear = earliestDate.getFullYear();
  }

  // Group tweets by date to calculate streaks
  const tweetsByDate: Record<string, any[]> = {};
  yearTweets.forEach((tweet) => {
    const dateKey = new Date(tweet.tweet_created_at)
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const yearParam = searchParams.get("year");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  try {
    // Create unique cache keys for the user data and stats
    const userCacheKey = `twitter:user:${username.toLowerCase()}`;
    const statsCacheKey = `twitter:stats:${username.toLowerCase()}:${year}`;

    // Try to get cached stats first
    const cachedStats = await redis.get(statsCacheKey);
    if (cachedStats) {
      console.log(`Serving ${username}'s stats for ${year} from cache...`);
      return NextResponse.json(cachedStats);
    }

    // If no cached stats, check for cached user data
    let userTweets = (await redis.get(userCacheKey)) as any[] | null;

    // If no cached user data, fetch from Twitter API
    if (!userTweets) {
      console.log(`Fetching fresh tweets for ${username}...`);
      userTweets = await fetchTweets(username);

      // Cache user tweets for 1 hour (3600 seconds)
      if (userTweets && Array.isArray(userTweets) && userTweets.length > 0) {
        await redis.setex(userCacheKey, 3600, userTweets);
        console.log(`Cached ${userTweets.length} tweets for ${username}`);
      }
    } else {
      console.log(`Using cached tweets for ${username} to generate stats...`);
    }

    // Generate contribution graph and calculate stats
    const contributionGraph = generateContributionGraph(userTweets || [], year);
    const userStats = calculateUserStats(userTweets || [], year);

    // Combine data
    const result = {
      contributionGraph,
      ...userStats,
    };

    // Cache the stats for 5 minutes (300 seconds)
    await redis.setex(statsCacheKey, 300, result);
    console.log(`Cached stats for ${username} for ${year}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in Twitter stats API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter stats" },
      { status: 500 }
    );
  }
}
