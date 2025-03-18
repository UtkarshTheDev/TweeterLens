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

const themes = [
  {
    name: "GitHub",
    colors: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    background: "bg-gray-50",
    text: "text-gray-900",
  },
  {
    name: "Twilight",
    colors: ["#1e1e2e", "#8839ef", "#cba6f7", "#f5c2e7", "#fab387"],
    background: "bg-[#181825]",
    text: "text-gray-100",
  },
  {
    name: "Fire",
    colors: ["#141321", "#581c87", "#7e22ce", "#c026d3", "#f97316"],
    background: "bg-[#0f0f17]",
    text: "text-orange-100",
  },
  {
    name: "Ocean",
    colors: ["#0c1020", "#0c4a6e", "#0369a1", "#0ea5e9", "#7dd3fc"],
    background: "bg-[#080f1a]",
    text: "text-blue-100",
  },
  {
    name: "Forest",
    colors: ["#0f172a", "#064e3b", "#047857", "#10b981", "#ecfdf5"],
    background: "bg-[#0b1219]",
    text: "text-green-100",
  },
];

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

export const TwitterFeed = () => {
  const [username, setUsername] = useState("UtkarshTheDev");
  const [searchUsername, setSearchUsername] = useState("UtkarshTheDev");
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([
    selectedYear,
  ]);
  const graphRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tweets-stats", searchUsername, selectedYear],
    queryFn: () => fetchUserStats(searchUsername, selectedYear),
    staleTime: 1000 * 60 * 5, // 5 min caching in frontend
    enabled: false, // Don't fetch on component mount
  });

  useEffect(() => {
    if (data?.userJoinYear) {
      setAvailableYears(generateYearOptions(data.userJoinYear));
    }
  }, [data]);

  const handleSearch = () => {
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex w-full max-w-md items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Twitter Username"
              className="w-full rounded-full border border-white/10 bg-black/50 px-10 py-3 text-sm text-white shadow-lg backdrop-blur-xl transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-3 text-white shadow-lg transition-all hover:shadow-blue-500/25"
          >
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-400">Loading contributions...</span>
          </motion.div>
        )}

        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-900/20 p-4 text-red-400 backdrop-blur-xl"
          >
            Failed to load contributions. Please try again.
          </motion.div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    @{searchUsername}
                  </span>
                  's X Contributions
                </h2>
                <p className="text-sm text-gray-400">
                  {data.totalPosts} posts in {selectedYear}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Theme Selector */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white shadow-lg transition-all hover:border-blue-500/50"
                  >
                    <PaintBucket className="h-4 w-4" />
                    <span>{selectedTheme.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </motion.button>

                  {themeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-lg border border-white/10 bg-black/80 shadow-lg backdrop-blur-xl"
                    >
                      {themes.map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() => {
                            setSelectedTheme(theme);
                            setThemeMenuOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-white/5",
                            selectedTheme.name === theme.name
                              ? "text-blue-400"
                              : "text-white"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-12 rounded-full overflow-hidden">
                              {theme.colors.map((color, i) => (
                                <div
                                  key={i}
                                  className="flex-1 h-full"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <span>{theme.name}</span>
                          </div>
                          {selectedTheme.name === theme.name && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Year Selector */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setYearMenuOpen(!yearMenuOpen)}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white shadow-lg transition-all hover:border-blue-500/50"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{selectedYear}</span>
                    <ChevronDown className="h-4 w-4" />
                  </motion.button>

                  {yearMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 z-50 mt-1 max-h-60 w-32 overflow-y-auto rounded-lg border border-white/10 bg-black/80 shadow-lg backdrop-blur-xl"
                    >
                      {availableYears.map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year);
                            setYearMenuOpen(false);
                            refetch();
                          }}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-white/5",
                            selectedYear === year
                              ? "text-blue-400"
                              : "text-white"
                          )}
                        >
                          <span>{year}</span>
                          {selectedYear === year && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Export Image Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportImage}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white shadow-lg transition-all hover:border-blue-500/50"
                >
                  <Download className="h-4 w-4" />
                  <span>Save</span>
                </motion.button>

                {/* Copy Image Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyImage}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white shadow-lg transition-all hover:border-blue-500/50"
                >
                  <Camera className="h-4 w-4" />
                  <span>Copy</span>
                </motion.button>
              </div>
            </div>

            {/* Contribution Graph */}
            <div
              ref={graphRef}
              className={cn(
                "rounded-lg border border-white/10 p-4 overflow-auto",
                selectedTheme.background,
                selectedTheme.text
              )}
            >
              <div className="mb-4 flex justify-center space-x-8">
                {months.map((month, i) => (
                  <div key={i} className="text-xs font-medium opacity-70">
                    {month}
                  </div>
                ))}
              </div>

              <div className="flex">
                <div className="mr-2 space-y-4">
                  {daysOfWeek.map(
                    (day, i) =>
                      i % 2 === 0 && (
                        <div
                          key={i}
                          className="h-[11px] text-xs font-medium opacity-70"
                        >
                          {day}
                        </div>
                      )
                  )}
                </div>

                <div className="grid grid-flow-col gap-1">
                  {data.contributionGraph.map(
                    (week: any[], weekIndex: number) => (
                      <div key={weekIndex} className="grid grid-flow-row gap-1">
                        {week.map((day: any, dayIndex: number) => (
                          <motion.div
                            key={`${weekIndex}-${dayIndex}`}
                            whileHover={{ scale: 1.2 }}
                            className="group relative h-[11px] w-[11px] rounded-sm transition-all duration-300"
                            style={{
                              backgroundColor: selectedTheme.colors[day.level],
                            }}
                          >
                            <div className="absolute -left-1 -top-8 hidden min-w-max rounded-md border border-white/10 bg-black/90 px-2 py-1 text-xs group-hover:block">
                              <div className="font-bold">{day.count} posts</div>
                              <div className="text-gray-400">on {day.date}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <span className="text-xs font-medium opacity-70">Less</span>
                {selectedTheme.colors.map((color, i) => (
                  <div
                    key={i}
                    className="h-[10px] w-[10px] rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <span className="text-xs font-medium opacity-70">More</span>
              </div>
            </div>

            {/* Contribution Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="rounded-lg border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 text-center"
              >
                <div className="text-2xl font-bold text-white">
                  {data.totalPosts}
                </div>
                <div className="text-xs text-gray-400">Total Posts</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="rounded-lg border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 text-center"
              >
                <div className="text-2xl font-bold text-white">
                  {data.bestStreak}
                </div>
                <div className="text-xs text-gray-400">Best Streak</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="rounded-lg border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 text-center"
              >
                <div className="text-2xl font-bold text-white">
                  {data.averagePostsPerDay}
                </div>
                <div className="text-xs text-gray-400">Avg Posts/Day</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="rounded-lg border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 text-center"
              >
                <div className="text-2xl font-bold text-white">
                  {data.bestDay?.count || 0}
                </div>
                <div className="text-xs text-gray-400">
                  Most Posts on {data.bestDay?.date || "N/A"}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
