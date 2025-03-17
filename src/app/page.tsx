"use client";
import { TwitterFeed } from "../components/Tweets";
import { Twitter } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.8),rgba(0,0,0,1))]" />
      </div>

      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
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
          </motion.div>
        </div>
      </header>

      <main>
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
          </motion.div>
        </section>

        <TwitterFeed />
      </main>

      <footer className="border-t border-white/10 bg-black/50 py-8 backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Built with ❤️ by Utkarsh</p>
        </div>
      </footer>
    </div>
  );
}
