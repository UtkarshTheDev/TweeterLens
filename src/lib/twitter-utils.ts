import { Redis } from "@upstash/redis";
// @ts-expect-error - Redis import missing types but it works
import ky from "ky";

// Add a type declaration for the ky module
// declare module "ky" {
//   export interface Options extends RequestInit {
//     timeout?: number;
//     headers?: Record<string, string>;
//   }

//   export interface KyInstance {
//     get(url: string, options?: Options): Promise<Response>;
//     post(url: string, options?: Options): Promise<Response>;
//     extend(options: Options): KyInstance;
//   }

//   const extend: (options: Options) => KyInstance;
//   export default {
//     extend,
//   };
// }

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Add missing constants
export const HOST_URL = "https://api.socialdata.tools";
export const SEARCH_ENDPOINT = "/twitter/search";

// Constants
export const SAFETY_STOP = 300; // Increased from 100 to 300 to fetch more tweets - handles up to 6000 tweets

// Create a function to get a KY instance with the provided API key
export function getApiClient(apiKey: string) {
  // @ts-expect-error Using any type to avoid ky type issues
  return (ky as any).extend({
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    timeout: 30000,
  });
}

// Types
export interface TwitterUser {
  id_str: string;
  name: string;
  screen_name: string;
  profile_image_url_https: string;
  followers_count: number;
  friends_count: number;
  statuses_count: number;
  created_at: string;
  verified: boolean;
  description?: string;
  url?: string;
  favourites_count?: number;
}

export interface PartialTweet {
  id: string;
  id_str: string;
  full_text?: string;
  text?: string;
  created_at: string;
  tweet_created_at?: string;
  retweet_count?: number;
  favorite_count?: number;
  bookmark_count?: number;
  reply_count?: number;
  view_count?: number;
  views_count?: number;
  user?: TwitterUser;
  source?: string;
  entities?: {
    hashtags?: Array<{ text: string }>;
    user_mentions?: Array<{ screen_name: string; id_str: string }>;
    urls?: Array<{ expanded_url: string; display_url: string }>;
  };
  in_reply_to_status_id_str?: string;
  in_reply_to_screen_name?: string;
  in_reply_to_user_id_str?: string;
  lang?: string;
  truncated?: boolean;
}

interface SuccessResponse {
  tweets: PartialTweet[];
  next_cursor?: string;
}

interface ErrorResponse {
  status: number;
  message: string;
}

// Simple throttle implementation
export function createThrottle(
  maxRequestsPerInterval: number,
  interval: number
) {
  let requestTimestamps: number[] = [];

  return async function throttle<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Remove timestamps outside the interval window
    requestTimestamps = requestTimestamps.filter(
      (timestamp) => now - timestamp < interval
    );

    if (requestTimestamps.length >= maxRequestsPerInterval) {
      // Calculate wait time based on oldest request in the window
      const oldestTimestamp = requestTimestamps[0];
      const waitTime = interval - (now - oldestTimestamp);

      console.log(
        `Throttling request, waiting ${waitTime}ms, ${requestTimestamps.length} in queue`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return throttle(fn); // Try again after waiting
    }

    // Add current timestamp to the queue
    requestTimestamps.push(now);

    // Execute the function
    return await fn();
  };
}

// Create throttle instance
export const throttle = createThrottle(350, 70000); // 350 requests per 70 seconds

// Cache functions
export async function readFromCache<T>(key: string): Promise<T | null> {
  try {
    return (await redis.get(key)) as T | null;
  } catch (error) {
    console.error(`Error reading from cache for key ${key}:`, error);
    return null;
  }
}

export async function writeToCache(
  key: string,
  value: unknown,
  ttlSeconds = 3600
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, value);
  } catch (error) {
    console.error(`Error writing to cache for key ${key}:`, error);
  }
}

export async function deleteFromCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Error deleting from cache for key ${key}:`, error);
  }
}

// Twitter profile functions
export async function getCachedTwitterProfile(
  name: string
): Promise<TwitterUser | null> {
  const cached = await readFromCache<TwitterUser>(`twitter-profile-${name}`);
  if (!cached || !("name" in cached) || !("id_str" in cached)) {
    return null;
  }
  return cached;
}

// Add a new helper function for retrying API requests
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // Use the throttle mechanism to respect rate limits
      const response = await throttle(async () => {
        return await fetch(url, options);
      });

      return response;
    } catch (error) {
      attempt++;

      // If we've exceeded max retries, throw the error
      if (attempt > maxRetries) {
        throw error;
      }

      // Exponential backoff wait time
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(
        `Request error, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // This should never be reached due to the throw in the loop
  throw new Error(`Failed after ${maxRetries} retries`);
}

// Update the fetchTwitterProfile function to use fetchWithRetry
export async function fetchTwitterProfile(
  name: string,
  apiKey: string
): Promise<TwitterUser | null> {
  const cached = await getCachedTwitterProfile(name);
  if (cached) {
    return cached;
  }

  try {
    const userInfo = await fetchWithRetry(
      `https://api.socialdata.tools/twitter/user/${name}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!userInfo.ok) {
      if (userInfo.status === 429) {
        throw new Error(
          `Rate limit exceeded fetching ${name} ${userInfo.status}`
        );
      }
      if (userInfo.status === 404) {
        return null;
      }
      throw new Error(`API error: ${userInfo.status} ${userInfo.statusText}`);
    }

    const data = (await userInfo.json()) as TwitterUser;
    await writeToCache(`twitter-profile-${name}`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching Twitter profile for ${name}:`, error);
    throw error;
  }
}

// Tweet functions
export async function getCachedTweets(
  name: string
): Promise<PartialTweet[] | null> {
  return await readFromCache<PartialTweet[]>(`twitter-tweets-${name}`);
}

export async function setCachedTweets(
  name: string,
  tweets: PartialTweet[]
): Promise<void> {
  await writeToCache(`twitter-tweets-${name}`, tweets);
}

export async function clearCachedTweets(name: string): Promise<void> {
  await deleteFromCache(`twitter-tweets-${name}`);
  console.log(`Cleared cache for ${name}`);
}

/**
 * Get tweets for a specific user and year from cache
 */
export async function getCachedTweetsByYear(
  name: string,
  year: number
): Promise<PartialTweet[] | null> {
  const tweets = await getCachedTweets(name);
  if (!tweets) return null;

  // Filter tweets by the requested year
  return tweets.filter((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
    return tweetDate.getFullYear() === year;
  });
}

// Add this function to get available years from cached tweets
export async function getAvailableYearsFromCache(
  name: string
): Promise<number[] | null> {
  const tweets = await getCachedTweets(name);
  if (!tweets || !tweets.length) return null;

  // Extract years from tweets and return unique sorted array
  const years = tweets.map((tweet) => {
    const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
    return tweetDate.getFullYear();
  });

  return Array.from(new Set(years)).sort();
}

// Add interfaces for the function parameters
interface FetchFromSocialDataInput {
  username: string;
  max_id?: string;
  cursor?: string;
  runs?: number;
  collection: Map<string, PartialTweet>;
  stopDate?: Date;
  callback?: (collection: PartialTweet[]) => void;
  maxPages?: number;
  emptyBatchesCount?: number;
  previousSmallestId?: string;
  duplicateResponses?: Map<string, number>; // Track duplicate API responses
  previousResponses?: Set<string>; // Track hash signatures of previous API responses
  apiKey: string;
}

interface Tweet {
  id: string;
  id_str: string;
  tweet_created_at?: string;
  created_at: string;
  [key: string]: any;
}

async function fetchFromSocialData(
  input: FetchFromSocialDataInput
): Promise<void> {
  // Initialize parameters if not provided
  const runs = input.runs || 0;
  const maxPages = input.maxPages || SAFETY_STOP;
  const duplicateResponses =
    input.duplicateResponses || new Map<string, number>();
  const previousResponses = input.previousResponses || new Set<string>();
  const emptyBatchesCount = input.emptyBatchesCount || 0;

  // Safety check to prevent infinite recursion
  if (runs >= maxPages) {
    console.log(`Reached maximum number of pages (${maxPages}), stopping`);
    return;
  }

  if (emptyBatchesCount >= 3) {
    console.log(`Got ${emptyBatchesCount} consecutive empty batches, stopping`);
    return;
  }

  try {
    // Construct query based on whether we have a max_id
    const query = input.max_id
      ? `from:${input.username} max_id:${input.max_id}`
      : `from:${input.username}`;

    // Create a request signature to check if we've made this exact request before
    const requestSignature = `${query}-${input.cursor || ""}`;
    if (previousResponses.has(requestSignature)) {
      console.log(
        `Skipping duplicate request: ${HOST_URL}${SEARCH_ENDPOINT}?query=${encodeURIComponent(
          query
        )}${input.cursor ? `&next_cursor=${input.cursor}` : ""}`
      );

      // Instead of stopping, let's find a new max_id to continue
      if (input.collection.size > 0) {
        const tweets = Array.from(input.collection.values());

        // Sort tweets to find the smallest ID
        const sortedTweets = tweets.sort((a, b) => {
          const aId = BigInt(a.id_str || a.id);
          const bId = BigInt(b.id_str || b.id);
          return Number(aId - bId);
        });

        // Get the smallest ID and decrement it by 1 to fetch older tweets
        const smallestId = sortedTweets[0].id_str || sortedTweets[0].id;
        const newMaxId = (BigInt(smallestId) - BigInt(1)).toString();

        // If we're not progressing (same smallest ID), then stop
        if (input.previousSmallestId === newMaxId) {
          console.log(
            `Not progressing with new max_id (${newMaxId}), stopping`
          );
          return;
        }

        console.log(`Changing max_id to ${newMaxId} to continue fetching`);

        // Recursive call with new max_id and reset cursor
        return fetchFromSocialData({
          ...input,
          max_id: newMaxId,
          cursor: undefined,
          runs: runs + 1,
          previousSmallestId: newMaxId,
          duplicateResponses,
          previousResponses,
          emptyBatchesCount: 0, // Reset empty batches count
          apiKey: input.apiKey,
        });
      }
      return;
    }

    // Add current request to set of previous responses
    previousResponses.add(requestSignature);

    // Prepare request URL
    const options: any = {};

    // Build the URL for the social data API
    let url = `${HOST_URL}${SEARCH_ENDPOINT}?query=${encodeURIComponent(
      query
    )}&type=Latest`;
    if (input.cursor) {
      url += `&next_cursor=${input.cursor}`;
    }

    console.log(`Fetching tweets from ${url}`);

    // Make the API request
    const response = await getApiClient(input.apiKey).get(url, options);
    const status = response.status;

    // If we hit a rate limit issue or error
    if (status !== 200) {
      if (status === 429) {
        console.log("Rate limit exceeded, waiting 15 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 15000));
        return fetchFromSocialData(input); // Retry the same request
      } else if (status === 402) {
        // Handle payment required error - we'll use what we've collected so far
        console.log("402 Payment Required - API subscription limit reached");

        // Set cached tweets with what we have so far before throwing error
        const array = Array.from(input.collection.values());
        if (array.length > 0) {
          await setCachedTweets(input.username, array);
        }

        throw new Error(
          "402 Payment Required - API subscription limit reached"
        );
      } else {
        throw new Error(`API returned status ${status}`);
      }
    }

    const data = await response.json();
    const tweets = data.tweets || [];
    const nextCursor = data.next_cursor;

    // Check for duplicate responses by creating a signature of the tweet IDs
    const responseSignature = tweets.map((t: Tweet) => t.id_str).join(",");
    const duplicateCount = duplicateResponses.get(responseSignature) || 0;
    duplicateResponses.set(responseSignature, duplicateCount + 1);

    if (duplicateCount > 0) {
      console.log(`Repeated API response (same tweets) - finding new max_id`);

      // Get the smallest tweet ID in the batch to use as next max_id
      if (tweets.length > 0) {
        // Sort to find smallest ID
        const sortedTweets = [...tweets].sort((a: Tweet, b: Tweet) => {
          const aId = BigInt(a.id_str);
          const bId = BigInt(b.id_str);
          return Number(aId - bId);
        });

        const smallestId = sortedTweets[0].id_str;
        const newMaxId = (BigInt(smallestId) - BigInt(1)).toString();

        console.log(`Trying with a new max_id: ${newMaxId}`);

        // Recursive call with new max_id
        return fetchFromSocialData({
          ...input,
          max_id: newMaxId,
          cursor: undefined, // Reset cursor when changing max_id
          runs: runs + 1,
          duplicateResponses,
          previousResponses,
          emptyBatchesCount: 0, // Reset empty batches count
          apiKey: input.apiKey,
        });
      }
    }

    // If we got an empty batch, increment the counter
    const newEmptyBatchesCount =
      tweets.length === 0 ? emptyBatchesCount + 1 : 0;

    // Process tweets and update our collection
    let newTweetsCount = 0;

    // Normalize and add tweet timestamps for consistency
    tweets.forEach((tweet: Tweet) => {
      // Normalize ID to always use id_str
      const idKey = tweet.id_str;

      // Add tweet created_at if needed
      if (!tweet.tweet_created_at) {
        tweet.tweet_created_at = tweet.created_at;
      }

      // If we haven't already collected this tweet
      if (!input.collection.has(idKey)) {
        // Check if the tweet is newer than our stop date
        if (input.stopDate) {
          const tweetDate = new Date(tweet.tweet_created_at);
          if (tweetDate < input.stopDate) {
            return; // Skip this tweet as it's older than our stop date
          }
        }

        // Add to collection
        input.collection.set(idKey, tweet);
        newTweetsCount++;
      }
    });

    // Log progress
    const array = Array.from(input.collection.values());
    console.log(
      `Fetching for ${input.username}, run ${runs}, collected ${array.length} tweets, ${tweets.length} in batch, ${newTweetsCount} new ones added`
    );

    // Write partial results to cache
    console.log("Setting partial cache");
    if (array.length > 0) {
      await setCachedTweets(input.username, array);
    }

    // Call progress callback if provided
    if (input.callback) {
      input.callback(array);
    }

    // Determine when to stop fetching
    let shouldStop = false;

    // Stop if there's no next cursor provided by the API
    if (!nextCursor) {
      console.log("No next_cursor in response, stopping");
      shouldStop = true;
    }

    // Stop if we got too many empty batches in a row
    if (newEmptyBatchesCount >= 3) {
      console.log("Too many empty batches, stopping");
      shouldStop = true;
    }

    // If duplicateCount is too high, we're likely in an infinite loop
    if (duplicateCount >= 2) {
      console.log("Same response returned multiple times, trying new approach");

      // Rather than stopping, let's try a different max_id approach like tweets.js
      if (tweets.length > 0) {
        // Sort to find smallest ID
        const sortedTweets = [...tweets].sort((a: Tweet, b: Tweet) => {
          const aId = BigInt(a.id_str);
          const bId = BigInt(b.id_str);
          return Number(aId - bId);
        });

        const smallestId = sortedTweets[0].id_str;
        const newMaxId = (BigInt(smallestId) - BigInt(1)).toString();

        // Recursive call with new max_id, following the tweets.js approach
        return fetchFromSocialData({
          ...input,
          max_id: newMaxId,
          cursor: undefined, // Reset cursor when changing max_id
          runs: runs + 1,
          duplicateResponses: new Map(), // Reset duplicate tracking
          previousResponses, // Keep previous responses
          emptyBatchesCount: 0, // Reset empty batches count
          apiKey: input.apiKey,
        });
      } else {
        shouldStop = true;
      }
    }

    // If we've decided to stop, just return
    if (shouldStop) {
      return;
    }

    // If we're here, we should continue fetching
    // Sleep for a moment to avoid hammering the API
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Continue with recursion
    return fetchFromSocialData({
      ...input,
      cursor: nextCursor,
      runs: runs + 1,
      duplicateResponses,
      previousResponses,
      emptyBatchesCount: newEmptyBatchesCount,
      apiKey: input.apiKey,
    });
  } catch (error) {
    console.error(`Error fetching tweets for ${input.username}:`, error);
    throw error;
  }
}

export async function fetchTweetsFromUser(
  name: string,
  stopDate?: Date,
  callback?: (collection: PartialTweet[]) => void,
  maxPages?: number,
  forceRefresh: boolean = false,
  apiKey: string = ""
): Promise<PartialTweet[]> {
  try {
    // Clear cache if force refresh requested
    if (forceRefresh) {
      await clearCachedTweets(name);
    }

    // Try to get tweets from cache first
    const cached = forceRefresh ? null : await getCachedTweets(name);

    // Initialize collection with cached tweets if available
    const collection = new Map<string, PartialTweet>(
      cached?.map((tweet) => {
        // Ensure we're using id_str consistently
        const idKey = tweet.id_str || tweet.id;
        return [idKey, tweet];
      }) ?? []
    );

    // Get user profile to check total tweet count
    const userProfile = await fetchTwitterProfile(name, apiKey);
    const totalTweets = userProfile?.statuses_count || 0;

    console.log(
      `User ${name} has ${totalTweets} tweets, we have ${collection.size} cached`
    );

    // If we have all tweets and not forcing refresh, return cached tweets
    if (collection.size >= totalTweets && !forceRefresh && cached?.length) {
      console.log(
        `Returning all ${collection.size} cached tweets for ${name} (matches profile count)`
      );
      return Array.from(collection.values());
    }

    // Find the oldest cached tweet to use as max_id for pagination
    let max_id: string | undefined = undefined;
    if (collection.size > 0) {
      // Convert collection to array for sorting
      const tweets = Array.from(collection.values());

      // Sort tweets by ID (ascending order) to find the oldest/smallest ID
      const sortedTweets = tweets.sort((a, b) => {
        const aId = BigInt(a.id_str || a.id);
        const bId = BigInt(b.id_str || b.id);
        return Number(aId - bId); // Smaller ID = older tweet
      });

      // Get the smallest ID (oldest tweet) and decrement by 1 to avoid including it again
      const smallestId = sortedTweets[0].id_str || sortedTweets[0].id;
      max_id = (BigInt(smallestId) - BigInt(1)).toString();
      console.log(`Starting with max_id: ${max_id} from oldest cached tweet`);
    }

    // Use a higher maxPages value to ensure we can get all tweets
    // The typical limit for user timelines is around 3200 tweets,
    // so with 20 tweets per page we'd need ~160 pages max
    const effectiveMaxPages =
      maxPages || Math.max(500, Math.ceil(totalTweets / 20) * 2);
    console.log(`Using maxPages: ${effectiveMaxPages} to fetch all tweets`);

    // Start fetching tweets with optimized parameters
    await fetchFromSocialData({
      username: name,
      stopDate,
      collection,
      max_id,
      callback,
      maxPages: effectiveMaxPages,
      // Start with empty tracking sets to avoid carrying over stale state
      duplicateResponses: new Map(),
      previousResponses: new Set(),
      apiKey,
    });

    // Convert final collection to array
    const tweets = Array.from(collection.values());
    console.log(`Caching ${tweets.length} tweets for ${name}`);

    // Cache final result
    await setCachedTweets(name, tweets);

    // Log coverage percentage
    const coverage =
      totalTweets > 0 ? Math.round((tweets.length / totalTweets) * 100) : 0;
    console.log(
      `Fetched ${tweets.length}/${totalTweets} tweets (${coverage}% coverage) for ${name}`
    );

    return tweets;
  } catch (error) {
    console.error(`Error fetching tweets for user ${name}:`, error);
    throw error;
  }
}
