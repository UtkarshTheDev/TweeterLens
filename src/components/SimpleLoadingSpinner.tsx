"use client";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface SimpleLoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function SimpleLoadingSpinner({ 
  message = "Loading", 
  size = "md" 
}: SimpleLoadingSpinnerProps) {
  // Size mappings
  const sizeClasses = {
    sm: {
      container: "h-8 w-8",
      icon: "h-4 w-4"
    },
    md: {
      container: "h-12 w-12",
      icon: "h-6 w-6"
    },
    lg: {
      container: "h-16 w-16",
      icon: "h-8 w-8"
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      {/* Spinning loader */}
      <motion.div
        animate={{ 
          rotate: 360,
          transition: { 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
          }
        }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 blur-md opacity-50"></div>
        <div className={`relative ${sizeClasses[size].container} rounded-full bg-black flex items-center justify-center border border-white/10`}>
          <Loader2 className={`${sizeClasses[size].icon} text-indigo-400`} />
        </div>
      </motion.div>

      {/* Loading message */}
      {message && (
        <p className="text-sm text-gray-400">{message}</p>
      )}
    </div>
  );
}
