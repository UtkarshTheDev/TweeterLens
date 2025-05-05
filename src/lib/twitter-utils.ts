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
            // @ts-ignore - ky error types are complex
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
 * Optimized function to fetch tweets from a user using a more efficient approach
 * based on the tweets.js implementation. This uses a loop-based approach instead of
 * recursion for better performance and easier debugging.
 */
async function fetchFromSocialData(
  input: FetchFromSocialDataInput
): Promise<void> {
  // Initialize parameters
  const maxPages = input.maxPages || SAFETY_STOP;
  let cursor: string | undefined = undefined;
  let maxId: string | undefined = input.initialMaxId; // Use initialMaxId if provided
  let previousMaxId: string | undefined = undefined;
  let pageCount = 0;
  let consecutiveEmptyBatches = 0;

  // If we're starting with a max_id, log it
  if (maxId) {
    console.log(`Starting fetch with initial max_id=${maxId}`);
  }

  // Track processed requests to avoid duplicates
  const processedRequests = new Set<string>();

  // Track batch signatures to detect duplicate batches
  const batchSignatures = new Set<string>();

  // Main fetching loop
  while (pageCount < maxPages) {
    pageCount++;

    try {
      // Construct query based on whether we have a max_id
      // This is the key optimization from tweets.js - using max_id for pagination
      const query = maxId
        ? `from:${input.username} max_id:${maxId}`
        : `from:${input.username}`;

      // Create a request signature to avoid duplicate requests
      const requestSignature = `${query}-${cursor || ""}`;
      if (processedRequests.has(requestSignature)) {
        console.log(`Skipping duplicate request: ${requestSignature}`);

        // If we're getting duplicate requests, we need to adjust our strategy
        if (maxId === previousMaxId) {
          console.log(`No progress with max_id (${maxId}), stopping`);
          break;
        }

        // Try a different approach - find the smallest ID in our collection
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
          previousMaxId = maxId;
          maxId = (BigInt(smallestId) - BigInt(1)).toString();
          cursor = undefined; // Reset cursor when changing max_id

          console.log(
            `Changing strategy: using max_id=${maxId} to fetch older tweets`
          );
          continue; // Skip to next iteration with new max_id
        } else {
          break; // No tweets to work with, stop fetching
        }
      }

      // Add current request to processed set
      processedRequests.add(requestSignature);

      // Build the URL for the social data API
      let url = `${HOST_URL}${SEARCH_ENDPOINT}?query=${encodeURIComponent(
        query
      )}&type=Latest`;
      if (cursor) {
        url += `&next_cursor=${cursor}`;
      }

      console.log(`Fetching tweets (page ${pageCount}/${maxPages}): ${url}`);

      // Make the API request using the API client
      const response = await getApiClient(input.apiKey).get(url);
      const status = response.status;

      // Handle non-200 status codes
      if (status !== 200) {
        if (status === 429) {
          console.log("Rate limit exceeded, waiting 15 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 15000));
          pageCount--; // Don't count this as a page since we're retrying
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
      const nextCursor = data.next_cursor;

      // Create a signature of this batch to detect duplicates
      const batchSignature = tweets.map((t) => t.id_str).join(",");

      // Check if we've seen this exact batch before (duplicate detection)
      if (batchSignatures.has(batchSignature) && tweets.length > 0) {
        console.log(
          `Detected duplicate batch of tweets. Switching to max_id strategy.`
        );

        // Find the oldest tweet in this batch to use as max_id
        const oldestTweetId = tweets.reduce((min, tweet) => {
          const tweetId = BigInt(tweet.id_str);
          return tweetId < BigInt(min) ? tweet.id_str : min;
        }, tweets[0].id_str);

        // Decrement by 1 to exclude this tweet in next request
        const newMaxId = (BigInt(oldestTweetId) - BigInt(1)).toString();

        console.log(`Switching to max_id=${newMaxId} to fetch older tweets`);
        previousMaxId = maxId;
        maxId = newMaxId;
        cursor = undefined; // Reset cursor when using max_id

        // Add this batch signature to our tracking sets
        batchSignatures.add(batchSignature);
        continue;
      }

      // Add this batch signature to our tracking sets
      batchSignatures.add(batchSignature);

      // Handle empty batches
      if (tweets.length === 0) {
        consecutiveEmptyBatches++;
        console.log(`Empty batch received (${consecutiveEmptyBatches}/3)`);

        if (consecutiveEmptyBatches >= 3) {
          console.log("Too many consecutive empty batches, stopping");
          break;
        }

        // If we have a cursor, try using it, but only once
        if (nextCursor && !maxId) {
          cursor = nextCursor;
          continue;
        }

        // Otherwise, try max_id approach if we have tweets in our collection
        if (input.collection.size > 0) {
          const collectionTweets = Array.from(input.collection.values());

          // Find the smallest ID to use as max_id
          const smallestId = collectionTweets.reduce((min, tweet) => {
            const tweetId = BigInt(tweet.id_str || tweet.id);
            return tweetId < min ? tweetId : min;
          }, BigInt(collectionTweets[0].id_str || collectionTweets[0].id));

          previousMaxId = maxId;
          maxId = (smallestId - BigInt(1)).toString();
          cursor = undefined; // Reset cursor when changing max_id

          console.log(`Empty batch strategy: using max_id=${maxId}`);
          continue;
        } else {
          // No tweets and no cursor, we're done
          break;
        }
      } else {
        // Reset empty batches counter when we get tweets
        consecutiveEmptyBatches = 0;
      }

      // Process tweets and update our collection
      let newTweetsCount = 0;

      // Normalize and add tweet timestamps for consistency
      tweets.forEach((tweet: PartialTweet) => {
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

      // Determine next steps based on cursor, tweets, and new tweets count

      // If we didn't get any new tweets in this batch, we need to change strategy
      if (newTweetsCount === 0 && tweets.length > 0) {
        console.log(
          "No new tweets in this batch, switching to max_id strategy"
        );

        // Find the oldest tweet ID in this batch
        const oldestTweetId = tweets.reduce((min, tweet) => {
          const tweetId = BigInt(tweet.id_str);
          return tweetId < BigInt(min) ? tweet.id_str : min;
        }, tweets[0].id_str);

        // Use max_id to get older tweets
        previousMaxId = maxId;
        maxId = (BigInt(oldestTweetId) - BigInt(1)).toString();

        // If we're not making progress (same max_id), stop
        if (previousMaxId === maxId) {
          console.log(`No progress with max_id (${maxId}), stopping`);
          break;
        }

        console.log(`Switching to max_id=${maxId} to fetch older tweets`);
        cursor = undefined; // Reset cursor when using max_id
        continue;
      }

      // If we don't have a cursor, use max_id approach
      if (!nextCursor) {
        // No cursor means we need to use max_id approach to continue
        console.log("No next_cursor in response, switching to max_id approach");

        if (tweets.length > 0) {
          // Find the smallest ID in this batch
          const smallestId = tweets.reduce((min, tweet) => {
            const tweetId = BigInt(tweet.id_str);
            return tweetId < BigInt(min) ? tweet.id_str : min;
          }, tweets[0].id_str);

          previousMaxId = maxId;
          maxId = (BigInt(smallestId) - BigInt(1)).toString();

          // If we're not making progress (same max_id), stop
          if (previousMaxId === maxId) {
            console.log(`No progress with max_id (${maxId}), stopping`);
            break;
          }

          console.log(`No cursor strategy: using max_id=${maxId}`);
          cursor = undefined; // Reset cursor when changing max_id
        } else {
          // No tweets and no cursor, we're done
          console.log("No more tweets to fetch, stopping");
          break;
        }
      } else {
        // We have a cursor, but only use it if we're getting new tweets
        if (newTweetsCount > 0) {
          cursor = nextCursor;
          console.log(`Using next_cursor=${nextCursor} for pagination`);

          // If we've been using max_id and now have a cursor with new tweets,
          // we can try resetting max_id to see if cursor-based pagination works better
          if (maxId && pageCount % 3 === 0) {
            // Try every 3 pages
            console.log(
              "Temporarily resetting max_id to test cursor-based pagination"
            );
            // We'll reset max_id and let the algorithm handle it if needed
            maxId = undefined;

            // If we don't get new tweets in the next request, we'll revert back
            // This is handled by the newTweetsCount === 0 check above
          }
        } else {
          // We have a cursor but no new tweets, switch to max_id
          console.log(
            "Have cursor but no new tweets, switching to max_id strategy"
          );

          if (tweets.length > 0) {
            // Find the oldest tweet ID in this batch
            const oldestTweetId = tweets.reduce((min, tweet) => {
              const tweetId = BigInt(tweet.id_str);
              return tweetId < BigInt(min) ? tweet.id_str : min;
            }, tweets[0].id_str);

            // Use max_id to get older tweets
            previousMaxId = maxId;
            maxId = (BigInt(oldestTweetId) - BigInt(1)).toString();
            cursor = undefined; // Reset cursor when using max_id

            console.log(`Switching to max_id=${maxId} to fetch older tweets`);
          }
        }
      }

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
      `Completed fetching. Saving final cache (${finalArray.length} tweets)`
    );
    await setCachedTweets(input.username, finalArray);
  }

  if (pageCount >= maxPages) {
    console.log(`Reached maximum number of pages (${maxPages}), stopping`);
  }
}

/**
 * Fetch tweets from a user with optimized caching and pagination
 * This is the main function that should be called by external code
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

  try {
    // Clear cache if force refresh requested
    if (forceRefresh) {
      await clearCachedTweets(normalizedName);
    }

    // Try to get tweets from cache first
    const cached = forceRefresh ? null : await getCachedTweets(normalizedName);

    // Initialize collection with cached tweets if available
    const collection = new Map<string, PartialTweet>(
      cached?.map((tweet) => {
        // Ensure we're using id_str consistently
        const idKey = tweet.id_str || tweet.id;
        return [idKey, tweet];
      }) ?? []
    );

    // Get user profile to check total tweet count
    const userProfile = await fetchTwitterProfile(normalizedName, apiKey);
    const totalTweets = userProfile?.statuses_count || 0;

    console.log(
      `User ${normalizedName} has ${totalTweets} tweets, we have ${collection.size} cached`
    );

    // If we have all tweets and not forcing refresh, return cached tweets
    // Add a small buffer (5%) to account for deleted tweets or API inconsistencies
    const cacheThreshold = Math.floor(totalTweets * 0.95);
    if (collection.size >= cacheThreshold && !forceRefresh && cached?.length) {
      console.log(
        `Returning ${
          collection.size
        } cached tweets for ${normalizedName} (${Math.round(
          (collection.size / totalTweets) * 100
        )}% of profile count)`
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
        Math.max(200, Math.ceil(totalTweets / 15) + 50) // At least 200 pages, or calculated + buffer
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
    if (tweets.length > collection.size) {
      await setCachedTweets(normalizedName, tweets);
    }

    // Log coverage percentage
    const coverage =
      totalTweets > 0 ? Math.round((tweets.length / totalTweets) * 100) : 0;
    console.log(
      `Fetched ${tweets.length}/${totalTweets} tweets (${coverage}% coverage) for ${normalizedName}`
    );

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
    } catch (cacheError) {
      // Ignore cache errors
    }

    throw error;
  }
}
