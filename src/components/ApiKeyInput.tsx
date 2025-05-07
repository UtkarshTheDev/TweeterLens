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

interface ApiKeyInputProps {
  onApiKeySaved: (key: string) => void;
}

export const ApiKeyInput = ({ onApiKeySaved }: ApiKeyInputProps) => {
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
      onApiKeySaved(savedApiKey);
    }
  }, [onApiKeySaved]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setIsLoading(true);

      // Simulate a brief loading state for better UX
      setTimeout(() => {
        localStorage.setItem("socialdataApiKey", apiKey);
        setIsSaved(true);
        setIsLoading(false);
        onApiKeySaved(apiKey);
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
            <div className="flex items-center gap-2 text-xs text-green-400 justify-center">
              <Check size={12} />
              API key saved!
            </div>
          )}

          {!isSaved && (
            <p className="text-xs text-gray-400 text-center">
              Don&apos;t have an API key? Get one for free below
            </p>
          )}
        </div>

        {/* Instructions toggle button */}
        <div className="text-center">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1"
          >
            {showInstructions ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {showInstructions ? "Hide instructions" : "How to get an API key"}
          </button>
        </div>

        {/* Instructions panel */}
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1 text-xs text-gray-300 bg-black/30 p-3 rounded-md space-y-2 border border-white/5"
          >
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Visit{" "}
                <a
                  href="https://socialdata.tools"
                  className="text-indigo-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SocialData.tools
                </a>
              </li>
              <li>Sign up for free</li>
              <li>Go to Dashboard → API Keys</li>
              <li>Copy your API key</li>
              <li>Paste it here</li>
            </ol>
            <p className="text-gray-400 text-xs flex items-center justify-center gap-1 mt-2">
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
};
