"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
// Import each icon individually to avoid issues with unused imports
import { Search } from "lucide-react";
import { Key } from "lucide-react";
import { AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TwitterUsernameInputProps {
  onSearch: (username: string) => void;
  onConfigureApiKey: () => void; // Callback to show API key configuration
}

export function TwitterUsernameInput({
  onSearch,
  onConfigureApiKey,
}: TwitterUsernameInputProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Check if API key exists on component mount and whenever the component re-renders
  useEffect(() => {
    const savedApiKey = localStorage.getItem("socialdataApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setApiKey(null);
    }
  }, []);

  const handleSearch = () => {
    if (username.trim() && apiKey) {
      onSearch(username);
      // Scroll to search section
      const searchSection = document.getElementById("search");
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleShowApiKeyInput = () => {
    // Call the callback function to show API key configuration
    onConfigureApiKey();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex flex-col gap-2">
        {/* Modern search input with button on same line */}
        <div className="flex items-stretch w-full">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400">
              <AtSign className="h-5 w-5" />
            </div>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                apiKey
                  ? "Enter Twitter username..."
                  : "First configure API key below..."
              }
              className={`w-full bg-black/40 text-[16px] border-r-0 border-white/10 text-white placeholder:text-gray-400 rounded-l-md rounded-r-none h-14 pl-12 pr-6 shadow-inner shadow-blue-900/5 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-indigo-500/50 focus:border-indigo-500/50 focus:ring-0 focus:outline-none transition-all ${
                isFocused ? "border-indigo-500/50 outline-none" : ""
              }`}
              disabled={!apiKey}
            />
          </div>

          {/* Search button attached to input */}
          <Button
            type="button"
            onClick={handleSearch}
            disabled={!username.trim() || !apiKey}
            className={`h-14 rounded-l-none rounded-r-md ${
              apiKey
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                : "bg-gray-700"
            } text-white flex items-center justify-center gap-1 whitespace-nowrap text-[16px] px-8 transition-all border border-white/10`}
          >
            <Search className="h-5 w-5" />
            <span className="hidden sm:inline">
              {apiKey ? "Search" : "API Key Required"}
            </span>
          </Button>
        </div>

        {/* Configure API Key link */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleShowApiKeyInput}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1"
          >
            <Key className="h-3 w-3" />
            Configure API Key
          </motion.button>
        </div>
      </div>
    </div>
  );
}
