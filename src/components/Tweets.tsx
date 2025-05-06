"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Search,
  Calendar,
  ArrowRight,
  Download,
  Camera,
  PaintBucket,
  ChevronDown,
  Check,
  AlertTriangle,
  Heart,
  Repeat,
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TweetData } from "@/components/TweetData";
// import { ApiKeyInput } from "@/components/ApiKeyInput";
import { TwitterUser, PartialTweet } from "@/lib/twitter-utils";

const themes = [
  {
    name: "Tokyo Night",
    colors: ["#1a1b26", "#414868", "#565f89", "#7aa2f7", "#bb9af7"],
    background: "bg-[#16161e]",
    text: "text-indigo-100",
  },
  {
    name: "Dracula",
    colors: ["#282a36", "#bd93f9", "#ff79c6", "#50fa7b", "#f1fa8c"],
    background: "bg-[#181820]",
    text: "text-gray-100",
  },
  {
    name: "Catppuccin",
    colors: ["#1e1e2e", "#f5c2e7", "#cba6f7", "#94e2d5", "#a6e3a1"],
    background: "bg-[#181825]",
    text: "text-pink-100",
  },
  {
    name: "Twitter Blue",
    colors: ["#15202b", "#1a8cd8", "#1d9bf0", "#8ecdf8", "#d6ebfc"],
    background: "bg-[#15202b]",
    text: "text-blue-100",
  },
  {
    name: "Neon",
    colors: ["#000000", "#ff00ff", "#00ffff", "#ff0099", "#33ff00"],
    background: "bg-black",
    text: "text-pink-100",
  },
  {
    name: "Nord",
    colors: ["#2e3440", "#5e81ac", "#81a1c1", "#88c0d0", "#8fbcbb"],
    background: "bg-[#242933]",
    text: "text-blue-100",
  },
  {
    name: "Ocean",
    colors: ["#0a192f", "#1a365d", "#2c5282", "#3182ce", "#90cdf4"],
    background: "bg-[#0a192f]",
    text: "text-blue-100",
  },
  {
    name: "Monokai",
    colors: ["#272822", "#f92672", "#fd971f", "#a6e22e", "#66d9ef"],
    background: "bg-[#1e1f1c]",
    text: "text-yellow-100",
  },
];

interface TwitterStatsResponse {
  totalPosts: number;
  bestStreak: number;
  bestStreakPeriod: string | null;
  currentStreak: number;
  averagePostsPerDay: number;
  bestDay: {
    count: number;
    date: string;
  };
  userJoinYear: number;
  averageEngagement: {
    likes: number;
    retweets: number;
    replies: number;
    views: number;
  };
  mostActiveDayOfWeek: { day: string; count: number };
  mostActiveMonth: { month: string; count: number };
  topHashtags: Array<{ tag: string; count: number }>;
  engagementTrends: Array<{
    month: string;
    posts: number;
    likes: number;
    retweets: number;
    engagement: number;
  }>;
  contributionGraph: {
    graph: Array<
      Array<{
        date: string;
        count: number;
        level: number;
        month: number;
        day: number;
        weekday: number;
      }>
    >;
    monthRanges: MonthRange[];
  };
  // New stats
  viralTweet: {
    text: string;
    date: string;
    likes: number;
    retweets: number;
    engagement: number;
    engagementRatio: number;
  } | null;
  postingTimeAnalysis: {
    peakHour: string;
    hourlyDistribution: Array<{
      hour: number;
      count: number;
      percentage: string;
      formattedHour: string;
    }>;
  };
  tweetSources: Array<{
    source: string;
    count: number;
    percentage: string;
  }>;

  consistencyMetrics: {
    daysWithTweets: number;
    daysPassed: number;
    consistencyScore: number;
    regularityScore: number;
  };
  engagementEfficiency: {
    engagementPerPost: number;
    engagementPerDay: number;
    efficiencyScore: number;
  };
  conversationMetrics: {
    replyCount: number;
    replyPercentage: number;
    uniqueConversations: number;
  };
  tweetTimingEffectiveness: {
    optimalPostingTime: {
      hour: number;
      formattedHour: string;
      avgEngagement: number;
    };
    hourlyEngagementData: Array<{
      hour: number;
      formattedHour: string;
      count: number;
      avgEngagement: number;
    }>;
  };
  twitterPersonality: {
    type: string;
    description: string;
  };
}

const fetchUserStats = async (username: string, apiKey: string) => {
  // Add a timestamp to prevent browser caching
  const timestamp = new Date().getTime();
  const res = await fetch(
    `/api/twitter/stats?username=${username}&apiKey=${apiKey}&_t=${timestamp}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch user stats");
  }
  return res.json();
};

const generateYearOptions = (joinYear: number) => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= joinYear; year--) {
    years.push(year);
  }

  return years;
};

// Update the ThemeOption interface
interface ThemeOption {
  name: string;
  colors: string[];
  background: string;
  text: string;
}

// Add a type definition for the month range
interface MonthRange {
  month: number;
  startWeek: number;
  endWeek: number;
}

/**
 * Formats a date string to a readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Returns the appropriate CSS class for a given activity count
 * For count=0, returns transparent background to show empty boxes
 */
const getActivityColor = (count: number, theme: ThemeOption): string => {
  if (count === 0) return "transparent";
  if (count < 2) return theme.colors[0];
  if (count < 5) return theme.colors[1];
  if (count < 10) return theme.colors[2];
  return theme.colors[3];
};

// Update the TwitterFeed component to accept initialUsername and hideSearchInput props
interface TwitterFeedProps {
  initialUsername?: string;
  hideSearchInput?: boolean;
}

export const TwitterFeed = ({
  initialUsername = "",
  hideSearchInput = false,
}: TwitterFeedProps) => {
  const [username, setUsername] = useState(initialUsername);
  const [searchUsername, setSearchUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([
    selectedYear,
  ]);
  const graphRef = useRef<HTMLDivElement>(null);

  // Load API key from localStorage on component mount and initialize search
  useEffect(() => {
    const savedApiKey = localStorage.getItem("socialdataApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);

      // If we have an initialUsername, trigger the search immediately
      if (initialUsername && initialUsername.trim()) {
        console.log(`Initializing search for ${initialUsername} with API key`);
        setUsername(initialUsername);
        setSearchUsername(initialUsername);
      }
    }
  }, []); // Only run once on mount

  // Use effect to handle initialUsername changes after mount
  useEffect(() => {
    if (initialUsername && initialUsername !== searchUsername) {
      console.log(
        `initialUsername changed to ${initialUsername}, updating search`
      );
      setUsername(initialUsername);

      // If we have an API key, trigger the search immediately
      if (apiKey) {
        setSearchUsername(initialUsername);
      }
    }
  }, [initialUsername, apiKey, searchUsername]);

  // const handleApiKeySaved = (key: string) => {
  //   setApiKey(key);
  // };

  const handleSearch = () => {
    if (!username.trim()) return;
    if (!apiKey) {
      // Alert user to enter API key first
      alert("Please enter your Social Data API key before searching");
      return;
    }
    setSearchUsername(username);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // State for notification messages
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Show notification helper
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type, visible: true });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleExportImage = async () => {
    if (!graphRef.current) {
      console.error("Graph reference is null");
      showNotification("Cannot find the graph element to export", "error");
      return;
    }

    try {
      // Ensure the graph is fully rendered before capturing
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Get background color safely
      const element = graphRef.current;
      const bgColor = element
        ? getComputedStyle(element).backgroundColor || "#16161e"
        : "#16161e";

      // Use toPng from html-to-image
      const dataUrl = await import("html-to-image").then((module) =>
        module.toPng(element, {
          cacheBust: true,
          pixelRatio: 2, // Higher quality
          backgroundColor: bgColor,
          style: {
            // Ensure proper rendering of fonts
            fontFamily: "Arial, sans-serif",
          },
        })
      );

      // Create and trigger download
      const link = document.createElement("a");
      link.download = `${searchUsername}-x-contributions-${selectedYear}.png`;
      link.href = dataUrl;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification("Image downloaded successfully!", "success");
    } catch (err) {
      console.error("Error exporting image:", err);

      // Fallback method if the first approach fails
      try {
        const element = graphRef.current;
        if (!element) throw new Error("Graph element is null");

        const dataUrl = await import("html-to-image").then((module) =>
          module.toJpeg(element, {
            cacheBust: true,
            pixelRatio: 2,
            quality: 0.95,
          })
        );

        const link = document.createElement("a");
        link.download = `${searchUsername}-x-contributions-${selectedYear}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification("Image downloaded as JPEG instead of PNG", "success");
      } catch (fallbackErr) {
        console.error("Fallback export also failed:", fallbackErr);
        showNotification(
          "Failed to save image. Try taking a screenshot instead.",
          "error"
        );
      }
    }
  };

  const handleCopyImage = async () => {
    if (!graphRef.current) {
      console.error("Graph reference is null");
      showNotification("Cannot find the graph element to copy", "error");
      return;
    }

    try {
      // Ensure the graph is fully rendered before capturing
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Get element and background color safely
      const element = graphRef.current;
      const bgColor = element
        ? getComputedStyle(element).backgroundColor || "#16161e"
        : "#16161e";

      // Convert to blob for clipboard
      const blob = await import("html-to-image").then(async (module) => {
        const dataUrl = await module.toBlob(element, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: bgColor,
        });

        if (!dataUrl) {
          throw new Error("Failed to generate image blob");
        }

        return dataUrl;
      });

      // Use modern Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      showNotification("Image copied to clipboard!", "success");
    } catch (err) {
      console.error("Error copying image:", err);

      // Check if it's a clipboard permission error
      if (
        err instanceof Error &&
        (err.message.includes("permission") ||
          err.message.includes("secure context") ||
          err.message.includes("NotAllowedError"))
      ) {
        showNotification(
          "Browser blocked clipboard access. Check permissions.",
          "error"
        );
      } else {
        // Try fallback to PNG data URL
        try {
          const element = graphRef.current;
          if (!element) throw new Error("Graph element is null");

          const dataUrl = await import("html-to-image").then((module) =>
            module.toPng(element, {
              cacheBust: true,
              pixelRatio: 2,
            })
          );

          // Open in new tab as fallback
          const newTab = window.open();
          if (newTab) {
            // Use document.open() and document.close() instead of document.write()
            newTab.document.open();
            newTab.document.write(
              `<!DOCTYPE html>
              <html>
                <head>
                  <title>${searchUsername}'s Twitter Contributions</title>
                  <meta charset="utf-8">
                  <style>
                    body {
                      margin: 0;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      background: #111;
                      min-height: 100vh;
                      flex-direction: column;
                      font-family: system-ui, -apple-system, sans-serif;
                    }
                    img {
                      max-width: 100%;
                      border-radius: 8px;
                      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    }
                    p {
                      text-align: center;
                      color: #fff;
                      margin-top: 20px;
                    }
                  </style>
                </head>
                <body>
                  <img src="${dataUrl}" alt="Twitter Contribution Graph">
                  <p>Right-click on the image and select "Copy Image"</p>
                </body>
              </html>`
            );
            newTab.document.close();

            showNotification(
              "Image opened in new tab for manual copying",
              "success"
            );
          } else {
            throw new Error("Couldn't open new tab for image");
          }
        } catch (fallbackErr) {
          console.error("Fallback copy also failed:", fallbackErr);
          showNotification(
            "Failed to copy image. Try taking a screenshot instead.",
            "error"
          );
        }
      }
    }
  };

  // Get the days of the week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get the months
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Implement a manual loading state instead of relying on React Query
  const [manualLoading, setManualLoading] = useState(false);
  const [data, setData] = useState<TwitterStatsResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Function to manually fetch data
  const fetchData = useCallback(async () => {
    if (!searchUsername || !apiKey) return;

    try {
      setManualLoading(true);
      setError(null);

      console.log(`Manually fetching data for ${searchUsername}...`);
      const result = await fetchUserStats(searchUsername, apiKey);

      // Small delay to ensure UI updates properly
      await new Promise((resolve) => setTimeout(resolve, 300));

      setData(result as TwitterStatsResponse);
      setManualLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err as Error);
      setManualLoading(false);
    }
  }, [searchUsername, apiKey]);

  // Fetch data when username or apiKey changes
  useEffect(() => {
    if (searchUsername && apiKey) {
      fetchData();
    }
  }, [searchUsername, apiKey, fetchData]);

  useEffect(() => {
    // Check if data is TwitterStatsResponse by checking for userJoinYear property
    if (data && "userJoinYear" in data) {
      setAvailableYears(generateYearOptions(data.userJoinYear));
    }
  }, [data]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col items-center space-y-8">
        {/* Modern search box - shown only if hideSearchInput is false */}
        {!hideSearchInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-xl"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-gradient-to-r from-black/90 to-zinc-900/70 backdrop-blur-xl">
              {/* Animated background */}
              <div className="absolute inset-0 -z-10 opacity-20">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 animate-gradient"
                  style={{ backgroundSize: "200% 200%" }}
                />
              </div>

              <div className="relative flex items-center px-4 py-3">
                <div className="p-1.5 bg-purple-500/10 rounded-lg mr-3">
                  <Search className="h-5 w-5 text-purple-400" />
                </div>

                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    apiKey
                      ? "Enter a Twitter username..."
                      : "First add API key above, then enter username..."
                  }
                  className="flex-1 bg-transparent border-none text-white placeholder:text-gray-400 focus:ring-0 text-lg py-2"
                  disabled={!apiKey}
                />

                <motion.div
                  whileHover={{ scale: apiKey ? 1.05 : 1 }}
                  whileTap={{ scale: apiKey ? 0.95 : 1 }}
                >
                  <Button
                    onClick={handleSearch}
                    className={`relative overflow-hidden ml-2 rounded-xl ${
                      apiKey
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    } font-medium px-6 py-2 shadow-xl hover:shadow-purple-500/25`}
                    disabled={manualLoading || !apiKey}
                  >
                    {manualLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{apiKey ? "Search" : "Need API Key"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}

                    {/* Button shine effect */}
                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl">
                      <div
                        className={`absolute -inset-[100%] ${
                          apiKey ? "animate-[spin_4s_linear_infinite]" : ""
                        } bg-gradient-to-r from-transparent via-white/20 to-transparent`}
                        style={{ transform: "rotate(-45deg)" }}
                      ></div>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Username example hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-center text-sm text-gray-500"
            >
              {apiKey
                ? 'Try searching for usernames like "elonmusk" or "UtkarshTheDev"'
                : "Use the API key from above to start analyzing Twitter profiles"}
            </motion.p>
          </motion.div>
        )}

        {/* Enhanced loading state with spinner and facts */}
        {manualLoading && searchUsername && (
          <div className="w-full">
            <LoadingSpinner
              message={`Fetching tweets for @${searchUsername}`}
            />
          </div>
        )}

        {/* Replace error display with the ErrorState component */}
        {error && <ErrorState error={error} />}

        {/* Notification toast */}
        {notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 shadow-lg ${
              notification.type === "success"
                ? "bg-gradient-to-r from-green-500/90 to-emerald-600/90 text-white"
                : "bg-gradient-to-r from-red-500/90 to-rose-600/90 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <Check className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <p>{notification.message}</p>
            </div>
          </motion.div>
        )}

        {/* Enhanced data display - only show when data is available and not loading */}
        {data && !manualLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-black/95 to-zinc-900/80 p-6 backdrop-blur-xl shadow-2xl"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="heading-cabinet text-2xl font-bold text-white">
                  <motion.span
                    initial={{ backgroundPosition: "0% 50%" }}
                    animate={{ backgroundPosition: "100% 50%" }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text bg-[size:200%] text-transparent"
                  >
                    @{searchUsername}
                  </motion.span>
                  &apos;s X Contributions
                </h2>
                <p className="text-sm text-gray-400">
                  <span className="stat-cabinet">
                    {(data as TwitterStatsResponse).totalPosts}
                  </span>{" "}
                  posts in {selectedYear}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Theme Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                      >
                        <PaintBucket className="h-4 w-4 text-indigo-400" />
                        <span>{selectedTheme.name}</span>
                        <ChevronDown className="h-3 w-3 opacity-70" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-black/90 border-white/10 text-white"
                  >
                    {themes.map((theme) => (
                      <DropdownMenuItem
                        key={theme.name}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-white/5",
                          theme.name === selectedTheme.name ? "bg-white/10" : ""
                        )}
                        onClick={() => setSelectedTheme(theme)}
                      >
                        {theme.name === selectedTheme.name && (
                          <Check className="h-4 w-4 text-indigo-400" />
                        )}
                        <span>{theme.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Year Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                      >
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span>{selectedYear}</span>
                        <ChevronDown className="h-3 w-3 opacity-70" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-black/90 border-white/10 text-white max-h-48 overflow-y-auto"
                  >
                    {availableYears.map((year) => (
                      <DropdownMenuItem
                        key={year}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-white/5",
                          year === selectedYear ? "bg-white/10" : ""
                        )}
                        onClick={() => setSelectedYear(year)}
                      >
                        {year === selectedYear && (
                          <Check className="h-4 w-4 text-blue-400" />
                        )}
                        <span>{year}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Export Image Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-indigo-500/20 hover:border-indigo-500/50 relative"
                    onClick={handleExportImage}
                  >
                    <Download className="h-4 w-4" />
                    <span>Save</span>
                    <span className="absolute inset-0 bg-indigo-500/10 opacity-0 hover:opacity-100 transition-opacity rounded-lg"></span>
                  </Button>
                </motion.div>

                {/* Copy Image Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-blue-500/20 hover:border-blue-500/50 relative"
                    onClick={handleCopyImage}
                  >
                    <Camera className="h-4 w-4" />
                    <span>Copy</span>
                    <span className="absolute inset-0 bg-blue-500/10 opacity-0 hover:opacity-100 transition-opacity rounded-lg"></span>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Contribution Graph */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              ref={graphRef}
              className={cn(
                "rounded-lg border border-white/10 p-6 pb-8 overflow-auto relative",
                selectedTheme.background,
                selectedTheme.text
              )}
              id="contribution-graph"
            >
              {/* Month labels with improved positioning */}
              <div className="relative mb-4 pl-8">
                <div className="relative flex">
                  {(
                    data as TwitterStatsResponse
                  ).contributionGraph?.monthRanges?.map(
                    (range: MonthRange, i: number) => {
                      // Calculate position based on week ranges
                      const startPercent =
                        (range.startWeek /
                          (data as TwitterStatsResponse).contributionGraph.graph
                            .length) *
                        100;
                      const endPercent =
                        ((range.endWeek + 1) /
                          (data as TwitterStatsResponse).contributionGraph.graph
                            .length) *
                        100;
                      const width = endPercent - startPercent;

                      return (
                        <div
                          key={i}
                          className="text-xs font-medium opacity-70 absolute"
                          style={{
                            left: `${startPercent}%`,
                            width: `${width}%`,
                            textAlign: "center",
                          }}
                        >
                          {months[range.month]}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="flex mt-2">
                {/* Day of week labels - left side */}
                <div className="mr-4 space-y-8 mt-2">
                  {daysOfWeek.map(
                    (day, i) =>
                      i % 2 === 0 && (
                        <div
                          key={i}
                          className="h-[14px] text-xs font-medium opacity-70"
                        >
                          {day}
                        </div>
                      )
                  )}
                </div>

                {/* Contribution cells grid with animation */}
                <div className="grid grid-rows-7 grid-flow-col gap-[8px] mt-2">
                  {(data as TwitterStatsResponse).contributionGraph?.graph
                    .flat()
                    .map(
                      (
                        day: {
                          date: string;
                          count: number;
                          level: number;
                          month: number;
                          day: number;
                          weekday: number;
                        },
                        i: number
                      ) => (
                        <TooltipProvider key={i}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                  scale: 1,
                                  opacity: 1,
                                  transition: {
                                    delay: i * 0.0005, // Create a cascade effect
                                    duration: 0.2,
                                  },
                                }}
                                whileHover={{ scale: 1.3, zIndex: 10 }}
                                className={`h-[18px] w-[18px] rounded-sm transition-colors duration-200 ${
                                  day.count === 0 ? "border border-white/5" : ""
                                }`}
                                style={{
                                  backgroundColor: getActivityColor(
                                    day.count,
                                    selectedTheme
                                  ),
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              {day.count} posts on {formatDate(day.date)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <span className="text-xs font-medium opacity-70">Less</span>
                <div className="h-[12px] w-[12px] rounded-sm border border-white/10"></div>
                {selectedTheme.colors.map((color, i) => (
                  <div
                    key={i}
                    className="h-[12px] w-[12px] rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <span className="text-xs font-medium opacity-70">More</span>
              </div>
            </motion.div>

            {/* Contribution Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="mt-6 rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900/40 to-black/80 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-0">
                  <h3 className="text-sm font-medium text-gray-300">
                    Tweet Stats
                  </h3>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-0">
                  {/* Total Posts */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(79, 70, 229, 0.2)",
                      borderColor: "rgba(79, 70, 229, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Total Posts</p>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <span className="stat-cabinet text-2xl font-bold text-blue-400">
                          {(data as TwitterStatsResponse).totalPosts}
                        </span>
                        <p className="text-xs text-gray-500">Total Posts</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Current Streak */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
                      borderColor: "rgba(99, 102, 241, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Current Streak</p>
                    <p className="text-2xl font-bold text-white">
                      {(data as TwitterStatsResponse).currentStreak}
                      <span className="ml-1 text-xs text-gray-500">days</span>
                    </p>
                  </motion.div>

                  {/* Best Streak */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(67, 56, 202, 0.2)",
                      borderColor: "rgba(67, 56, 202, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Best Streak</p>
                    <p className="text-2xl font-bold text-white">
                      {(data as TwitterStatsResponse).bestStreak}
                      <span className="ml-1 text-xs text-gray-500">days</span>
                    </p>
                    {(data as TwitterStatsResponse).bestStreakPeriod && (
                      <p className="text-xs text-gray-500 truncate">
                        {(data as TwitterStatsResponse).bestStreakPeriod}
                      </p>
                    )}
                  </motion.div>

                  {/* Avg Posts/Day */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(20, 184, 166, 0.2)",
                      borderColor: "rgba(20, 184, 166, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Avg Posts/Day</p>
                    <p className="text-2xl font-bold text-white">
                      {(data as TwitterStatsResponse).averagePostsPerDay}
                    </p>
                  </motion.div>

                  {/* Most Active Day */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
                      borderColor: "rgba(99, 102, 241, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Most Active Day</p>
                    <p className="text-xl font-bold text-white">
                      {(data as TwitterStatsResponse).mostActiveDayOfWeek?.day}
                    </p>
                    <p className="text-xs text-gray-500">
                      {
                        (data as TwitterStatsResponse).mostActiveDayOfWeek
                          ?.count
                      }{" "}
                      posts
                    </p>
                  </motion.div>

                  {/* Most Active Month */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
                      borderColor: "rgba(245, 158, 11, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Most Active Month</p>
                    <p className="text-xl font-bold text-white">
                      {(data as TwitterStatsResponse).mostActiveMonth?.month}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(data as TwitterStatsResponse).mostActiveMonth?.count}{" "}
                      posts
                    </p>
                  </motion.div>

                  {/* Most Posts on a day */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
                      borderColor: "rgba(99, 102, 241, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Most Posts on</p>
                    <p className="text-xl font-bold text-white truncate">
                      {(data as TwitterStatsResponse).bestDay?.date || "N/A"}
                    </p>
                    {(data as TwitterStatsResponse).bestDay && (
                      <p className="text-xs text-gray-500">
                        {(data as TwitterStatsResponse).bestDay.count} posts
                      </p>
                    )}
                  </motion.div>

                  {/* Average Likes */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)",
                      borderColor: "rgba(239, 68, 68, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Avg Likes/Post</p>
                    <p className="text-2xl font-bold text-white">
                      {(
                        data as TwitterStatsResponse
                      ).averageEngagement?.likes.toFixed(1)}
                    </p>
                  </motion.div>

                  {/* Average Retweets */}
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)",
                      borderColor: "rgba(16, 185, 129, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Avg Retweets/Post</p>
                    <p className="text-2xl font-bold text-white">
                      {(
                        data as TwitterStatsResponse
                      ).averageEngagement?.retweets.toFixed(1)}
                    </p>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Hashtags Section */}
              {(data as TwitterStatsResponse).topHashtags &&
                (data as TwitterStatsResponse).topHashtags.length > 0 && (
                  <Card className="mt-4 rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900/40 to-black/80 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                      <h3 className="text-sm font-medium text-gray-300">
                        Top Hashtags
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {(data as TwitterStatsResponse).topHashtags.map(
                          (
                            tag: { tag: string; count: number },
                            index: number
                          ) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-2 py-1 rounded-full bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30"
                            >
                              #{tag.tag}
                              <span className="ml-1 text-xs text-gray-400">
                                ({tag.count})
                              </span>
                            </Badge>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Viral Tweet Section */}
              {(data as TwitterStatsResponse).viralTweet && (
                <Card className="mt-4 rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900/40 to-black/80 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                    <h3 className="text-sm font-medium text-gray-300">
                      Your Most Viral Tweet
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                      <p className="text-white mb-3">
                        {(data as TwitterStatsResponse).viralTweet?.text}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">
                          {(data as TwitterStatsResponse).viralTweet?.date}
                        </span>
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1 text-red-400">
                            <Heart className="h-4 w-4" />
                            {(data as TwitterStatsResponse).viralTweet?.likes}
                          </span>
                          <span className="flex items-center gap-1 text-green-400">
                            <Repeat className="h-4 w-4" />
                            {
                              (data as TwitterStatsResponse).viralTweet
                                ?.retweets
                            }
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-sm text-purple-400 font-medium">
                          This tweet performed{" "}
                          {
                            (data as TwitterStatsResponse).viralTweet
                              ?.engagementRatio
                          }
                          x better than your average tweet!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Twitter Personality Section */}
              <Card className="mt-4 rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900/40 to-black/80 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                  <h3 className="text-sm font-medium text-gray-300">
                    Your Twitter Personality
                  </h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-center">
                    <h4 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {(data as TwitterStatsResponse).twitterPersonality.type}
                    </h4>
                    <p className="text-gray-300 mt-2">
                      {
                        (data as TwitterStatsResponse).twitterPersonality
                          .description
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Posting Patterns Section */}
              <Card className="mt-4 rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900/40 to-black/80 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                  <h3 className="text-sm font-medium text-gray-300">
                    Posting Patterns
                  </h3>
                </CardHeader>
                <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Posting Time Analysis */}
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">
                      Peak Posting Time
                    </h4>
                    <p className="text-xl font-bold text-blue-400">
                      {
                        (data as TwitterStatsResponse).postingTimeAnalysis
                          .peakHour
                      }
                    </p>
                    {/* Fixed-height bars for posting time distribution */}
                    <div className="mt-4">
                      <div className="grid grid-cols-4 gap-3">
                        {[0, 6, 12, 18].map((hourIndex) => {
                          // Get the hour data
                          const hour = (data as TwitterStatsResponse)
                            .postingTimeAnalysis.hourlyDistribution[hourIndex];

                          return (
                            <div key={hourIndex} className="text-center">
                              <div
                                className="h-16 w-full rounded-md mx-auto flex items-center justify-center"
                                style={{
                                  backgroundColor:
                                    hour.count > 0
                                      ? "rgba(59, 130, 246, 0.3)"
                                      : "rgba(30, 41, 59, 0.4)",
                                  border: "1px solid rgba(59, 130, 246, 0.3)",
                                }}
                              >
                                <span className="text-sm font-medium text-white">
                                  {hour.count}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400 mt-2 block">
                                {hour.formattedHour}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Optimal Posting Time */}
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">
                      Best Time for Engagement
                    </h4>
                    <p className="text-xl font-bold text-green-400">
                      {
                        (data as TwitterStatsResponse).tweetTimingEffectiveness
                          .optimalPostingTime.formattedHour
                      }
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Posts at this time average{" "}
                      {
                        (data as TwitterStatsResponse).tweetTimingEffectiveness
                          .optimalPostingTime.avgEngagement
                      }{" "}
                      engagements
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-sm text-purple-400">
                        Posting at your optimal time could increase engagement
                        by up to
                        {Math.round(
                          ((data as TwitterStatsResponse)
                            .tweetTimingEffectiveness.optimalPostingTime
                            .avgEngagement /
                            ((data as TwitterStatsResponse).engagementEfficiency
                              .engagementPerPost || 1)) *
                            100 -
                            100
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consistency & Engagement Section */}
              <Card className="mt-4 rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900/40 to-black/80 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                  <h3 className="text-sm font-medium text-gray-300">
                    Consistency & Engagement
                  </h3>
                </CardHeader>
                <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Consistency Score */}
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">
                      Consistency Score
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20"></div>
                        <div className="absolute inset-2 rounded-full bg-black"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-400">
                            {
                              (data as TwitterStatsResponse).consistencyMetrics
                                .consistencyScore
                            }
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300">
                          You tweeted on{" "}
                          {
                            (data as TwitterStatsResponse).consistencyMetrics
                              .daysWithTweets
                          }{" "}
                          of{" "}
                          {
                            (data as TwitterStatsResponse).consistencyMetrics
                              .daysPassed
                          }{" "}
                          days
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Regularity score:{" "}
                          {
                            (data as TwitterStatsResponse).consistencyMetrics
                              .regularityScore
                          }
                          /100
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Efficiency */}
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">
                      Engagement Efficiency
                    </h4>
                    <p className="text-xl font-bold text-purple-400">
                      {
                        (data as TwitterStatsResponse).engagementEfficiency
                          .efficiencyScore
                      }
                    </p>
                    <p className="text-sm text-gray-400">
                      Engagements per post per day
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-sm text-blue-400">
                        {
                          (data as TwitterStatsResponse).engagementEfficiency
                            .engagementPerPost
                        }{" "}
                        engagements per post
                      </p>
                    </div>
                  </div>

                  {/* Conversation Metrics */}
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">
                      Conversation Metrics
                    </h4>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xl font-bold text-blue-400">
                          {
                            (data as TwitterStatsResponse).conversationMetrics
                              .replyPercentage
                          }
                          %
                        </p>
                        <p className="text-sm text-gray-400">
                          Tweets are replies
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-indigo-400">
                          {
                            (data as TwitterStatsResponse).conversationMetrics
                              .uniqueConversations
                          }
                        </p>
                        <p className="text-sm text-gray-400">
                          Unique conversations
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tweet Sources */}
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">
                      Tweet Sources
                    </h4>
                    <div className="space-y-2">
                      {(data as TwitterStatsResponse).tweetSources
                        .slice(0, 3)
                        .map((source, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-gray-300">
                              {source.source}
                            </span>
                            <span className="text-sm text-blue-400">
                              {source.percentage}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer Note */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Note: Stats are calculated based on available tweets and may
                  not represent your complete Twitter activity. Due to API
                  limitations, some tweets or engagement metrics might be
                  missing.
                </p>
                {data && typeof data === "object" && "totalPosts" in data && (
                  <p className="text-xs text-gray-500 mt-1">
                    Analysis based on{" "}
                    {(data as TwitterStatsResponse).totalPosts} tweets.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Update the interface definition to include the missing fields from the linter errors
interface TwitterApiResponse {
  user?: TwitterUser;
  tweets?: PartialTweet[];
  total_fetched?: number;
  total_returned?: number;
  total_profile_tweets?: number;
  payment_error?: string;
}

// Then use type predicates to safely access properties
export const Tweets = ({
  data,
}: {
  data: TwitterStatsResponse | TwitterApiResponse | null;
}) => {
  // Extract data safely using optional chaining
  const user = data && "user" in data ? data.user : undefined;
  const tweets = data && "tweets" in data ? data.tweets : undefined;
  const total_fetched =
    data && "total_fetched" in data ? data.total_fetched : undefined;
  const total_returned =
    data && "total_returned" in data ? data.total_returned : undefined;
  const total_profile_tweets =
    data && "total_profile_tweets" in data
      ? data.total_profile_tweets
      : undefined;
  // const payment_error =
  //   data && "payment_error" in data ? data.payment_error : undefined;

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      {user && (
        <Card className="mx-auto mb-6 max-w-xl border-white/10 bg-black/60 backdrop-blur-xl">
          <CardContent className="py-4 flex items-center gap-4">
            {user.profile_image_url_https ? (
              <Avatar className="h-16 w-16 border border-white/10">
                <AvatarImage
                  src={user.profile_image_url_https}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-500 text-white text-2xl font-bold">
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400">@{user.screen_name}</p>
              <div className="mt-1 flex gap-4 text-sm text-gray-400">
                <span>
                  {user.statuses_count.toLocaleString()} tweets in profile
                </span>
                <span>{user.followers_count.toLocaleString()} followers</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tweet Data */}
      <TweetData data={{ tweets }} />

      {/* Stats */}
      {total_profile_tweets && total_fetched && (
        <p className="mt-4 text-center text-sm text-gray-400">
          Showing {total_returned} of approximately {total_profile_tweets}{" "}
          tweets ({Math.round((total_fetched / total_profile_tweets) * 100)}%
          coverage).
        </p>
      )}

      {/* New content */}
      <p className="text-gray-500 mt-2 mb-4">
        We couldn&apos;t find any tweets for the search query. Try something
        else!
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Already using Twitter&apos;s analytics? Our platform provides deeper
        insights and better data visualization.
      </p>
    </div>
  );
};

// Add ErrorState function component to fix error handling
const ErrorState = ({ error }: { error: unknown }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center p-8 rounded-lg bg-black/30 border border-white/5 my-4"
  >
    <div className="bg-red-500/20 p-3 rounded-full mb-3">
      <AlertTriangle className="h-6 w-6 text-red-500" />
    </div>
    <h3 className="heading-cabinet text-lg font-medium text-red-400">
      Error fetching tweets
    </h3>
    <p className="mt-1 text-sm text-gray-400">
      {typeof error === "string"
        ? error
        : "Failed to load data. Please try again."}
    </p>
  </motion.div>
);
