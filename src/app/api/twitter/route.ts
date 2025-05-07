import {
  fetchTweetsFromUser,
  fetchTwitterProfile,
  getCachedTweets,
  getAvailableYearsFromCache,
  TwitterUser,
  PartialTweet,
  // Removed unused imports: CACHE_TTL, writeToCache
} from "@/lib/twitter-utils";
import { NextResponse } from "next/server";

// Right after the imports, add:
interface TwitterApiResponse {
  user: TwitterUser;
  tweets: PartialTweet[];
  total_fetched: number;
  total_returned: number;
  fetch_log: string[];
  total_profile_tweets: number;
  payment_error?: string;
  year?: number;
  available_years?: number[];
}

// API route handler
export async function GET(request: Request) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const username = url.searchParams.get("username");
    const limitParam = url.searchParams.get("limit");
    const maxPagesParam = url.searchParams.get("max_pages");
    const stopDateParam = url.searchParams.get("stopDate");
    const apiKey = url.searchParams.get("apiKey");
    const yearParam = url.searchParams.get("year");

    // Validate username properly
    if (!username || username.trim() === "") {
      console.log("Username is required but was empty");
      return NextResponse.json(
        { error: "Username is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Validate API key
    if (!apiKey) {
      console.log("API key is required but was empty");
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Normalize username by trimming whitespace
    const normalizedUsername = username.trim();

    // Parse parameters
    const limit = limitParam ? parseInt(limitParam) : undefined;
    // Default to 200 pages if not specified (can fetch ~4000 tweets)
    const maxPages = maxPagesParam ? parseInt(maxPagesParam) : 200;
    const requestedYear = yearParam
      ? parseInt(yearParam)
      : new Date().getFullYear();

    // Determine stop date based on year parameter if no explicit stop date
    let stopDate = stopDateParam ? new Date(stopDateParam) : undefined;
    if (!stopDate && yearParam) {
      // If a specific year is requested, go back to beginning of that year
      stopDate = new Date(requestedYear - 1, 11, 31);
    } else if (!stopDate) {
      // Default to stop at the end of previous year
      const currentYear = new Date().getFullYear();
      stopDate = new Date(currentYear - 1, 11, 31);
    }

    // Clear cache if force refresh is requested
    const forceRefresh = url.searchParams.get("force") === "true";

    console.log(
      `Fetching tweets for ${normalizedUsername} with limit: ${limit}, maxPages: ${maxPages}, year: ${requestedYear}, forceRefresh: ${forceRefresh}`
    );

    // Try to get available years from cache first
    const cachedYears = await getAvailableYearsFromCache(normalizedUsername);

    // Check if we have cached tweets before fetching the profile
    const cachedTweets = await getCachedTweets(normalizedUsername);

    // Only fetch profile if we need to (no cache or force refresh)
    let user: TwitterUser | null = null;
    if (!cachedTweets || forceRefresh) {
      console.log(`Fetching profile for ${normalizedUsername}`);
      user = await fetchTwitterProfile(normalizedUsername, apiKey);
      if (!user) {
        console.log(`User not found: ${normalizedUsername}`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else if (
      cachedTweets &&
      cachedTweets.length > 0 &&
      cachedTweets[0].user
    ) {
      // Use the user object from the first cached tweet if available
      console.log(
        `Using user profile from cached tweets for ${normalizedUsername}`
      );
      user = cachedTweets[0].user;
    } else {
      // If we have cached tweets but no user object, fetch the profile
      console.log(
        `Fetching profile for ${normalizedUsername} (not found in cache)`
      );
      user = await fetchTwitterProfile(normalizedUsername, apiKey);
      if (!user) {
        console.log(`User not found: ${normalizedUsername}`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Fetch tweets with optional parameters
    const fetchLog: string[] = [];
    let tweets = [];
    let partialResultsError = null;

    // Check if we should try to fetch from cache before making API calls
    // If forceRefresh is false and a specific year is requested
    if (
      !forceRefresh &&
      yearParam &&
      yearParam !== "all" &&
      cachedTweets &&
      cachedTweets.length > 0
    ) {
      // Filter cached tweets by year instead of making another cache call
      const cachedYearTweets = cachedTweets.filter((tweet) => {
        const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
        return tweetDate.getFullYear() === requestedYear;
      });

      if (cachedYearTweets && cachedYearTweets.length > 0) {
        console.log(
          `Retrieved ${cachedYearTweets.length} tweets for ${normalizedUsername} in year ${requestedYear} from cache`
        );
        fetchLog.push(
          `Retrieved ${cachedYearTweets.length} tweets for year ${requestedYear} from cache`
        );
        tweets = cachedYearTweets;

        // Calculate available years from the cached tweets
        const availableYears = cachedYears || [];

        // Apply limit if specified and valid
        const limitedTweets =
          limit && limit > 0 && limit < tweets.length
            ? tweets.slice(0, limit)
            : tweets;

        const response: TwitterApiResponse = {
          user,
          tweets: limitedTweets,
          total_fetched: tweets.length,
          total_returned: limitedTweets.length,
          fetch_log: fetchLog,
          total_profile_tweets: user.statuses_count,
          year: requestedYear,
          available_years: availableYears,
        };

        return NextResponse.json(response);
      }
    }

    try {
      // If we already have cached tweets and we're not forcing a refresh, use them
      if (
        cachedTweets &&
        cachedTweets.length > 0 &&
        !forceRefresh &&
        !yearParam
      ) {
        console.log(
          `Using ${cachedTweets.length} cached tweets for ${normalizedUsername} without making API calls`
        );
        fetchLog.push(
          `Using ${cachedTweets.length} cached tweets without API calls`
        );
        tweets = cachedTweets;
      } else {
        // Otherwise, fetch tweets from the API
        console.log(`Fetching tweets from API for ${normalizedUsername}`);
        tweets = await fetchTweetsFromUser(
          normalizedUsername,
          stopDate,
          (collection) => {
            fetchLog.push(`Fetched ${collection.length} tweets`);
          },
          maxPages,
          forceRefresh,
          apiKey
        );
      }

      // Log the number of tweets fetched for debugging
      console.log(
        `Successfully fetched ${tweets.length} tweets for ${normalizedUsername}`
      );
    } catch (error) {
      // If this is a 402 error, we want to return the partial results
      if (
        error instanceof Error &&
        error.message.includes("402 Payment Required")
      ) {
        console.log(
          "Payment error encountered, attempting to retrieve cached tweets"
        );
        partialResultsError =
          "API subscription limit reached. Returning partial results from cache.";

        // Use the cached tweets we already fetched
        if (cachedTweets && cachedTweets.length > 0) {
          tweets = cachedTweets;
          fetchLog.push(
            `Using ${tweets.length} tweets from cache after payment error`
          );
        } else {
          // No cached tweets available, rethrow error
          throw error;
        }
      } else {
        // Not a 402 error, rethrow
        throw error;
      }
    }

    // Filter tweets by year if specified
    let filteredTweets = tweets;
    if (yearParam && yearParam !== "all") {
      filteredTweets = tweets.filter((tweet) => {
        const tweetDate = new Date(tweet.tweet_created_at || tweet.created_at);
        return tweetDate.getFullYear() === requestedYear;
      });
    }

    // Calculate available years from tweets
    const availableYears = Array.from(
      new Set(
        tweets.map((tweet) => {
          const tweetDate = new Date(
            tweet.tweet_created_at || tweet.created_at
          );
          return tweetDate.getFullYear();
        })
      )
    ).sort();

    // Apply limit if specified and valid
    const limitedTweets =
      limit && limit > 0 && limit < filteredTweets.length
        ? filteredTweets.slice(0, limit)
        : filteredTweets;

    console.log(
      `Returning ${limitedTweets.length} of ${filteredTweets.length} filtered tweets (from total ${tweets.length}) for ${normalizedUsername} in year ${requestedYear}`
    );

    const response: TwitterApiResponse = {
      user,
      tweets: limitedTweets,
      total_fetched: tweets.length,
      total_returned: limitedTweets.length,
      fetch_log: fetchLog,
      total_profile_tweets: user.statuses_count,
      year: requestedYear,
      available_years: availableYears,
    };

    // Add a warning if we had a payment error
    if (partialResultsError) {
      response.payment_error = partialResultsError;
    }

    // Log the response being sent to the frontend
    console.log(`Sending response to frontend for ${normalizedUsername}:`, {
      tweetCount: limitedTweets.length,
      userIncluded: !!user,
      logEntries: fetchLog.length,
      yearsAvailable: availableYears.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching tweets:", error);

    // Check for rate limit errors
    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json(
        { error: "Twitter API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Specific error for payment errors with no cached data
    if (
      error instanceof Error &&
      error.message.includes("402 Payment Required")
    ) {
      return NextResponse.json(
        {
          error:
            "Twitter API subscription limit reached. Please try again later or upgrade your API plan.",
          code: "payment_required",
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch tweets" },
      { status: 500 }
    );
  }
}
