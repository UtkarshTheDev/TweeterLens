"use client";
import { useState, useEffect } from "react";
import { TwitterFeed } from "@/components/Tweets";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useSearch } from "@/context/SearchContext";

export function TwitterFeedWrapper() {
  const { globalUsername } = useSearch();
  const [isClient, setIsClient] = useState(false);

  // Initialize searchUsername from URL if available (for SSR/hydration)
  const initialUsername =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("username") || ""
      : "";

  // Use state to track the effective username (from URL or global state)
  const [searchUsername, setSearchUsername] = useState(initialUsername);

  // This effect will run when globalUsername changes
  useEffect(() => {
    if (globalUsername) {
      console.log(
        `TwitterFeedWrapper: Global username changed to ${globalUsername}`
      );
      setSearchUsername(globalUsername);
    }
  }, [globalUsername]);

  // This effect will only run on the client
  useEffect(() => {
    setIsClient(true);

    // Check if there's a username in the URL (for client-side navigation)
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");
    if (username && !searchUsername) {
      console.log(`Setting username from URL: ${username}`);
      setSearchUsername(username);
    }
  }, []);

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner message="Preparing Twitter feed" />
      </div>
    );
  }

  return (
    <TwitterFeed
      initialUsername={searchUsername}
      hideSearchInput={true} // Hide the search input since we already have it in the hero section
    />
  );
}
