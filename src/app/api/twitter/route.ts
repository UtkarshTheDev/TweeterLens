import { fetchTweetsFromUser, fetchTwitterProfile } from "@/lib/twitter-utils";
import { NextResponse } from "next/server";

// Right after the imports, add:
interface TwitterApiResponse {
  user: any;
  tweets: any[];
  total_fetched: number;
  total_returned: number;
  fetch_log: string[];
  total_profile_tweets: number;
  payment_error?: string;
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

    // Validate username properly
    if (!username || username.trim() === "") {
      console.log("Username is required but was empty");
      return NextResponse.json(
        { error: "Username is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Normalize username by trimming whitespace
    const normalizedUsername = username.trim();

    // Parse parameters
    const limit = limitParam ? parseInt(limitParam) : undefined;
    // Default to 200 pages if not specified (can fetch ~4000 tweets)
    const maxPages = maxPagesParam ? parseInt(maxPagesParam) : 200;
    const stopDate = stopDateParam ? new Date(stopDateParam) : undefined;

    // Clear cache if force refresh is requested
    const forceRefresh = url.searchParams.get("force") === "true";

    console.log(
      `Fetching tweets for ${normalizedUsername} with limit: ${limit}, maxPages: ${maxPages}, forceRefresh: ${forceRefresh}`
    );

    // Fetch user profile
    const user = await fetchTwitterProfile(normalizedUsername);
    if (!user) {
      console.log(`User not found: ${normalizedUsername}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch tweets with optional parameters
    const fetchLog: string[] = [];
    let tweets = [];
    let partialResultsError = null;

    try {
      tweets = await fetchTweetsFromUser(
        normalizedUsername,
        stopDate,
        (collection) => {
          fetchLog.push(`Fetched ${collection.length} tweets`);
        },
        maxPages,
        forceRefresh
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

        // Try to get cached tweets
        const getCachedTweetsFromUser = await import(
          "@/lib/twitter-utils"
        ).then((module) => module.getCachedTweets);
        const cachedTweets = await getCachedTweetsFromUser(normalizedUsername);

        if (cachedTweets && cachedTweets.length > 0) {
          tweets = cachedTweets;
          fetchLog.push(
            `Retrieved ${tweets.length} tweets from cache after payment error`
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

    // Apply limit if specified and valid
    const limitedTweets =
      limit && limit > 0 && limit < tweets.length
        ? tweets.slice(0, limit)
        : tweets;

    console.log(
      `Returning ${limitedTweets.length} of ${
        tweets.length
      } fetched tweets for ${normalizedUsername} (${Math.round(
        (tweets.length / user.statuses_count) * 100
      )}% coverage)`
    );

    const response: TwitterApiResponse = {
      user,
      tweets: limitedTweets,
      total_fetched: tweets.length,
      total_returned: limitedTweets.length,
      fetch_log: fetchLog,
      total_profile_tweets: user.statuses_count,
    };

    // Add a warning if we had a payment error
    if (partialResultsError) {
      response.payment_error = partialResultsError;
    }

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
