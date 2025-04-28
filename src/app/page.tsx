"use client";
import { TwitterFeed } from "../components/Tweets";
import { Twitter, Github, Star, ExternalLink, Database } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      {/* Enhanced animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 animate-gradient bg-[size:200%_200%]"
          style={{ animationDuration: "15s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.7),rgba(0,0,0,1))]" />
        {/* Add decorative elements */}
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-40 right-20 h-64 w-64 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      {/* Enhanced header with glass morphism */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
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
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative h-10 w-10 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse" />
                <Twitter className="h-8 w-8 text-blue-400 relative z-10" />
              </motion.div>
              <h1 className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-[size:200%] animate-gradient-x bg-clip-text text-2xl font-bold text-transparent">
                TweeterLens
                <motion.span
                  className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </h1>
            </motion.div>

            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border-white/10 bg-black/50 px-4 py-2 text-sm text-white shadow-lg hover:border-purple-500/50 hover:shadow-purple-500/25"
                >
                  <a href="/tweets">
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                      }}
                    >
                      <Database className="h-4 w-4 text-purple-400" />
                    </motion.div>
                    <span>Raw Tweets</span>
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
                  className="flex items-center gap-2 rounded-full border-white/10 bg-black/50 px-4 py-2 text-sm text-white shadow-lg hover:border-yellow-500/50 hover:shadow-yellow-500/25"
                >
                  <a
                    href="https://github.com/UtkarshTheDev/TweeterLens"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    >
                      <Star className="h-4 w-4 text-yellow-400" />
                    </motion.div>
                    <span>Star on GitHub</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="relative overflow-hidden flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm text-white shadow-lg hover:shadow-blue-500/25"
                >
                  <a
                    href="https://twitter.com/UtkarshTheDev"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-full">
                      <div
                        className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ transform: "rotate(-45deg)" }}
                      ></div>
                    </div>

                    <Twitter className="h-4 w-4" />
                    <span>Follow on X</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
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
              className="mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{ backgroundSize: "200% auto" }}
            >
              Discover Twitter Stories
            </motion.h2>
            <motion.p
              className="mx-auto mb-8 max-w-2xl text-lg text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Explore tweets from any Twitter user with our beautiful and modern
              interface. Get real-time updates and insights from your favorite
              accounts.
            </motion.p>

            <div className="mx-auto flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-2 rounded-lg border-white/10 bg-gradient-to-br from-black/70 to-gray-900/70 px-6 py-3 text-white shadow-xl hover:border-yellow-500/50 hover:shadow-yellow-500/10"
                >
                  <a
                    href="https://github.com/UtkarshTheDev/TweeterLens"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-5 w-5 text-white" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-400">
                        Check out on
                      </span>
                      <span className="font-semibold">GitHub</span>
                    </div>
                  </a>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  asChild
                  className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 shadow-xl hover:shadow-blue-500/25"
                >
                  <a
                    href="https://twitter.com/UtkarshTheDev"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 backdrop-blur-sm" />
                    {/* Shine effect */}
                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-lg">
                      <div
                        className="absolute -inset-[100%] animate-[spin_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ transform: "rotate(-45deg)" }}
                      ></div>
                    </div>

                    <div className="relative flex items-center gap-2">
                      <Twitter className="h-5 w-5 text-white" />
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-blue-100">Follow on</span>
                        <span className="font-semibold text-white">
                          Twitter/X
                        </span>
                      </div>
                    </div>
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <TwitterFeed />
      </main>

      <footer className="mt-auto border-t border-white/10 bg-black/50 py-6 backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center">
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Built with{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block text-red-500"
            >
              ❤️
            </motion.span>{" "}
            by{" "}
            <a
              href="https://twitter.com/UtkarshTheDev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Utkarsh
            </a>
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
