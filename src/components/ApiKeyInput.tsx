"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Key,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ApiKeyInputProps {
  onApiKeySaved: (apiKey: string) => void;
}

export const ApiKeyInput = ({ onApiKeySaved }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Check if API key exists in localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("socialdataApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsKeySaved(true);
      onApiKeySaved(savedApiKey);
    }
  }, [onApiKeySaved]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("socialdataApiKey", apiKey.trim());
      setIsKeySaved(true);
      onApiKeySaved(apiKey.trim());
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("socialdataApiKey");
    setApiKey("");
    setIsKeySaved(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto mb-8"
    >
      <Card className="border border-white/10 bg-gradient-to-br from-zinc-900/80 via-black/95 to-zinc-900/80 shadow-xl relative overflow-hidden">
        {/* Subtle gradient background animation */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <div
            className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-blue-600/10 animate-gradient"
            style={{ backgroundSize: "200% 200%" }}
          />
        </div>

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-indigo-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Social Data API Key
            </CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            You must provide your own Social Data API key to fetch Twitter/X
            data. This app doesn't use any server-side API keys.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            {isKeySaved ? (
              <div className="flex items-center gap-2 text-indigo-200 bg-indigo-500/10 rounded-md px-3 py-2">
                <CheckCircle className="h-5 w-5 text-indigo-400" />
                <span>API key has been saved successfully!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-purple-200 bg-purple-500/10 rounded-md px-3 py-2">
                <Info className="h-5 w-5 text-purple-400" />
                <span>
                  Please enter your Social Data API key to use this application
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your Social Data API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-grow bg-black/40 border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20"
              />
              <Button
                onClick={handleSaveApiKey}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                disabled={!apiKey.trim()}
              >
                Save
              </Button>
              {isKeySaved && (
                <Button
                  variant="outline"
                  onClick={handleClearApiKey}
                  className="border-white/10 text-gray-400 hover:text-white"
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="text-xs text-gray-400 bg-black/30 p-3 rounded-md border border-white/5">
              <p className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-indigo-900/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3 h-3 text-indigo-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>
                  <strong className="text-indigo-300">Security Note:</strong>{" "}
                  Your API key is stored only in your browser's local storage
                  and is only sent directly to the Social Data API. This app
                  doesn't use any server-side API keys.
                </span>
              </p>
            </div>

            <div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-blue-300 transition-colors"
              >
                {showInstructions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {showInstructions
                  ? "Hide instructions"
                  : "How to get an API key"}
              </button>

              {showInstructions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 text-sm text-gray-300 bg-black/40 p-4 rounded-md space-y-3 border border-white/5"
                >
                  <h3 className="font-medium text-indigo-400">
                    Steps to get your Social Data API key:
                  </h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Visit{" "}
                      <a
                        href="https://socialdata.tools"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        socialdata.tools{" "}
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </li>
                    <li>
                      Sign up for an account or log in if you already have one
                    </li>
                    <li>
                      Navigate to the API section in your dashboard or settings
                    </li>
                    <li>
                      Generate a new API key (you might need to subscribe to a
                      plan)
                    </li>
                    <li>Copy your API key and paste it in the field above</li>
                  </ol>
                  <p className="mt-2 text-gray-400">
                    This application uses the Social Data API to access
                    Twitter/X data because direct Twitter API access has become
                    expensive. Your API key is only stored in your browser's
                    local storage (localStorage) and is never sent to our
                    servers. The key is passed directly to the Social Data API
                    for authentication.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
