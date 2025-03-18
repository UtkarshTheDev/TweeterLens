"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Twitter,
  Calendar,
  MessageCircle,
  Heart,
  Repeat,
  Bookmark,
  Eye,
  ChevronDown,
  ChevronUp,
  User,
  Link,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TweetDataProps = {
  data: any;
};

export const TweetData = ({ data }: TweetDataProps) => {
  const [expandedTweet, setExpandedTweet] = useState<string | null>(null);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // Function to extract HTML from tweet source
  const extractAppSource = (source: string) => {
    try {
      const match = source.match(/>([^<]+)</);
      return match ? match[1] : "Twitter";
    } catch (e) {
      return "Twitter";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
                Raw Tweet
              </span>{" "}
              Data
            </h2>
            <p className="text-sm text-gray-400">
              Showing {data?.tweets?.length || 0} tweets from the API
            </p>
          </div>

          {data?.next_cursor && (
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-gray-400">
              <span>Next Cursor:</span>
              <span className="truncate max-w-[200px] font-mono">
                {data.next_cursor}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {data?.tweets?.map((tweet: any) => (
            <motion.div
              key={tweet.id_str}
              layoutId={tweet.id_str}
              className="overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 transition-all hover:border-blue-500/50"
            >
              {/* Tweet Header - Always Visible */}
              <div
                className="flex cursor-pointer items-start gap-3 p-4"
                onClick={() =>
                  setExpandedTweet(
                    expandedTweet === tweet.id_str ? null : tweet.id_str
                  )
                }
              >
                {tweet.user?.profile_image_url_https ? (
                  <img
                    src={tweet.user.profile_image_url_https}
                    alt={tweet.user.name}
                    className="h-10 w-10 rounded-full border border-white/10"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <User className="h-5 w-5 text-blue-400/70" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white">
                      {tweet.user?.name || "User"}
                    </span>
                    <span className="text-sm text-gray-400">
                      @{tweet.user?.screen_name || "username"}
                    </span>
                    {tweet.user?.verified && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                        <svg
                          viewBox="0 0 24 24"
                          width="12"
                          height="12"
                          fill="white"
                        >
                          <path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-gray-300">
                    {tweet.full_text || tweet.text || "No text available"}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(tweet.tweet_created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Twitter className="h-3 w-3" />
                      <span>{extractAppSource(tweet.source)}</span>
                    </div>
                  </div>
                </div>

                <button className="rounded-full bg-gray-800/50 p-1.5 text-gray-400 hover:bg-gray-700/50 hover:text-white">
                  {expandedTweet === tweet.id_str ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Tweet Statistics */}
              <div className="flex items-center justify-between border-t border-white/5 px-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{tweet.reply_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Repeat className="h-3.5 w-3.5" />
                    <span>{tweet.retweet_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Heart className="h-3.5 w-3.5" />
                    <span>{tweet.favorite_count || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{tweet.bookmark_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{tweet.views_count || 0}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedTweet === tweet.id_str && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/5 bg-gray-900/20"
                  >
                    <div className="p-4">
                      <h4 className="mb-3 text-sm font-medium text-gray-400">
                        Tweet Details
                      </h4>

                      <div className="grid gap-2 text-xs">
                        <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/5 p-2">
                          <div className="flex flex-col">
                            <span className="text-gray-500">Tweet ID</span>
                            <span className="font-mono text-gray-300">
                              {tweet.id_str}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Language</span>
                            <span className="font-mono text-gray-300">
                              {tweet.lang || "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Truncated</span>
                            <span className="font-mono text-gray-300">
                              {tweet.truncated ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>

                        {/* Reply information */}
                        {tweet.in_reply_to_status_id_str && (
                          <div className="rounded-lg border border-white/5 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-gray-400">In Reply To</span>
                              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                                @{tweet.in_reply_to_screen_name}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-gray-500">Status ID</span>
                                <span className="font-mono text-gray-300">
                                  {tweet.in_reply_to_status_id_str}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-500">User ID</span>
                                <span className="font-mono text-gray-300">
                                  {tweet.in_reply_to_user_id_str}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* User information */}
                        {tweet.user && (
                          <div className="rounded-lg border border-white/5 p-3">
                            <h5 className="mb-2 text-gray-400">
                              User Information
                            </h5>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              <div className="flex flex-col">
                                <span className="text-gray-500">User ID</span>
                                <span className="font-mono text-gray-300">
                                  {tweet.user.id_str}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-500">Created</span>
                                <span className="font-mono text-gray-300">
                                  {new Date(
                                    tweet.user.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-500">Followers</span>
                                <span className="font-mono text-gray-300">
                                  {tweet.user.followers_count?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-500">Following</span>
                                <span className="font-mono text-gray-300">
                                  {tweet.user.friends_count?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-500">Tweets</span>
                                <span className="font-mono text-gray-300">
                                  {tweet.user.statuses_count?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-500">Likes</span>
                                <span className="font-mono text-gray-300">
                                  {tweet.user.favourites_count?.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {tweet.user.description && (
                              <div className="mt-3 rounded-lg border border-white/5 p-2">
                                <span className="text-gray-500">Bio</span>
                                <p className="text-gray-300">
                                  {tweet.user.description}
                                </p>
                              </div>
                            )}

                            {tweet.user.url && (
                              <div className="mt-2 flex items-center gap-2">
                                <Link className="h-3 w-3 text-blue-400" />
                                <a
                                  href={tweet.user.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-400 hover:underline"
                                >
                                  {tweet.user.url}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Entities - Hashtags, Mentions, URLs */}
                        {tweet.entities && (
                          <div className="rounded-lg border border-white/5 p-3">
                            <h5 className="mb-2 text-gray-400">Entities</h5>

                            {tweet.entities.hashtags?.length > 0 && (
                              <div className="mb-2">
                                <span className="text-gray-500">Hashtags</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {tweet.entities.hashtags.map(
                                    (tag: any, i: number) => (
                                      <span
                                        key={i}
                                        className="rounded-full bg-blue-900/30 px-2 py-0.5 text-blue-300"
                                      >
                                        #{tag.text}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {tweet.entities.user_mentions?.length > 0 && (
                              <div className="mb-2">
                                <span className="text-gray-500">Mentions</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {tweet.entities.user_mentions.map(
                                    (mention: any) => (
                                      <span
                                        key={mention.id_str}
                                        className="rounded-full bg-purple-900/30 px-2 py-0.5 text-purple-300"
                                      >
                                        @{mention.screen_name}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {tweet.entities.urls?.length > 0 && (
                              <div>
                                <span className="text-gray-500">URLs</span>
                                <div className="mt-1 flex flex-col gap-1">
                                  {tweet.entities.urls.map(
                                    (url: any, i: number) => (
                                      <a
                                        key={i}
                                        href={url.expanded_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-blue-400 hover:underline"
                                      >
                                        <Link className="h-3 w-3" />
                                        {url.display_url}
                                        <ExternalLink className="h-2 w-2" />
                                      </a>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {(!data?.tweets || data.tweets.length === 0) && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-black/20 p-12 text-center">
              <Twitter className="mb-4 h-12 w-12 text-gray-600" />
              <h3 className="text-xl font-medium text-gray-400">
                No Tweets Found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try searching for a different username
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
