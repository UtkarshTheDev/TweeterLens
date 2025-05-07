"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
// Import each icon individually to avoid issues with unused imports
import { ExternalLink } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { ChevronUp } from "lucide-react";
import { Save } from "lucide-react";
import { Check } from "lucide-react";
import { Copy } from "lucide-react";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApiKeyConfigProps {
  onApiKeySaved: () => void;
}

export function ApiKeyConfig({ onApiKeySaved }: ApiKeyConfigProps) {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedApiKey = localStorage.getItem("socialdataApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsSaved(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setIsLoading(true);

      // Simulate a brief loading state for better UX
      setTimeout(() => {
        localStorage.setItem("socialdataApiKey", apiKey);
        setIsSaved(true);
        setIsLoading(false);
        onApiKeySaved();
      }, 500);
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex flex-col gap-3">
        {/* API Key input with button on same line */}
        <div className="flex items-stretch w-full">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400">
              <Key className="h-5 w-5" />
            </div>
            <Input
              type={isVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full bg-black/40 text-[16px] border-white/10 text-white placeholder:text-gray-400 rounded-l-md rounded-r-none h-14 pl-12 pr-14 shadow-inner shadow-blue-900/5 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-indigo-500/50 focus:border-indigo-500/50 focus:ring-0 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {!isSaved ? (
            <Button
              type="button"
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim() || isLoading}
              className="h-14 rounded-l-none rounded-r-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-1 whitespace-nowrap text-[16px] px-7 transition-all border border-white/10"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">
                {isLoading ? "Saving..." : "Save"}
              </span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCopyApiKey}
              className="h-14 rounded-l-none rounded-r-md bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 text-white flex items-center gap-1 whitespace-nowrap text-[16px] px-7 transition-all border border-white/10"
            >
              {copySuccess ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">
                {copySuccess ? "Copied!" : "Copy"}
              </span>
            </Button>
          )}
        </div>

        {/* Status and action messages */}
        <div className="flex flex-col items-center gap-2">
          {isSaved && (
            <div className="flex items-center gap-2 text-sm text-green-400 justify-center bg-green-900/20 py-1.5 px-3 rounded-full">
              <Check size={16} />
              API key saved successfully!
            </div>
          )}

          {isSaved && (
            <button
              onClick={onApiKeySaved}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors py-1.5 px-4 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 mt-1"
            >
              Return to Search
            </button>
          )}

          {!isSaved && (
            <p className="text-sm text-gray-300 text-center">
              Don&apos;t have an API key?{" "}
              <span className="text-indigo-400">
                Click below for setup instructions
              </span>
            </p>
          )}
        </div>

        {/* Instructions toggle button */}
        <div className="text-center">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors py-1.5 px-3 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20"
          >
            {showInstructions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {showInstructions
              ? "Hide setup instructions"
              : "Show setup instructions & notes"}
          </button>
        </div>

        {/* Instructions panel */}
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1 text-sm text-gray-300 bg-black/30 p-4 rounded-md space-y-3 border border-white/5"
          >
            <div className="space-y-3">
              <h3 className="font-medium text-indigo-400 text-base">
                How to Get Your API Key:
              </h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Visit{" "}
                  <a
                    href="https://socialdata.tools"
                    className="text-indigo-400 hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SocialData.tools
                  </a>
                </li>
                <li>Sign up for a free account</li>
                <li>
                  Navigate to{" "}
                  <span className="font-medium">Dashboard → API Keys</span>
                </li>
                <li>Copy your API key</li>
                <li>Paste it in the input field above</li>
              </ol>
            </div>

            <div className="bg-indigo-900/20 p-3 rounded-md border border-indigo-500/20 space-y-2">
              <h3 className="font-medium text-indigo-300 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Important Notes:
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>
                  <span className="font-medium text-white">
                    For accounts with 250+ tweets:
                  </span>{" "}
                  You may need additional credits. Contact SocialData.tools
                  support and request additional credits based on your tweet
                  count.
                </li>
                <li>
                  <span className="font-medium text-white">
                    Credit calculation:
                  </span>{" "}
                  SocialData API provides 1000 tweets for $0.20. Request{" "}
                  <span className="text-indigo-300 font-medium">
                    (Your total tweets ÷ 1000) × $0.20
                  </span>{" "}
                  in credits.
                </li>
                <li>
                  <span className="font-medium text-white">
                    Best for small creators:
                  </span>{" "}
                  This app works best for accounts with 250-1000 tweets. For
                  larger accounts, consider using Twitter Analytics if you
                  can&apos;t get additional credits.
                </li>
              </ul>
            </div>

            <p className="text-gray-400 text-xs flex items-center justify-center gap-1 mt-2 pt-2 border-t border-white/10">
              <Key className="h-3 w-3" />
              API access via{" "}
              <a
                href="https://socialdata.tools"
                className="text-indigo-400 hover:underline flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                SocialData.tools
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
