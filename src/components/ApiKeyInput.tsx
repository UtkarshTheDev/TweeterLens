"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  Save,
  Check,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
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
      localStorage.setItem("socialdataApiKey", apiKey);
      setIsSaved(true);
      onApiKeySaved(apiKey);
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="w-full">
        {/* Main API input card - simplified with better readability */}
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm">
          {/* Subtle background */}
          <div className="absolute inset-0 -z-10 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
          </div>

          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Lock className="h-4 w-4 text-blue-300" />
              <h3 className="heading-sentient text-sm font-medium text-white">
                API Key
              </h3>
            </div>

            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Input
                  type={isVisible ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-black/30 border-white/5 text-white placeholder:text-gray-500 rounded-lg"
                />
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isSaved ? (
                <Button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim()}
                  className="button-sentient bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white rounded-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleCopyApiKey}
                  className="button-sentient bg-gradient-to-r from-purple-600/60 to-blue-600/60 text-white rounded-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </Button>
              )}
            </div>

            {isSaved && (
              <div className="flex items-center gap-2 text-xs text-green-400 justify-center">
                <Check size={14} />
                API key saved!
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">
              {isSaved
                ? "Your API key is securely stored in this browser"
                : "Don't have an API key? Get one for free below:"}
            </p>
          </div>
        </div>

        {/* Instructions toggle button - simplified */}
        <div className="mt-2 text-center">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="button-sentient inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showInstructions ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {showInstructions ? "Hide instructions" : "How to get an API key"}
          </button>

          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 text-xs text-gray-300 bg-black/30 p-3 rounded-md space-y-2 border border-white/5"
            >
              <h3 className="heading-sentient font-medium text-blue-400 text-center">
                How to Get an API Key:
              </h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Visit{" "}
                  <a
                    href="https://socialdata.tools"
                    className="text-blue-400 hover:underline"
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
              <p className="mt-2 text-gray-400 text-xs">
                API access via{" "}
                <a
                  href="https://socialdata.tools"
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SocialData.tools
                </a>
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
