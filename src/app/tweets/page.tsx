"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Search, Twitter, ArrowRight } from "lucide-react";
import { TweetData } from "@/components/TweetData";

const fetchTweets = async (username: string) => {
  const res = await fetch(`/api/twitter?username=${username}`);
  if (!res.ok) {
    throw new Error("Failed to fetch tweets");
  }
  return res.json();
};

export default function TweetsPage() {
  const [username, setUsername] = useState("UtkarshTheDev");
  const [searchUsername, setSearchUsername] = useState("UtkarshTheDev");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tweets-raw", searchUsername],
    queryFn: () => fetchTweets(searchUsername),
    staleTime: 1000 * 60 * 5, // 5 min caching in frontend
    enabled: true, // Fetch on component mount
  });

  const handleSearch = () => {
    setSearchUsername(username);
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.8),rgba(0,0,0,1))]" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Twitter className="h-8 w-8 text-blue-400" />
              <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
                Raw Tweets
              </h1>
            </div>

            <a
              href="/"
              className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white transition-all hover:border-blue-500/50"
            >
              Back to Home
            </a>
          </div>
        </div>
      </header>

      <main>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex w-full max-w-xl mx-auto items-center gap-2 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter Twitter Username"
                className="w-full rounded-full border border-white/10 bg-black/50 px-10 py-3 text-white shadow-lg backdrop-blur-xl transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            <div className="flex justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-gray-400">Loading tweets...</span>
              </div>
            </div>
          )}

          {isError && (
            <div className="mx-auto max-w-md rounded-lg bg-red-900/20 p-6 text-center text-red-400 backdrop-blur-xl">
              <h3 className="mb-2 text-xl font-semibold">
                Error Loading Tweets
              </h3>
              <p>
                Failed to load tweets. Please check the username and try again.
              </p>
            </div>
          )}

          {data && <TweetData data={data} />}
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
