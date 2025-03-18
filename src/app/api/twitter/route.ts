import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis for caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Environment variables and constants
const API_KEY = process.env.SOCIALDATA_API_KEY;
const SAFETY_STOP = 100; // Max pages to fetch to prevent infinite loops

// Function to fetch all tweets for a given username
async function fetchTweets(username: string) {
  const collection = new Map<string, any>(); // Store tweets in a Map to avoid duplicates
  let page = 0; // Track the number of pages fetched
  let hasMore = true; // Flag to continue pagination
  let nextCursor: string | null = null; // Pagination cursor from API
  let previousSize = 0; // Track collection size before adding new tweets

  while (hasMore && page < SAFETY_STOP) {
    // Build the API query
    const query = `from:${username}`;
    const queryParams = new URLSearchParams({ query, type: "Latest" });
    if (nextCursor) {
      queryParams.append("next_cursor", nextCursor);
    }

    try {
      // Fetch tweets from the API
      const response = await fetch(
        `https://api.socialdata.tools/twitter/search?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            Accept: "application/json",
          },
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch tweets: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();
      const tweets = data.tweets || [];

      // Log progress for debugging
      console.log(`Fetched ${tweets.length} tweets for ${username}, page ${page + 1}`);

      // Add tweets to the collection using id_str as the key
      tweets.forEach((tweet: any) => collection.set(tweet.id_str, tweet));

      // Check if any new tweets were added
      if (collection.size === previousSize) {
        console.log("No new tweets added, stopping fetch.");
        hasMore = false; // No new tweets, stop fetching
      } else {
        previousSize = collection.size; // Update the previous size
        if (data.next_cursor) {
          nextCursor = data.next_cursor; // Move to the next page
        } else {
          hasMore = false; // No more tweets to fetch
        }
      }

      page++; // Increment page count
    } catch (error) {
      console.error("Error fetching tweets:", error);
      throw error;
    }
  }

  // Warn if we hit the safety limit
  if (page >= SAFETY_STOP) {
    console.warn(`Reached safety stop after ${page} pages for ${username}`);
  }

  // Return all collected tweets as an array
  return Array.from(collection.values());
}

// API route handler
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  // Validate username
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Create a cache key based on username
  const cacheKey = `tweets:${username.toLowerCase()}`;

  try {
    // Check if tweets are cached in Redis
    const cachedTweets = await redis.get(cacheKey);
    if (cachedTweets) {
      console.log(`Serving ${username}'s tweets from cache...`);
      return NextResponse.json(cachedTweets);
    }

    // Fetch fresh tweets if not cached
    console.log(`Fetching fresh tweets for ${username}...`);
    const tweets = await fetchTweets(username);

    // Cache the tweets for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, tweets);
    console.log(`Cached ${tweets.length} tweets for ${username}`);

    // Return the tweets
    return NextResponse.json(tweets);
  } catch (error) {
    console.error("Error in Twitter API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweets" },
      { status: 500 }
    );
  }
}
