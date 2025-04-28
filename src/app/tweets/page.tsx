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
    <div className="relative min-h-screen">
      {/* New background matching the main page */}
      <div className="fixed inset-0 -z-10">
        <div className="relative h-full w-full bg-black">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"></div>
        </div>
      </div>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Twitter className="h-8 w-8 text-indigo-400" />
              <h1 className="bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-2xl font-bold text-transparent">
                Raw Tweets
              </h1>
            </div>

            <a
              href="/"
              className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white transition-all hover:border-indigo-500/50"
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
            <div className="relative overflow-hidden rounded-xl shadow-2xl border border-white/10 bg-gradient-to-r from-black/90 to-zinc-900/70 backdrop-blur-xl">
              {/* Animated background */}
              <div className="absolute inset-0 -z-10 opacity-20">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-blue-600/20 animate-gradient"
                  style={{ backgroundSize: "200% 200%" }}
                />
              </div>

              <div className="relative flex items-center p-2">
                <div className="relative flex-1 flex items-center">
                  <div className="absolute left-3 flex items-center justify-center">
                    <div className="p-1 bg-indigo-500/10 rounded-lg">
                      <SearchIcon className="h-4 w-4 text-indigo-400" />
                    </div>
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter Twitter username..."
                    value={username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-12 bg-transparent border-none text-white placeholder:text-gray-400 focus:ring-0 text-lg py-2"
                    disabled={loading || isRefreshing}
                  />
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleSearch}
                    className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-xl hover:shadow-indigo-500/25"
                    disabled={loading || isRefreshing}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Search</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}

                    {/* Button shine effect */}
                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-lg">
                      <div
                        className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ transform: "rotate(-45deg)" }}
                      ></div>
                    </div>
                  </Button>
                </motion.div>
              </div>

              {validationMessage && (
                <div className="p-2 text-red-400 text-sm">
                  {validationMessage}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div
              className="bg-black/70 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg relative mb-6"
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
              className="text-indigo-400 hover:underline"
            >
              Utkarsh
            </a>
          </p>
          <p className="text-gray-400">
            <a
              href="https://github.com/UtkarshTheDev/TweeterLens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
