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
  Key,
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
        {/* Main API input card with enhanced styling */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 -z-10 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Lock className="h-5 w-5 text-blue-300" />
              <h3 className="heading-cabinet text-[16px] font-medium text-white">
                API Key
              </h3>
            </div>

            <div className="flex gap-3 w-full">
              <div className="relative flex-1">
                <Input
                  type={isVisible ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-black/30 border-white/10 text-white text-[16px] placeholder:text-gray-400 rounded-lg h-12 shadow-inner shadow-blue-900/10 focus:border-purple-500/30 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isSaved ? (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="button"
                    onClick={handleSaveApiKey}
                    disabled={!apiKey.trim()}
                    className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#A78BFA] hover:to-[#818CF8] text-white rounded-lg flex items-center gap-2 whitespace-nowrap text-[16px] h-12 px-5 shadow-md shadow-purple-900/20"
                  >
                    <Save className="h-5 w-5" />
                    <span>Save</span>
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="button"
                    onClick={handleCopyApiKey}
                    className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] hover:from-[#6366F1] hover:to-[#4F46E5] text-white rounded-lg flex items-center gap-2 whitespace-nowrap text-[16px] h-12 px-5 shadow-md shadow-indigo-900/20"
                  >
                    <Copy className="h-5 w-5" />
                    <span>Copy</span>
                  </Button>
                </motion.div>
              )}
            </div>

            {isSaved && (
              <div className="flex items-center gap-2 text-sm text-green-400 justify-center">
                <Check size={16} />
                API key saved!
              </div>
            )}

            <p className="text-sm text-gray-400 text-center">
              {isSaved
                ? "Your API key is securely stored in this browser"
                : "Don't have an API key? Get one for free below:"}
            </p>
          </div>
        </div>

        {/* Instructions toggle button with improved styling */}
        <div className="mt-3 text-center">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors px-4 py-1 rounded-full hover:bg-blue-900/10"
          >
            {showInstructions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {showInstructions ? "Hide instructions" : "How to get an API key"}
          </button>

          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-sm text-gray-300 bg-black/30 p-4 rounded-lg space-y-3 border border-white/5 shadow-lg"
            >
              <h3 className="heading-cabinet font-medium text-blue-400 text-center">
                How to Get an API Key:
              </h3>
              <ol className="list-decimal pl-6 space-y-2">
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
              <p className="mt-3 text-gray-400 text-xs flex items-center justify-center gap-1">
                <Key className="h-3 w-3" />
                API access via{" "}
                <a
                  href="https://socialdata.tools"
                  className="text-blue-400 hover:underline flex items-center gap-1"
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
    </motion.div>
  );
};
