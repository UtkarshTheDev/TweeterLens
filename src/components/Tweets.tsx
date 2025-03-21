"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Twitter,
  Calendar,
  ArrowRight,
  Download,
  Camera,
  PaintBucket,
  ChevronDown,
  Check,
} from "lucide-react";
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

const themes = [
  {
    name: "GitHub",
    colors: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    background: "bg-gray-50",
    text: "text-gray-900",
  },
  {
    name: "Dracula",
    colors: ["#282a36", "#bd93f9", "#ff79c6", "#50fa7b", "#f1fa8c"],
    background: "bg-[#181820]",
    text: "text-gray-100",
  },
  {
    name: "Nord",
    colors: ["#2e3440", "#5e81ac", "#81a1c1", "#88c0d0", "#8fbcbb"],
    background: "bg-[#242933]",
    text: "text-blue-100",
  },
  {
    name: "Tokyo Night",
    colors: ["#1a1b26", "#414868", "#565f89", "#7aa2f7", "#bb9af7"],
    background: "bg-[#16161e]",
    text: "text-indigo-100",
  },
  {
    name: "Monokai",
    colors: ["#272822", "#f92672", "#fd971f", "#a6e22e", "#66d9ef"],
    background: "bg-[#1e1f1c]",
    text: "text-yellow-100",
  },
  {
    name: "Solarized",
    colors: ["#002b36", "#2aa198", "#268bd2", "#859900", "#b58900"],
    background: "bg-[#073642]",
    text: "text-cyan-100",
  },
  {
    name: "Catppuccin",
    colors: ["#1e1e2e", "#f5c2e7", "#cba6f7", "#94e2d5", "#a6e3a1"],
    background: "bg-[#181825]",
    text: "text-pink-100",
  },
  {
    name: "Gruvbox",
    colors: ["#282828", "#cc241d", "#d79921", "#98971a", "#458588"],
    background: "bg-[#1d2021]",
    text: "text-yellow-100",
  },
];

interface TwitterStatsResponse {
  totalPosts: number;
  bestStreak: number;
  averagePostsPerDay: number;
  bestDay: {
    count: number;
    date: string;
  };
  userJoinYear: number;
  contributionGraph: {
    graph: { date: string; count: number }[];
    monthRanges: MonthRange[];
  };
}

const fetchUserStats = async (username: string, year: number) => {
  const res = await fetch(
    `/api/twitter/stats?username=${username}&year=${year}`
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
 */
const getActivityColor = (count: number, theme: ThemeOption): string => {
  if (count === 0) return "bg-gray-100 dark:bg-gray-800";
  if (count < 2) return theme.colors[0];
  if (count < 5) return theme.colors[1];
  if (count < 10) return theme.colors[2];
  return theme.colors[3];
};

export const TwitterFeed = () => {
  const [username, setUsername] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([
    selectedYear,
  ]);
  const graphRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, refetch } = useQuery<TwitterStatsResponse>({
    queryKey: ["userStats", searchUsername, selectedYear],
    queryFn: () => fetchUserStats(searchUsername, selectedYear),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: searchUsername.length > 0,
  });

  useEffect(() => {
    if (data?.userJoinYear) {
      setAvailableYears(generateYearOptions(data.userJoinYear));
    }
  }, [data]);

  const handleSearch = () => {
    if (!username.trim()) return;
    setSearchUsername(username);
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleExportImage = async () => {
    if (graphRef.current) {
      try {
        const dataUrl = await toPng(graphRef.current, { cacheBust: true });
        const link = document.createElement("a");
        link.download = `${searchUsername}-x-contributions-${selectedYear}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Error exporting image:", err);
      }
    }
  };

  const handleCopyImage = async () => {
    if (graphRef.current) {
      try {
        const dataUrl = await toPng(graphRef.current, { cacheBust: true });
        const blob = await fetch(dataUrl).then((res) => res.blob());
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      } catch (err) {
        console.error("Error copying image:", err);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center space-y-8">
        {/* Modern search box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl">
            {/* Animated background */}
            <div className="absolute inset-0 -z-10 opacity-30">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient"
                style={{ backgroundSize: "200% 200%" }}
              />
            </div>

            <div className="relative flex items-center px-4 py-3">
              <Search className="mr-3 h-5 w-5 text-blue-400" />

              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a Twitter username..."
                className="flex-1 bg-transparent border-none text-white placeholder:text-gray-400 focus:ring-0 text-lg py-2"
              />

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleSearch}
                  className="relative overflow-hidden ml-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium px-6 py-2 shadow-xl hover:shadow-blue-500/25"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Search</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}

                  {/* Button shine effect */}
                  <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl">
                    <div
                      className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
            Try searching for usernames like "elonmusk" or "UtkarshTheDev"
          </motion.p>
        </motion.div>

        {/* Enhanced loading state */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center p-8"
          >
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 h-full w-full animate-ping rounded-full bg-blue-500 opacity-20"></div>
              <div className="absolute inset-0 h-full w-full animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-40"></div>
              <div className="absolute inset-2 flex items-center justify-center rounded-full bg-black">
                <Twitter className="h-8 w-8 animate-pulse text-blue-400" />
              </div>
            </div>
            <p className="mt-4 text-gray-400">Fetching Twitter data...</p>
          </motion.div>
        )}

        {/* Better error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-xl border border-red-500/20 bg-gradient-to-r from-red-950/20 to-black/60 p-6 text-center backdrop-blur-xl"
          >
            <div className="mb-2 flex justify-center">
              <div className="rounded-full bg-red-500/10 p-3">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-red-400">
              Failed to Load Data
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              We couldn't fetch the contributions. Please check the username and
              try again.
            </p>
          </motion.div>
        )}

        {/* Enhanced data display */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80 p-6 backdrop-blur-xl shadow-2xl"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  <motion.span
                    initial={{ backgroundPosition: "0% 50%" }}
                    animate={{ backgroundPosition: "100% 50%" }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text bg-[size:200%] text-transparent"
                  >
                    @{searchUsername}
                  </motion.span>
                  's X Contributions
                </h2>
                <p className="text-sm text-gray-400">
                  {data.totalPosts} posts in {selectedYear}
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
                        <PaintBucket className="h-4 w-4 text-blue-400" />
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
                          <Check className="h-4 w-4 text-blue-400" />
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
                        <Calendar className="h-4 w-4 text-purple-400" />
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
                          <Check className="h-4 w-4 text-purple-400" />
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
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-blue-500/20 hover:border-blue-500/50"
                    onClick={handleExportImage}
                  >
                    <Download className="h-4 w-4" />
                    <span>Save</span>
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
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-purple-500/20 hover:border-purple-500/50"
                    onClick={handleCopyImage}
                  >
                    <Camera className="h-4 w-4" />
                    <span>Copy</span>
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
                "rounded-lg border border-white/10 p-6 overflow-auto",
                selectedTheme.background,
                selectedTheme.text
              )}
            >
              {/* Month labels with improved positioning */}
              <div className="relative mb-8 pl-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-b border-white/5"></div>
                </div>
                <div className="relative flex justify-between">
                  {data?.contributionGraph?.monthRanges?.map(
                    (range: MonthRange, i: number) => {
                      // Calculate position based on week ranges
                      const startPercent =
                        (range.startWeek /
                          data.contributionGraph.graph.length) *
                        100;
                      const endPercent =
                        ((range.endWeek + 1) /
                          data.contributionGraph.graph.length) *
                        100;
                      const width = endPercent - startPercent;

                      return (
                        <div
                          key={i}
                          className="text-xs font-medium opacity-70"
                          style={{
                            width: `${width}%`,
                            marginLeft: i === 0 ? `${startPercent}%` : 0,
                            textAlign: width < 10 ? "center" : "start",
                            paddingLeft: width < 10 ? 0 : "8px",
                          }}
                        >
                          {months[range.month]}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="flex">
                {/* Day of week labels - left side */}
                <div className="mr-4 space-y-6">
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
                <div className="grid grid-rows-7 grid-flow-col gap-1">
                  {data?.contributionGraph?.graph.map((day, i) => (
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
                            className="h-3.5 w-3.5 rounded-sm transition-colors duration-200"
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
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <span className="text-xs font-medium opacity-70">Less</span>
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
              <Card className="mt-6 rounded-xl border border-white/10 bg-gradient-to-r from-gray-900/40 to-black/40 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-0">
                  <h3 className="text-sm font-medium text-gray-300">
                    Tweet Stats
                  </h3>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 pt-0">
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)",
                      borderColor: "rgba(59, 130, 246, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Total Posts</p>
                    <p className="text-2xl font-bold text-white">
                      {data.totalPosts}
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
                      borderColor: "rgba(99, 102, 241, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Best Streak</p>
                    <p className="text-2xl font-bold text-white">
                      {data.bestStreak}
                      <span className="ml-1 text-xs text-gray-500">days</span>
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)",
                      borderColor: "rgba(139, 92, 246, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Avg Posts/Day</p>
                    <p className="text-2xl font-bold text-white">
                      {data.averagePostsPerDay}
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 20px rgba(236, 72, 153, 0.2)",
                      borderColor: "rgba(236, 72, 153, 0.4)",
                    }}
                    className="rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <p className="text-xs text-gray-500">Most Posts on</p>
                    <p className="text-xl font-bold text-white truncate">
                      {data.bestDay?.date || "N/A"}
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Add this export for the Tweets component that will be used in the tweets page
export const Tweets = ({ data }: { data: any }) => {
  // Extract user data and tweets from the response
  const {
    user,
    tweets,
    total_fetched,
    total_returned,
    total_profile_tweets,
    payment_error,
  } = data || {};

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
              <Avatar className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
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
      {total_profile_tweets && (
        <p className="mt-4 text-center text-sm text-gray-400">
          Showing {total_returned} of approximately {total_profile_tweets}{" "}
          tweets ({Math.round((total_fetched / total_profile_tweets) * 100)}%
          coverage).
        </p>
      )}
    </div>
  );
};
