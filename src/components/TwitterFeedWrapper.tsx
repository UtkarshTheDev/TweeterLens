"use client";
import { useState, useEffect } from "react";
import { TwitterFeed } from "@/components/Tweets";
import { TwitterFeedSkeleton } from "@/components/SkeletonLoaders";

export function TwitterFeedWrapper() {
  const [searchUsername, setSearchUsername] = useState("");
  const [isClient, setIsClient] = useState(false);

  // This effect will only run on the client
  useEffect(() => {
    setIsClient(true);

    // Check if there's a username in the URL
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");
    if (username) {
      setSearchUsername(username);
    }
  }, []);

  if (!isClient) {
    return <TwitterFeedSkeleton />;
  }

  return (
    <TwitterFeed
      initialUsername={searchUsername}
      hideSearchInput={true} // Hide the search input since we already have it in the hero section
    />
  );
}
