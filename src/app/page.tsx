"use client";
import { TwitterFeed } from "../components/Tweets";
import { Twitter, Github, Star, ExternalLink, Database } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.8),rgba(0,0,0,1))]" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <Twitter className="h-8 w-8 text-blue-400" />
              <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
                TweetX
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <motion.a
                href="/tweets"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white shadow-lg transition-all hover:border-purple-500/50 hover:shadow-purple-500/25"
              >
                <Database className="h-4 w-4 text-purple-400" />
                <span>Raw Tweets</span>
              </motion.a>

              <motion.a
                href="https://github.com/UtkarshTheDev/tweetx"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white shadow-lg transition-all hover:border-yellow-500/50 hover:shadow-yellow-500/25"
              >
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Star on GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </motion.a>

              <motion.a
                href="https://twitter.com/UtkarshTheDev"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm text-white shadow-lg transition-all hover:shadow-blue-500/25"
              >
                <Twitter className="h-4 w-4" />
                <span>Follow on X</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </motion.a>
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
            <h2 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Discover Twitter Stories
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
              Explore tweets from any Twitter user with our beautiful and modern
              interface. Get real-time updates and insights from your favorite
              accounts.
            </p>

            <div className="mx-auto flex flex-wrap justify-center gap-4">
              <motion.a
                href="https://github.com/UtkarshTheDev/tweetx"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/70 px-6 py-3 text-white shadow-xl transition-all hover:border-yellow-500/50 hover:shadow-yellow-500/10"
              >
                <Github className="h-5 w-5 text-white" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-400">Check out on</span>
                  <span className="font-semibold">GitHub</span>
                </div>
              </motion.a>

              <motion.a
                href="https://twitter.com/UtkarshTheDev"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 shadow-xl transition-all hover:shadow-blue-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 backdrop-blur-sm" />
                <div className="relative flex items-center gap-2">
                  <Twitter className="h-5 w-5 text-white" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-blue-100">Follow on</span>
                    <span className="font-semibold text-white">Twitter/X</span>
                  </div>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </section>

        <TwitterFeed />
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
