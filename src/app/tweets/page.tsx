"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Search as SearchIcon,
  Twitter,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { TweetData } from "@/components/TweetData";
import { Spinner } from "@/components/ui/spinner";
import { Tweets } from "@/components/Tweets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fetchTweets = async (username: string, forceRefresh = false) => {
  if (!username || username.trim() === "") return null;

  const url = new URL("/api/twitter", window.location.origin);
  url.searchParams.append("username", username.trim());

  if (forceRefresh) {
    url.searchParams.append("force", "true");
  }

  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch tweets");
  }
  return res.json();
};

export default function TweetsPage() {
  const [username, setUsername] = useState<string>("");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    // Validate username is not empty
    if (!username || username.trim() === "") {
      setValidationMessage("Please enter a username");
      return;
    }

    setValidationMessage(""); // Clear validation message
    setHasSearched(true);
    setLoading(true);
    setError(null);

    try {
      const result = await fetchTweets(username);
      setData(result);
    } catch (err: any) {
      console.error("Error fetching tweets:", err);
      setError(err.message || "Failed to fetch tweets");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && username.trim() !== "") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    // Clear validation message when user types
    if (validationMessage) {
      setValidationMessage("");
    }
  };

  const handleForceRefresh = async () => {
    if (!username || username.trim() === "") {
      setValidationMessage("Please enter a username");
      return;
    }

    setValidationMessage("");
    setError(null);
    setIsRefreshing(true);

    try {
      const result = await fetchTweets(username, true);
      setData(result);
    } catch (err: any) {
      console.error("Error refreshing tweets:", err);
      setError(err.message || "Failed to refresh tweets");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadAllTweets = async () => {
    if (!username || username.trim() === "") {
      setValidationMessage("Please enter a username");
      return;
    }

    setValidationMessage("");
    setError(null);
    setIsRefreshing(true);

    try {
      // Add max_pages parameter to attempt to fetch all tweets
      const url = new URL("/api/twitter", window.location.origin);
      url.searchParams.append("username", username.trim());
      url.searchParams.append("force", "true");
      url.searchParams.append("max_pages", "500"); // Set a high limit

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch all tweets");
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      console.error("Error loading all tweets:", err);
      setError(err.message || "Failed to load all tweets");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.8),rgba(0,0,0,1))]" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Twitter className="h-8 w-8 text-blue-400" />
              <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
                Raw Tweets
              </h1>
            </div>

            <a
              href="/"
              className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white transition-all hover:border-blue-500/50"
            >
              Back to Home
            </a>
          </div>
        </div>
      </header>

      <main>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Twitter Feed Visualizer</h1>

          <div className="mb-6">
            <div className="relative overflow-hidden rounded-xl shadow-2xl border border-white/10 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl">
              {/* Animated background */}
              <div className="absolute inset-0 -z-10 opacity-30">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient"
                  style={{ backgroundSize: "200% 200%" }}
                />
              </div>

              <div className="relative flex items-center p-2">
                <div className="relative flex-1 flex items-center">
                  <SearchIcon className="absolute left-3 h-5 w-5 text-blue-400" />
                  <Input
                    type="text"
                    placeholder="Enter Twitter username..."
                    value={username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 bg-transparent border-none text-white placeholder:text-gray-400 focus:ring-0 text-lg py-2"
                    disabled={loading || isRefreshing}
                  />
                </div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="ml-2"
                >
                  <Button
                    onClick={handleSearch}
                    disabled={loading || isRefreshing || !username.trim()}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-xl hover:shadow-blue-500/25"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Spinner className="mr-2 h-4 w-4" />
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Search</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}

                    {/* Shine effect */}
                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-lg">
                      <div
                        className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ transform: "rotate(-45deg)" }}
                      ></div>
                    </div>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-2"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleForceRefresh}
                          disabled={
                            isRefreshing || loading || !username.trim() || !data
                          }
                          className="bg-black/30 border-white/10 hover:bg-purple-500/20 hover:border-purple-500/50"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${
                              isRefreshing ? "animate-spin" : ""
                            }`}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900/90 border-white/10 text-white">
                        <p>
                          {data?.payment_error
                            ? "API limit reached. Refreshing may not fetch new tweets."
                            : "Force refresh all tweets"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              </div>
            </div>

            {validationMessage && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500"
              >
                {validationMessage}
              </motion.p>
            )}

            {data?.payment_error && (
              <Alert
                variant="destructive"
                className="mt-4 bg-red-950/20 border-red-500/20"
              >
                <AlertDescription>{data.payment_error}</AlertDescription>
              </Alert>
            )}
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {loading && !isRefreshing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-8 w-8 mb-4" />
              <p className="text-gray-500">Loading tweets...</p>
            </div>
          ) : isRefreshing ? (
            <div className="opacity-50 pointer-events-none">
              <Tweets data={data} />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
                <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                  <Spinner className="h-8 w-8 mb-2" />
                  <p>Refreshing tweets...</p>
                </div>
              </div>
            </div>
          ) : data ? (
            <>
              <Tweets data={data} />

              {/* Add "Load All Tweets" button if we haven't fetched all tweets */}
              {data.total_fetched < data.total_profile_tweets && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleLoadAllTweets}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>
                      Load All Tweets (
                      {data.total_profile_tweets - data.total_fetched}{" "}
                      remaining)
                    </span>
                  </Button>
                </div>
              )}
            </>
          ) : hasSearched ? (
            <div className="text-center py-12 text-gray-500">
              <p>No tweets found. Please check the username and try again.</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Enter a Twitter username to view tweets.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto border-t border-white/10 bg-black/50 py-6 backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Built with ❤️ by{" "}
            <a
              href="https://twitter.com/UtkarshTheDev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Utkarsh
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
