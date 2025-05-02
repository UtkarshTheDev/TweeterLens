"use client";
import { useState, useEffect } from "react";
import { TwitterFeed } from "../components/Tweets";
import {
  Twitter,
  Github,
  Database,
  Search,
  BarChart2,
  Zap,
  ArrowRight,
  Key,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [username, setUsername] = useState("");
  const [searchUsername, setSearchUsername] = useState("");

  // Check if API key exists on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("socialdataApiKey");
    if (savedApiKey) {
      setHasApiKey(true);
    }
  }, []);

  const handleApiKeySaved = (key: string) => {
    setHasApiKey(true);
    setShowApiKeyInput(false);
  };

  const handleShowApiKeyInput = () => {
    setShowApiKeyInput(true);
  };

  const cancelApiConfig = () => {
    // Only allow cancellation if the user already has an API key
    if (hasApiKey) {
      setShowApiKeyInput(false);
    }
  };

  const handleSearch = () => {
    if (username.trim()) {
      setSearchUsername(username);
      // Scroll to search section
      const searchSection = document.getElementById("search");
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Enhanced background with subtle grid pattern */}
      <div className="absolute top-0 left-0 right-0 -z-10 overflow-hidden h-[70vh]">
        <div className="absolute left-0 right-0 top-[-5%] h-[800px] w-full rounded-full bg-[radial-gradient(ellipse_at_top,rgba(120,58,240,0.2),transparent_70%)]"></div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        {/* Animated particles */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse"
            style={{ top: "20%", left: "30%" }}
          ></div>
          <div
            className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse"
            style={{ top: "50%", left: "20%", animationDelay: "1s" }}
          ></div>
          <div
            className="absolute h-2 w-2 rounded-full bg-indigo-400 animate-pulse"
            style={{ top: "30%", left: "70%", animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse"
            style={{ top: "60%", left: "80%", animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse"
            style={{ top: "70%", left: "40%", animationDelay: "2s" }}
          ></div>
        </div>
      </div>

      {/* Enhanced header with glass morphism */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative h-12 w-12 flex items-center justify-center"
              >
                {/* Simplified icon without background for minimal look */}
                <div className="relative z-10 h-8 w-8 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.08, 1],
                      rotate: [0, 2, 0, -2, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <BarChart3 className="h-7 w-7 text-indigo-400 drop-shadow-md" />
                  </motion.div>
                </div>
              </motion.div>
              <h1 className="font-cabinet relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-2xl font-semibold tracking-normal drop-shadow-sm">
                <span className="mr-1">Tweeter</span>
                <span className="font-extrabold">Lens</span>
              </h1>
            </motion.div>

            <div className="flex items-center gap-4">
              {/* Raw Tweets Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-3 h-9 rounded-full border-white/10 bg-black/50 px-5 py-2 text-sm text-white shadow-md hover:border-purple-500/50 hover:bg-black/70 transition-all"
                >
                  <a href="/tweets" className="flex items-center gap-2.5">
                    <div className="text-indigo-400">
                      <Database className="h-4 w-4" />
                    </div>
                    <span>Raw Tweets</span>
                  </a>
                </Button>
              </motion.div>

              {/* GitHub Button - Darker, more minimal */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-3 h-10 rounded-full border-white/5 bg-black/70 px-5 py-4 text-sm font-medium text-white shadow-md hover:border-white/10 hover:bg-black/90 transition-all duration-300"
                >
                  <a
                    href="https://github.com/UtkarshTheDev/TweeterLens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                </Button>
              </motion.div>

              {/* X/Twitter Button - More prominent */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="relative overflow-hidden flex items-center gap-3 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-medium text-white shadow-lg hover:shadow-indigo-500/15 transition-all duration-300"
                >
                  <a
                    href="https://twitter.com/UtkarshTheDev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5"
                  >
                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-full">
                      <div
                        className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        style={{ transform: "rotate(-45deg)" }}
                      ></div>
                    </div>

                    <Twitter className="h-4 w-4" />
                    <span>Follow</span>
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero section with all content inside the half-moon gradient */}
        <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="container mx-auto px-4 py-8 mt-24">
            <div className="max-w-2xl mx-auto text-center">
              {/* Main title with app-themed gradient for better visibility */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="font-cabinet text-5xl md:text-7xl font-extrabold mb-0 text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom right, #ffffff, #e2e8f0, #c7d2fe)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.3))",
                }}
              >
                Twitter Analytics Visualized
              </motion.h2>

              {/* Subtitle with improved styling and spacing */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[#D1D5DB] text-sm mb-12 max-w-xl mx-auto leading-relaxed"
                style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
              >
                Explore any Twitter profile with beautiful analytics.
              </motion.p>

              {/* Show either API Key Input or Username Search Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mb-10 flex justify-center"
              >
                {!hasApiKey || showApiKeyInput ? (
                  <div className="w-full max-w-md">
                    <ApiKeyInput onApiKeySaved={handleApiKeySaved} />
                    {hasApiKey && (
                      <div className="mt-2 text-center">
                        <button
                          onClick={cancelApiConfig}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel and return to search
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-md">
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                      {/* Subtle background */}
                      <div className="absolute inset-0 -z-10 opacity-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 justify-center mb-1">
                          <Search className="h-5 w-5 text-blue-300" />
                          <h3 className="heading-cabinet tracking-wider text-[16px] font-medium text-white">
                            Search Twitter Profile
                          </h3>
                        </div>

                        <div className="flex gap-3 w-full">
                          <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter Twitter username..."
                            className="w-full bg-black/30 text-[16px] border-white/10 text-white placeholder:text-gray-400 rounded-lg h-10 shadow-inner shadow-blue-900/10 focus:border-purple-500/30 focus:ring-purple-500/20 transition-all"
                          />

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              type="button"
                              onClick={handleSearch}
                              disabled={!username.trim()}
                              className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg flex items-center gap-2 whitespace-nowrap text-[15px] h-10 px-4 shadow-sm transition-all"
                            >
                              <span>Search</span>
                              <ArrowRight className="h-4 w-4" />
                              <div className="absolute inset-0 -z-10 overflow-hidden">
                                <div
                                  className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                  style={{ transform: "rotate(-45deg)" }}
                                ></div>
                              </div>
                            </Button>
                          </motion.div>
                        </div>

                        <div className="flex justify-center mt-1">
                          <button
                            onClick={handleShowApiKeyInput}
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Key className="h-3 w-3" />
                            Configure API Key
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Call to action buttons with improved, sleeker styling */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant="default"
                    className="relative overflow-hidden px-5 py-2 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white transition-all duration-300"
                  >
                    <a
                      href="https://twitter.com/UtkarshTheDev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white"
                    >
                      <Twitter className="w-4 h-4" />
                      <span className="text-[15px]">Follow on X</span>
                      <div className="absolute inset-0 -z-10 overflow-hidden">
                        <div
                          className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"
                          style={{ transform: "rotate(-45deg)" }}
                        ></div>
                      </div>
                    </a>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    variant="outline"
                    className="px-5 py-2 h-10 border border-white/5 bg-black/70 hover:bg-black/90 rounded-lg text-white transition-all duration-300"
                  >
                    <a
                      href="https://github.com/UtkarshTheDev/TweeterLens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white"
                    >
                      <Github className="w-4 h-4" />
                      <span className="text-[15px]">Star on GitHub</span>
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Twitter Feed section with black gradient background */}
        <div
          id="search"
          className="relative bg-gradient-to-b from-black/0 to-black py-16"
        >
          <TwitterFeed
            initialUsername={searchUsername}
            hideSearchInput={true}
          />
        </div>

        {/* Feature highlights with black gradient background */}
        <div className="relative bg-black py-16">
          <div className="container mx-auto px-4">
            <h3 className="heading-cabinet text-2xl font-bold text-white mb-12 text-center">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/5 to-blue-900/5 border border-white/5 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                }}
              >
                <div className="h-16 w-16 bg-purple-500/5 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Search className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="heading-cabinet text-xl font-semibold text-white mb-4">
                  Search Any User
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Enter any Twitter/X username to analyze their posting history
                  and engagement patterns
                </p>
              </motion.div>

              <motion.div
                className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/5 to-violet-900/5 border border-white/5 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                }}
              >
                <div className="h-16 w-16 bg-blue-500/5 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <BarChart2 className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="heading-cabinet text-xl font-semibold text-white mb-4">
                  Detailed Analytics
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  View engagement metrics, hashtag usage, and interactive
                  heatmaps of activity patterns
                </p>
              </motion.div>

              <motion.div
                className="p-8 rounded-2xl bg-gradient-to-br from-violet-900/5 to-purple-900/5 border border-white/5 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                }}
              >
                <div className="h-16 w-16 bg-violet-500/5 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Zap className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="heading-cabinet text-xl font-semibold text-white mb-4">
                  Fast & Efficient
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Smart caching and optimized data fetching for quick results
                  and seamless user experience
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-white/10 bg-black/30 py-6 backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center">
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            © {new Date().getFullYear()} TweeterLens by{" "}
            <a
              href="https://twitter.com/UtkarshTheDev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              @UtkarshTheDev
            </a>
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
