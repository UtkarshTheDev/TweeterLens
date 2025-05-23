import { Redis } from "@upstash/redis";
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

// Create a function to get a KY instance with the provided API key and improved retry logic
export function getApiClient(apiKey: string) {
  return ky.extend({
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    timeout: 30000, // 30 seconds timeout
    retry: {
      limit: 3,
      methods: ["get", "post", "put", "patch", "head", "delete"],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
      afterStatusCodes: [500, 502, 503, 504],
    },
    hooks: {
      beforeRetry: [
        async ({ retryCount, error }) => {
          const isTimeoutError = error && error.name === "TimeoutError";

          // Handle different error types safely
          let errorMessage = "unknown error";
          if (isTimeoutError) {
            errorMessage = "timeout";
          } else if (error) {
            // Try to extract status code if available
            // @ts-expect-error - ky error types are complex
            const status = error.response?.status || error.status;
            errorMessage = status
              ? `HTTP ${status} error`
              : error.message || "network error";
          }

          console.log(
            `Retrying request (attempt ${
              retryCount + 1
            }) due to ${errorMessage}`
          );

          // Exponential backoff with jitter
          const baseWaitTime = 1000 * Math.pow(2, retryCount);
          const jitter = Math.random() * 1000; // Add up to 1 second of jitter
          const waitTime = Math.min(baseWaitTime + jitter, 15000); // Cap at 15 seconds

          await new Promise((resolve) => setTimeout(resolve, waitTime));
        },
      ],
    },
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

/**
 * Improved throttle implementation with better rate limiting
 * This implementation uses a sliding window approach to ensure we don't exceed
 * the rate limits while maximizing throughput
 */
export function createThrottle(
  maxRequestsPerInterval: number,
  interval: number
) {
  let requestTimestamps: number[] = [];
  let isThrottleWarningShown = false;

  return async function throttle<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Remove timestamps outside the interval window
    requestTimestamps = requestTimestamps.filter(
      (timestamp) => now - timestamp < interval
    );

    // Calculate current rate (requests per second)
    const currentRate = requestTimestamps.length / (interval / 1000);

    if (requestTimestamps.length >= maxRequestsPerInterval) {
      // Calculate wait time based on oldest request in the window
      const oldestTimestamp = requestTimestamps[0];
      const waitTime = interval - (now - oldestTimestamp) + 100; // Add 100ms buffer

      // Only show warning once to avoid log spam
      if (!isThrottleWarningShown) {
        console.log(
          `Rate limit approaching (${requestTimestamps.length}/${maxRequestsPerInterval} requests, ` +
            `${currentRate.toFixed(2)} req/sec). Throttling for ${Math.round(
              waitTime
            )}ms`
        );
        isThrottleWarningShown = true;

        // Reset warning flag after a while
        setTimeout(() => {
          isThrottleWarningShown = false;
        }, 5000);
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return throttle(fn); // Try again after waiting
    }

    // If we're approaching the limit (80%), add a small delay to smooth out requests
    if (requestTimestamps.length > maxRequestsPerInterval * 0.8) {
      const delayMs = Math.floor(interval / maxRequestsPerInterval);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // Add current timestamp to the queue
    requestTimestamps.push(now);

    // Reset warning flag when we're well below the limit
    if (requestTimestamps.length < maxRequestsPerInterval * 0.5) {
      isThrottleWarningShown = false;
    }

    // Execute the function
    try {
      return await fn();
    } catch (error) {
      // If we get a rate limit error, wait longer next time
      if (error instanceof Error && error.message.includes("429")) {
        console.log("Rate limit hit, increasing throttle delay");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      throw error;
    }
  };
}

// Create throttle instance with more conservative limits
// Twitter API typically allows 300 requests per 15 minutes (900 seconds)
// We'll use 280 requests per 900 seconds to be safe
export const throttle = createThrottle(280, 900000);

/**
 * Enhanced cache functions with better error handling and TTL management
 */

// Default TTL values for different types of data (all set to 8 hours as requested)
export const CACHE_TTL = {
  TWEETS: 28800, // 8 hours for tweets (was 24 hours)
  PROFILE: 28800, // 8 hours for profiles (was 1 hour)
  STATS: 28800, // 8 hours for stats (was 30 minutes)
  DEFAULT: 28800, // 8 hours default (was 1 hour)
};

// Read data from cache with type safety
export async function readFromCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data as T | null;
  } catch (error) {
    console.error(`Error reading from cache for key ${key}:`, error);
    return null;
  }
}

// Write data to cache with appropriate TTL
export async function writeToCache(
  key: string,
  value: unknown,
  ttlSeconds = CACHE_TTL.DEFAULT
): Promise<void> {
  try {
    // Don't cache null or undefined values
    if (value === null || value === undefined) {
      console.log(`Skipping cache write for ${key} - value is null/undefined`);
      return;
    }

    // For large objects, log the size
    const valueSize = JSON.stringify(value).length;
    if (valueSize > 1000000) {
      // 1MB
      console.log(
        `Caching large object (${Math.round(
          valueSize / 1024
        )}KB) for key ${key}`
      );
    }

    await redis.setex(key, ttlSeconds, value);
    console.log(`Cached data for ${key} with TTL ${ttlSeconds}s`);
  } catch (error) {
    console.error(`Error writing to cache for key ${key}:`, error);
  }
}

// Delete data from cache
export async function deleteFromCache(key: string): Promise<void> {
  try {
    await redis.del(key);
    console.log(`Deleted cache for key ${key}`);
  } catch (error) {
    console.error(`Error deleting from cache for key ${key}:`, error);
  }
}

// Twitter profile functions with improved caching
export async function getCachedTwitterProfile(
  name: string
): Promise<TwitterUser | null> {
  const key = `twitter-profile-${name.toLowerCase()}`;
  const cached = await readFromCache<TwitterUser>(key);

  // Validate the cached profile has required fields
  if (!cached || !("name" in cached) || !("id_str" in cached)) {
    return null;
  }

  return cached;
}

// We're now using the ky client with built-in retry logic instead of this function

/**
 * Fetch Twitter profile with improved caching and error handling
 * This function uses the optimized retry logic and caching
 */
export async function fetchTwitterProfile(
  name: string,
  apiKey: string
): Promise<TwitterUser | null> {
  // Normalize username to lowercase for consistent caching
  const normalizedName = name.toLowerCase();

  // Try to get from cache first
  const cached = await getCachedTwitterProfile(normalizedName);
  if (cached) {
    console.log(`Using cached profile for ${normalizedName}`);
    return cached;
  }

  try {
    console.log(`Fetching Twitter profile for ${normalizedName}`);

    // Use our optimized API client instead of direct fetch
    const client = getApiClient(apiKey);
    const response = await client.get(
      `https://api.socialdata.tools/twitter/user/${normalizedName}`
    );

    // Parse the response
    const data = (await response.json()) as TwitterUser;

    // Validate the profile data
    if (!data || !data.id_str || !data.screen_name) {
      console.error(`Invalid profile data received for ${normalizedName}`);
      return null;
    }

    // Cache the profile with appropriate TTL
    const profileKey = `twitter-profile-${normalizedName}`;
    await writeToCache(profileKey, data, CACHE_TTL.PROFILE);

    return data;
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      // Check for 404 (user not found)
      if (error.message.includes("404")) {
        console.log(`User not found: ${normalizedName}`);
        return null;
      }

      // Check for rate limit
      if (error.message.includes("429")) {
        console.error(
          `Rate limit exceeded fetching profile for ${normalizedName}`
        );
        throw new Error(
          `Rate limit exceeded fetching profile for ${normalizedName}`
        );
      }
    }

    console.error(
      `Error fetching Twitter profile for ${normalizedName}:`,
      error
    );
    throw error;
  }
}

// Tweet cache functions with improved TTL management
export async function getCachedTweets(
  name: string
): Promise<PartialTweet[] | null> {
  const key = `twitter-tweets-${name.toLowerCase()}`;
  return await readFromCache<PartialTweet[]>(key);
}

export async function setCachedTweets(
  name: string,
  tweets: PartialTweet[]
): Promise<void> {
  if (!tweets || tweets.length === 0) {
    console.log(`Not caching empty tweets array for ${name}`);
    return;
  }

  const key = `twitter-tweets-${name.toLowerCase()}`;

  // Use longer TTL for larger collections (more valuable data)
  let ttl = CACHE_TTL.TWEETS;
  if (tweets.length > 1000) {
    ttl = CACHE_TTL.TWEETS * 2; // Double TTL for large collections
    console.log(
      `Using extended TTL (${ttl}s) for large tweet collection (${tweets.length} tweets)`
    );
  }

  await writeToCache(key, tweets, ttl);
}

export async function clearCachedTweets(name: string): Promise<void> {
  const key = `twitter-tweets-${name.toLowerCase()}`;
  await deleteFromCache(key);
  console.log(`Cleared tweet cache for ${name}`);
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
  collection: Map<string, PartialTweet>;
  stopDate?: Date;
  callback?: (collection: PartialTweet[]) => void;
  maxPages?: number;
  apiKey: string;
  initialMaxId?: string; // Initial max_id to start pagination with
}

/**
 * Optimized function to fetch tweets from a user using the efficient approach
 * from tweets.js implementation. This uses a simpler max_id based pagination
 * to avoid duplicate API calls and reduce credit usage.
 */
async function fetchFromSocialData(
  input: FetchFromSocialDataInput
): Promise<void> {
  // Initialize parameters
  const maxPages = input.maxPages || SAFETY_STOP;
  let maxId: string | undefined = input.initialMaxId; // Use initialMaxId if provided
  let previousMaxId: string | undefined = undefined;
  let pageCount = 0;

  // Track API calls for debugging
  let apiCallCount = 0;

  // If we're starting with a max_id, log it
  if (maxId) {
    console.log(`Starting fetch with initial max_id=${maxId}`);
  }

  // Main fetching loop - simplified from tweets.js
  while (pageCount < maxPages) {
    pageCount++;
    apiCallCount++;

    try {
      // Construct query based on whether we have a max_id
      // This is the key optimization from tweets.js - using max_id for pagination
      const query = maxId
        ? `from:${input.username} max_id:${maxId}`
        : `from:${input.username}`;

      // Build the URL for the social data API - only using search endpoint
      const url = `${HOST_URL}${SEARCH_ENDPOINT}?query=${encodeURIComponent(
        query
      )}&type=Latest`;

      console.log(
        `Fetching tweets (page ${pageCount}/${maxPages}, API call #${apiCallCount}): ${url}`
      );

      // Make the API request using the API client
      console.log(`Making API call to Social Data API: ${url}`);
      const startTime = Date.now();
      const response = await getApiClient(input.apiKey).get(url);
      const endTime = Date.now();
      console.log(`API call completed in ${endTime - startTime}ms`);
      const status = response.status;

      // Handle non-200 status codes
      if (status !== 200) {
        if (status === 429) {
          console.log("Rate limit exceeded, waiting 15 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 15000));
          pageCount--; // Don't count this as a page since we're retrying
          apiCallCount--; // Don't count failed requests
          continue;
        } else if (status === 402) {
          // Handle payment required error - use what we've collected so far
          console.log("402 Payment Required - API subscription limit reached");

          // Cache what we have before throwing error
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

      // Parse the response
      const data = (await response.json()) as SuccessResponse;
      const tweets = data.tweets || [];

      // Handle empty batches - if we get no tweets, we're done
      if (tweets.length === 0) {
        console.log("Empty batch received, no more tweets to fetch");
        break;
      }

      // Process tweets and update our collection
      let newTweetsCount = 0;

      // Find the smallest ID in this batch for next pagination
      if (tweets.length === 0) {
        // This shouldn't happen as we check for empty batches above
        console.log("No tweets in batch to process");
        break;
      }

      let smallestId = tweets[0].id_str;

      // Normalize and add tweet timestamps for consistency
      tweets.forEach((tweet: PartialTweet) => {
        // Find smallest ID for pagination
        if (BigInt(tweet.id_str) < BigInt(smallestId)) {
          smallestId = tweet.id_str;
        }

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
        `Progress: ${input.username}, page ${pageCount}, collected ${array.length} tweets total, ${tweets.length} in batch, ${newTweetsCount} new ones added`
      );

      // Write partial results to cache every 5 pages or when we get a significant number of new tweets
      if (pageCount % 5 === 0 || newTweetsCount > 50) {
        console.log(`Saving partial cache (${array.length} tweets)`);
        if (array.length > 0) {
          await setCachedTweets(input.username, array);
        }
      }

      // Call progress callback if provided
      if (input.callback) {
        input.callback(array);
      }

      // If we didn't get any new tweets or we're not making progress, stop
      if (newTweetsCount === 0) {
        console.log("No new tweets in this batch, stopping");
        break;
      }

      // Update max_id for next iteration - decrement by 1 to exclude current smallest ID
      previousMaxId = maxId;
      maxId = (BigInt(smallestId) - BigInt(1)).toString();

      // If we're not making progress (same max_id), stop
      if (previousMaxId === maxId) {
        console.log(`No progress with max_id (${maxId}), stopping`);
        break;
      }

      console.log(`Using max_id=${maxId} for next page`);

      // Small delay to avoid hammering the API
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error fetching tweets for ${input.username}:`, error);

      // Save what we have so far before throwing
      const array = Array.from(input.collection.values());
      if (array.length > 0) {
        await setCachedTweets(input.username, array);
      }

      throw error;
    }
  }

  // Final cache update before returning
  const finalArray = Array.from(input.collection.values());
  if (finalArray.length > 0) {
    console.log(
      `Completed fetching. Saving final cache (${finalArray.length} tweets) after ${apiCallCount} API calls`
    );
    await setCachedTweets(input.username, finalArray);
  }

  if (pageCount >= maxPages) {
    console.log(`Reached maximum number of pages (${maxPages}), stopping`);
  }

  // Log summary of API usage for credit tracking
  console.log(`
=== TWITTER FETCH SUMMARY ===
Username: ${input.username}
Total API calls made: ${apiCallCount}
Total tweets collected: ${finalArray.length}
Approximate credits used: ${
    apiCallCount * 0.0002 * 20
  } (${apiCallCount} calls × ~20 tweets per call × $0.0002 per tweet)
============================
  `);
}

/**
 * Fetch tweets from a user with optimized caching and pagination
 * This is the main function that should be called by external code
 *
 * Implements the efficient approach from tweets.js to avoid double credit usage
 */
export async function fetchTweetsFromUser(
  name: string,
  stopDate?: Date,
  callback?: (collection: PartialTweet[]) => void,
  maxPages?: number,
  forceRefresh: boolean = false,
  apiKey: string = ""
): Promise<PartialTweet[]> {
  // Normalize username for consistent caching
  const normalizedName = name.toLowerCase();

  // Track API calls for debugging
  let apiCallsMade = 0;

  try {
    console.log(`Starting tweet fetch for ${normalizedName}`);

    // Clear cache if force refresh requested
    if (forceRefresh) {
      console.log(
        `Force refresh requested, clearing cache for ${normalizedName}`
      );
      await clearCachedTweets(normalizedName);
    }

    // Try to get tweets from cache first
    const cached = forceRefresh ? null : await getCachedTweets(normalizedName);

    if (cached && cached.length > 0) {
      console.log(`Found ${cached.length} cached tweets for ${normalizedName}`);
    } else {
      console.log(`No cached tweets found for ${normalizedName}`);
    }

    // Initialize collection with cached tweets if available
    const collection = new Map<string, PartialTweet>(
      cached?.map((tweet) => {
        // Ensure we're using id_str consistently
        const idKey = tweet.id_str || tweet.id;
        return [idKey, tweet];
      }) ?? []
    );

    // Get user profile to check total tweet count - only make this API call if needed
    let userProfile: TwitterUser | null = null;
    let totalTweets = 0;

    // Only fetch profile if we need to determine if we have enough tweets
    if (!cached || forceRefresh) {
      userProfile = await fetchTwitterProfile(normalizedName, apiKey);
      totalTweets = userProfile?.statuses_count || 0;
      apiCallsMade++;

      console.log(
        `User ${normalizedName} has ${totalTweets} tweets, we have ${collection.size} cached`
      );
    } else {
      console.log(
        `Using cached tweets for ${normalizedName} without fetching profile`
      );
    }

    // If we have all tweets and not forcing refresh, return cached tweets
    // Add a small buffer (5%) to account for deleted tweets or API inconsistencies
    if (totalTweets > 0) {
      const cacheThreshold = Math.floor(totalTweets * 0.95);
      if (
        collection.size >= cacheThreshold &&
        !forceRefresh &&
        cached?.length
      ) {
        console.log(
          `Returning ${
            collection.size
          } cached tweets for ${normalizedName} (${Math.round(
            (collection.size / totalTweets) * 100
          )}% of profile count)`
        );
        return Array.from(collection.values());
      }
    } else if (collection.size > 0 && !forceRefresh) {
      // If we don't know total tweets but have cached tweets, use them
      console.log(
        `Returning ${collection.size} cached tweets for ${normalizedName}`
      );
      return Array.from(collection.values());
    }

    // Calculate appropriate maxPages based on total tweets
    // Twitter typically allows access to ~3200 most recent tweets
    // With ~20 tweets per page, we need ~160 pages, but add buffer for safety
    const effectiveMaxPages =
      maxPages ||
      Math.min(
        SAFETY_STOP, // Don't exceed safety limit
        Math.max(200, Math.ceil((totalTweets || 3200) / 15) + 50) // At least 200 pages, or calculated + buffer
      );

    console.log(`Using maxPages: ${effectiveMaxPages} to fetch tweets`);

    // Find the oldest tweet ID if we have cached tweets to use as max_id
    // This is crucial for efficient pagination and avoiding duplicate tweets
    let initialMaxId: string | undefined = undefined;

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
      initialMaxId = (BigInt(smallestId) - BigInt(1)).toString();
      console.log(
        `Starting with max_id=${initialMaxId} from oldest cached tweet`
      );
    }

    // Start fetching tweets with optimized parameters
    await fetchFromSocialData({
      username: normalizedName,
      stopDate,
      collection,
      callback,
      maxPages: effectiveMaxPages,
      apiKey,
      initialMaxId, // Pass the initial max_id to start with
    });

    // Convert final collection to array
    const tweets = Array.from(collection.values());
    console.log(`Caching ${tweets.length} tweets for ${normalizedName}`);

    // Cache final result (already done in fetchFromSocialData, but ensure it's done)
    if (tweets.length > 0) {
      await setCachedTweets(normalizedName, tweets);
    }

    // Log coverage percentage
    if (totalTweets > 0) {
      const coverage = Math.round((tweets.length / totalTweets) * 100);
      console.log(
        `Fetched ${tweets.length}/${totalTweets} tweets (${coverage}% coverage) for ${normalizedName}`
      );
    } else {
      console.log(`Fetched ${tweets.length} tweets for ${normalizedName}`);
    }

    // Log final summary for the entire operation
    console.log(`
=== TWITTER FETCH OPERATION COMPLETE ===
Username: ${normalizedName}
Total tweets fetched: ${tweets.length}
API calls for profile: ${apiCallsMade}
Cache status: ${cached ? "Used cached data" : "No cache used"}
Force refresh: ${forceRefresh}
======================================
    `);

    return tweets;
  } catch (error) {
    console.error(`Error fetching tweets for user ${normalizedName}:`, error);

    // Try to return cached tweets if available, even if there was an error
    try {
      const cachedTweets = await getCachedTweets(normalizedName);
      if (cachedTweets && cachedTweets.length > 0) {
        console.log(
          `Returning ${cachedTweets.length} cached tweets after error`
        );
        return cachedTweets;
      }
    } catch (_) {
      console.log("Error fetching cached tweets after error:", _);
      // Ignore cache errors
    }

    throw error;
  }
}
