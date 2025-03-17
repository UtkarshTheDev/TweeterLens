"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Search, Twitter, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const fetchTweets = async (username: string) => {
  const res = await fetch(`/api/twitter?username=${username}`);
  return res.json();
};

export const TwitterFeed = () => {
  const [username, setUsername] = useState("UtkarshTheDev");
  const [searchUsername, setSearchUsername] = useState("UtkarshTheDev");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tweets", searchUsername],
    queryFn: () => fetchTweets(searchUsername),
    staleTime: 1000 * 60 * 5, // 5 min caching in frontend
    enabled: false, // Don't fetch on component mount
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
            <span className="text-gray-400">Loading tweets...</span>
          </motion.div>
        )}

        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-900/20 p-4 text-red-400 backdrop-blur-xl"
          >
            Failed to load tweets. Please try again.
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.map((tweet: any, index: number) => (
              <motion.div
                key={tweet.id_str || index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/50 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-blue-500/50 hover:shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Twitter className="h-6 w-6 text-blue-400/70" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">
                        {tweet.user?.name || searchUsername}
                      </h3>
                      <span className="text-sm text-gray-400">
                        @{searchUsername}
                      </span>
                    </div>
                    <p className="text-gray-300">{tweet.full_text}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(
                            tweet.tweet_created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Twitter className="h-4 w-4" />
                        <span>{tweet.retweet_count || 0} retweets</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};
