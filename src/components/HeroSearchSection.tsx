"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TwitterUsernameInput } from "@/components/TwitterUsernameInput";
import { ApiKeyConfig } from "@/components/ApiKeyConfig";
import { useSearch } from "@/context/SearchContext";

export function HeroSearchSection() {
  const { setGlobalUsername } = useSearch();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKeyConfig, setShowApiKeyConfig] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if API key exists - run this effect on component mount
  useEffect(() => {
    // Use try-catch to handle potential localStorage errors
    try {
      const savedApiKey = localStorage.getItem("socialdataApiKey");
      if (savedApiKey) {
        setHasApiKey(true);
      } else {
        setHasApiKey(false);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setHasApiKey(false);
    }

    setIsInitialized(true);
  }, []);

  // Add a separate effect to monitor localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "socialdataApiKey") {
        setHasApiKey(!!e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleApiKeySaved = () => {
    setHasApiKey(true);
    setShowApiKeyConfig(false);
  };

  const handleConfigureApiKey = () => {
    setShowApiKeyConfig(true);
  };

  const handleSearch = (username: string) => {
    // Update URL with username parameter, but remove any hash fragments first
    const currentUrl = window.location.href.split("#")[0]; // Remove any hash fragments
    const url = new URL(currentUrl);
    url.searchParams.set("username", username);
    window.history.pushState({}, "", url);

    // Update the global username state
    console.log(`Setting global username to: ${username}`);
    setGlobalUsername(username);

    // Scroll to search section
    const searchSection = document.getElementById("search");
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isInitialized) {
    return (
      <div className="mb-8 w-full max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 h-[180px] animate-pulse">
          <div className="h-full flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mb-8"
      style={{
        animation: "fadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards",
        opacity: 0,
      }}
    >
      <AnimatePresence mode="wait">
        {/* Show API key config if user clicked "Configure API Key" or if no API key exists */}
        {!hasApiKey || showApiKeyConfig ? (
          <motion.div
            key="api-key-config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ApiKeyConfig onApiKeySaved={handleApiKeySaved} />
          </motion.div>
        ) : (
          <motion.div
            key="twitter-username-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TwitterUsernameInput
              onSearch={handleSearch}
              onConfigureApiKey={handleConfigureApiKey}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
