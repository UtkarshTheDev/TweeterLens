"erroruse client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  RefreshCw,
  User,
  Calendar,
  Filter,
  AlertCircle,
  Twitter,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Tweets } from "@/components/Tweets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PartialTweet, TwitterUser } from "@/lib/twitter-utils";
import Link from "next/link";
import Image from "next/image";

interface UserProfileResponse {
  user: TwitterUser;
  available_years: number[];
}

interface TwitterResponse {
  user: TwitterUser;
  tweets: PartialTweet[];
  total_fetched: number;
  total_returned: number;
  fetch_log: string[];
  total_profile_tweets: number;
  payment_error?: string;
  year?: number | string;
  available_years?: number[];
}

// Function to fetch just the user profile and available years
const fetchUserProfile = async (
  username: string,
  apiKey: string
): Promise<UserProfileResponse> => {
  if (!username || username.trim() === "") {
    throw new Error("Username is required");
  }

  const url = new URL("/api/twitter", window.location.origin);
  url.searchParams.append("username", username.trim());
  url.searchParams.append("apiKey", apiKey);
  url.searchParams.append("profile_only", "true");

  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch user profile");
  }
  return res.json();
};

// API call to fetch tweets for a specific year after profile is fetched
const fetchTweets = async (
  username: string,
  apiKey: string,
  year?: string | number,
  forceRefresh = false
): Promise<TwitterResponse> => {
  if (!username || username.trim() === "") {
    throw new Error("Username is required");
  }

  const url = new URL("/api/twitter", window.location.origin);
  url.searchParams.append("username", username.trim());
  url.searchParams.append("apiKey", apiKey);

  if (year && year !== "all") {
    url.searchParams.append("year", year.toString());
  }

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
  const [data, setData] = useState<TwitterResponse | null>(null);
  const [userProfile, setUserProfile] = useState<TwitterUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [yearSelectionPrompt, setYearSelectionPrompt] =
    useState<boolean>(false);

  // Get API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("socialdataApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSearch = async () => {
    // Validate username is not empty
    if (!username || username.trim() === "") {
      setValidationMessage("Please enter a username");
      return;
    }

    // Validate API key exists
    if (!apiKey) {
      setValidationMessage(
        "API key is required. Please add it in the home page settings."
      );
      return;
    }

    setValidationMessage(""); // Clear validation message
    setHasSearched(true);
    setLoading(true);
    setError(null);
    setYearSelectionPrompt(false);
    setData(null);

    try {
      // First fetch just the user profile to get available years
      const profileResult = await fetchUserProfile(username, apiKey);
      setUserProfile(profileResult.user);

      // Set available years from profile response
      if (
        profileResult.available_years &&
        profileResult.available_years.length > 0
      ) {
        setAvailableYears(profileResult.available_years);

        // Set default year to most recent year available
        const mostRecentYear = Math.max(
          ...profileResult.available_years
        ).toString();
        setSelectedYear(mostRecentYear);

        // Show year selection prompt before fetching tweets
        setYearSelectionPrompt(true);
        setLoading(false);
        return;
      } else {
        // If no years information available, proceed with default year
        const result = await fetchTweets(username, apiKey, selectedYear, false);
        setData(result);

        if (result.available_years && result.available_years.length > 0) {
          setAvailableYears(result.available_years);
        }
      }
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      setData(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTweetsForYear = async () => {
    if (!username || !apiKey) return;

    setLoading(true);
    setError(null);
    setYearSelectionPrompt(false);

    try {
      const result = await fetchTweets(username, apiKey, selectedYear, false);
      setData(result);
    } catch (error: unknown) {
      console.error("Error fetching tweets for year:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch tweets for selected year"
      );
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

  const handleYearChange = async (year: string) => {
    if (year === selectedYear) return;

    setSelectedYear(year);

    // If year selection prompt is active, don't automatically fetch
    if (yearSelectionPrompt) {
      return;
    }

    // Only fetch data if we've already searched for a username
    if (hasSearched && username && apiKey) {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchTweets(username, apiKey, year, false);
        setData(result);
      } catch (error: unknown) {
        console.error("Error fetching tweets for year:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch tweets for selected year"
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoadAllTweets = async () => {
    if (!username || username.trim() === "") {
      setValidationMessage("Please enter a username");
      return;
    }

    if (!apiKey) {
      setValidationMessage("API key is required");
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
      url.searchParams.append("apiKey", apiKey);

      if (selectedYear && selectedYear !== "all") {
        url.searchParams.append("year", selectedYear);
      }

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch all tweets");
      }

      const result = await res.json();
      setData(result);

      // Update available years after loading all tweets
      if (result.available_years && result.available_years.length > 0) {
        setAvailableYears(result.available_years);
      }
    } catch (err: unknown) {
      console.error("Error loading all tweets:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load all tweets"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generate year options for the dropdown
  const renderYearOptions = () => {
    const options = [
      <SelectItem key="all" value="all">
        All Years
      </SelectItem>,
    ];

    // Add available years from API response
    if (availableYears.length > 0) {
      // Sort years in descending order (newest first)
      const sortedYears = [...availableYears].sort((a, b) => b - a);

      sortedYears.forEach((year) => {
        options.push(
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        );
      });
    } else {
      // If no available years yet, add current year
      const currentYear = new Date().getFullYear();
      options.push(
        <SelectItem key={currentYear} value={currentYear.toString()}>
          {currentYear}
        </SelectItem>
      );
    }

    return options;
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

            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Twitter Feed Visualizer</h1>

          {!apiKey && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                API key is required. Please add it on the home page first.
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <div className="relative overflow-hidden rounded-xl shadow-2xl border border-white/10 bg-gradient-to-r from-black/90 to-zinc-900/70 backdrop-blur-xl">
              {/* Animated background */}
              <div className="absolute inset-0 -z-10 opacity-20">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-blue-600/20 animate-gradient"
                  style={{ backgroundSize: "200% 200%" }}
                />
              </div>

              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-3 flex items-center justify-center">
                        <div className="p-1 bg-indigo-500/10 rounded-lg">
                          <User className="h-4 w-4 text-indigo-400" />
                        </div>
                      </div>
                      <Input
                        type="text"
                        placeholder="Enter Twitter username..."
                        value={username}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-12 bg-transparent border border-white/10 text-white placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500 text-lg py-2"
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
                        disabled={loading || isRefreshing || !apiKey}
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
            </div>
          </div>

          {/* Year selection prompt after user search */}
          {yearSelectionPrompt && userProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 rounded-xl border border-white/10 bg-gradient-to-r from-indigo-900/20 to-blue-900/20 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-6">
                <div className="flex gap-4 items-center">
                  {userProfile.profile_image_url_https && (
                    <Image
                      src={userProfile.profile_image_url_https.replace(
                        "_normal",
                        ""
                      )}
                      alt={userProfile.name}
                      className="w-16 h-16 rounded-full border border-white/20"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {userProfile.name}
                    </h3>
                    <p className="text-gray-400">@{userProfile.screen_name}</p>
                    <p className="text-sm text-gray-300 mt-1">
                      {userProfile.statuses_count.toLocaleString()} tweets ·
                      Account since{" "}
                      {new Date(userProfile.created_at).getFullYear()}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-indigo-300 mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Select a year to fetch tweets
                  </h3>
                  <p className="text-gray-300 mb-4">
                    This account has tweets from{" "}
                    {availableYears.length > 0
                      ? Math.min(...availableYears)
                      : new Date().getFullYear()}{" "}
                    to{" "}
                    {availableYears.length > 0
                      ? Math.max(...availableYears)
                      : new Date().getFullYear()}
                    . Selecting a specific year helps reduce API costs and load
                    times.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-64">
                      <Select
                        value={selectedYear}
                        onValueChange={handleYearChange}
                      >
                        <SelectTrigger className="bg-black/50 border-white/10 text-white">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-400" />
                            <SelectValue placeholder="Select Year" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          {renderYearOptions()}
                        </SelectContent>
                      </Select>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleFetchTweetsForYear}
                        className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <span>Fetch Tweets for {selectedYear}</span>
                        </div>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Display selected year info */}
          {data && data.year && !yearSelectionPrompt && (
            <div className="mb-4 text-gray-300 text-sm bg-black/30 p-2 rounded border border-white/5 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
              <span>
                Showing tweets from:{" "}
                <span className="font-medium text-indigo-300">
                  {selectedYear === "all" ? "All Years" : selectedYear}
                </span>
                {data.available_years && data.available_years.length > 0 && (
                  <span className="text-gray-400">
                    {" "}
                    (Account active since {Math.min(...data.available_years)})
                  </span>
                )}
              </span>
            </div>
          )}

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
          ) : hasSearched && !yearSelectionPrompt ? (
            <div className="text-center py-12 text-gray-500">
              <p>No tweets found. Please check the username and try again.</p>
            </div>
          ) : (
            !yearSelectionPrompt && (
              <div className="text-center py-12 text-gray-500">
                <p>Enter a Twitter username to view tweets.</p>
              </div>
            )
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
