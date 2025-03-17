import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const API_KEY = process.env.SOCIALDATA_API_KEY;

async function fetchTweets(username: string) {
  // Create a query for the specific username
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    // Create a unique cache key for each username
    const cacheKey = `tweets:${username.toLowerCase()}`;

    // Check if cached in Redis
    const cachedTweets = await redis.get(cacheKey);
    if (cachedTweets) {
      console.log(`Serving ${username}'s tweets from cache...`);
      return NextResponse.json(cachedTweets);
    }

    // Fetch from Twitter API
    console.log(`Fetching fresh tweets for ${username}...`);
    const tweets = await fetchTweets(username);

    // Store in Redis cache for 5 minutes
    await redis.setex(cacheKey, 300, tweets);
    console.log(`Cached ${tweets.length} tweets for ${username}`);

    return NextResponse.json(tweets);
  } catch (error) {
    console.error("Error in Twitter API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweets" },
      { status: 500 }
    );
  }
}
