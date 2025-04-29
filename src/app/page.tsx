"use client";
import { TwitterFeed } from "../components/Tweets";
import {
  Twitter,
  Github,
  Database,
  Search,
  BarChart2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* New background as requested */}
      <div className="fixed inset-0 -z-10">
        <div className="relative h-full w-full bg-black">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"></div>
        </div>
      </div>

      {/* Enhanced header with glass morphism */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="relative h-10 w-10 flex items-center justify-center"
              >
                {/* Glowing orbit effect */}
                <div className="absolute h-full w-full rounded-full border border-indigo-500/20 animate-pulse" />
                <div
                  className="absolute h-[140%] w-[140%] rounded-full border border-blue-500/10"
                  style={{ animationDelay: "300ms" }}
                />

                {/* Pulsing gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-blue-600/80 rounded-full opacity-20 animate-pulse" />

                {/* Icon with animation */}
                <div className="relative z-10 h-6 w-6 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Zap className="h-5 w-5 text-indigo-400" />
                  </motion.div>
                </div>
              </motion.div>
              <h1 className="relative bg-gradient-to-r from-indigo-300 to-blue-300 bg-[size:200%] animate-gradient-x bg-clip-text text-2xl font-bold text-transparent">
                TweeterLens
                <motion.span
                  className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
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
                  className="flex items-center gap-3 h-10 rounded-full border-white/10 bg-black/50 px-5 py-2.5 text-sm text-white shadow-lg hover:border-indigo-500/50 hover:bg-black/70 transition-all"
                >
                  <a href="/tweets" className="flex items-center gap-2.5">
                    <div className="text-indigo-400">
                      <Database className="h-4 w-4" />
                    </div>
                    <span>Raw Tweets</span>
                  </a>
                </Button>
              </motion.div>

              {/* GitHub Button - Improved */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-3 h-10 rounded-full border-white/20 bg-zinc-800/80 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:border-white/30 hover:bg-zinc-700/80 transition-all duration-300"
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

              {/* X/Twitter Button - Improved */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="relative overflow-hidden flex items-center gap-3 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                >
                  <a
                    href="https://twitter.com/UtkarshTheDev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-full">
                      <div
                        className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.h2
              className="mb-6 bg-gradient-to-r from-indigo-200 via-blue-200 to-purple-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{ backgroundSize: "200% auto" }}
            >
              Visualize Your Twitter Journey
            </motion.h2>
            <motion.p
              className="mx-auto mb-12 max-w-2xl text-lg text-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Explore tweets from any Twitter/X user with our beautiful
              analytics dashboard. Get detailed insights, engagement metrics,
              and visualize posting patterns.
            </motion.p>

            <div className="mx-auto flex flex-wrap justify-center gap-6 mb-16">
              {/* GitHub Button - Main CTA */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-5 rounded-xl border border-white/10 bg-zinc-800/80 px-8 py-6 text-white shadow-xl hover:border-white/20 hover:bg-zinc-700/90 transition-all duration-300"
                >
                  <a
                    href="https://github.com/UtkarshTheDev/TweeterLens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <div className="flex items-center justify-center">
                      <div className="mr-3 p-2.5 bg-black/60 rounded-lg">
                        <Github className="h-6 w-6 text-white/90" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-400">
                          Star the repo on
                        </span>
                        <span className="font-semibold">GitHub</span>
                      </div>
                    </div>
                  </a>
                </Button>
              </motion.div>

              {/* X/Twitter Button - Main CTA */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  asChild
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 shadow-xl hover:shadow-indigo-500/25 transition-all duration-300"
                >
                  <a
                    href="https://twitter.com/UtkarshTheDev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl">
                      <div
                        className="absolute -inset-[100%] animate-[spin_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ transform: "rotate(-45deg)" }}
                      ></div>
                    </div>

                    <div className="flex items-center">
                      <div className="mr-3 p-2.5 bg-white/10 backdrop-blur-sm rounded-lg">
                        <Twitter className="h-6 w-6 text-white/90" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-indigo-200">
                          Follow on
                        </span>
                        <span className="font-semibold text-white">
                          Twitter/X
                        </span>
                      </div>
                    </div>
                  </a>
                </Button>
              </motion.div>
            </div>

            {/* TwitterFeed component moved above feature cards */}
            <TwitterFeed />

            {/* Feature highlights moved below search input */}
            <div className="mt-28 mb-16">
              <h3 className="text-2xl font-bold text-white mb-12">
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <motion.div
                  className="p-8 rounded-2xl bg-gradient-to-br from-indigo-900/10 to-blue-900/10 border border-white/5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="h-16 w-16 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <Search className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Search Any User
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Enter any Twitter/X username to analyze their posting
                    history and engagement patterns
                  </p>
                </motion.div>

                <motion.div
                  className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/10 to-violet-900/10 border border-white/5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="h-16 w-16 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <BarChart2 className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Detailed Analytics
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    View engagement metrics, hashtag usage, and interactive
                    heatmaps of activity patterns
                  </p>
                </motion.div>

                <motion.div
                  className="p-8 rounded-2xl bg-gradient-to-br from-violet-900/10 to-purple-900/10 border border-white/5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="h-16 w-16 bg-violet-500/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <Zap className="h-8 w-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Fast & Efficient
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Smart caching and optimized data fetching for quick results
                    and seamless user experience
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
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
              className="text-indigo-400 hover:underline"
            >
              @UtkarshTheDev
            </a>
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
