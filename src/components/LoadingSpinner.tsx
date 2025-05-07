"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

// Collection of Twitter facts
const twitterFacts = [
  "Twitter was founded in March 2006 by Jack Dorsey, Noah Glass, Biz Stone, and Evan Williams.",
  "The original name for Twitter was 'twttr' - inspired by Flickr and SMS character limits.",
  "The first tweet was sent by Jack Dorsey on March 21, 2006: 'just setting up my twttr'.",
  "Twitter's iconic bird logo is named 'Larry' after the basketball player Larry Bird.",
  "The hashtag (#) was first proposed by Chris Messina in 2007 as a way to group conversations.",
  "Twitter's 140-character limit was originally designed to fit within SMS message limits.",
  "In 2017, Twitter doubled the character limit from 140 to 280 characters.",
  "The retweet feature wasn't created by Twitter - it was invented by users who started putting 'RT' before tweets.",
  "Twitter processes over 500 million tweets per day, which is about 6,000 tweets per second.",
  "The fail whale was an image shown during Twitter's early downtime periods, created by artist Yiying Lu.",
];

// Collection of programming facts
const programmingFacts = [
  "JavaScript was created in just 10 days by Brendan Eich in 1995.",
  "The first computer programmer was Ada Lovelace, who wrote the first algorithm for Charles Babbage's Analytical Engine in the 1840s.",
  "The term 'bug' in programming originated when a moth was found trapped in a relay of the Harvard Mark II computer in 1947.",
  "Python was named after Monty Python, not the snake.",
  "The most popular programming language for AI and machine learning is Python.",
  "TypeScript, a superset of JavaScript, was developed by Microsoft to add static typing to JavaScript.",
  "React was created by Facebook (now Meta) and was first deployed on Facebook's newsfeed in 2011.",
  "The QWERTY keyboard layout was designed to slow down typists to prevent jamming on mechanical typewriters.",
  "The first website ever created is still online: http://info.cern.ch/",
  "Git, the popular version control system, was created by Linus Torvalds, who also created Linux.",
];

// Collection of advisory notes
const advisoryNotes = [
  "Due to Twitter API limitations, we may not be able to fetch all tweets from accounts with very high tweet counts.",
  "The Twitter API has rate limits that may affect how many tweets we can retrieve in a single session.",
  "For accounts with thousands of tweets, we typically fetch the most recent ones first.",
  "Tweet statistics are calculated based on the tweets we're able to fetch, which may be a subset of all tweets.",
  "Fetching tweets from very active accounts may take longer. Please be patient.",
  "Our app caches tweet data for 8 hours to improve performance and reduce API calls.",
  "The Twitter contribution graph shows posting frequency patterns similar to GitHub's contribution graph.",
  "For the most accurate results, we recommend analyzing accounts with fewer than 3,200 tweets.",
  "Some metrics like view counts may not be available for all tweets due to API limitations.",
  "Tweet engagement statistics are most accurate for recent tweets.",
];

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "Loading tweets",
}: LoadingSpinnerProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [currentFactType, setCurrentFactType] = useState<
    "twitter" | "programming" | "advisory"
  >("twitter");

  // Combine all facts and notes - wrapped in useMemo to prevent recreation on every render
  const allFacts = useMemo(
    () => ({
      twitter: twitterFacts,
      programming: programmingFacts,
      advisory: advisoryNotes,
    }),
    []
  ); // Empty dependency array since these arrays are defined outside the component

  // Simplified fact rotation - just change every 4 seconds without fade effects
  useEffect(() => {
    // Use a single interval for simplicity
    const factInterval = setInterval(() => {
      // Update the fact index
      setCurrentFactIndex((prevIndex) => {
        const facts = allFacts[currentFactType];
        const newIndex = (prevIndex + 1) % facts.length;

        // Every 3 facts, change the fact type
        if (newIndex % 3 === 0 && newIndex !== 0) {
          setCurrentFactType((prevType) => {
            if (prevType === "twitter") return "programming";
            if (prevType === "programming") return "advisory";
            return "twitter";
          });
        }

        return newIndex;
      });
    }, 4000); // Slightly faster rotation

    return () => {
      clearInterval(factInterval);
    };
  }, [currentFactType, allFacts]); // Include allFacts as a dependency since it's used in the effect

  // Get the current fact based on type and index
  const getCurrentFact = () => {
    return allFacts[currentFactType][
      currentFactIndex % allFacts[currentFactType].length
    ];
  };

  // Get the title based on current fact type
  const getFactTitle = () => {
    if (currentFactType === "twitter") return "Twitter Fact";
    if (currentFactType === "programming") return "Programming Fact";
    return "Good to Know";
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      {/* Spinning loader - simplified animation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 blur-md opacity-50"></div>
        <div className="relative h-16 w-16 rounded-full bg-black flex items-center justify-center border border-white/10">
          <Loader2 className="h-8 w-8 text-indigo-400" />
        </div>
      </motion.div>

      {/* Loading message */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-1">{message}...</h3>
        <p className="text-sm text-gray-400">This may take a moment</p>
      </div>

      {/* Facts and notes with simpler transition */}
      <div className="max-w-md bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl">
        <motion.div
          key={`${currentFactType}-${currentFactIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="inline-block px-3 py-1 mb-3 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300">
            {getFactTitle()}
          </div>
          <p className="text-gray-300">{getCurrentFact()}</p>
        </motion.div>
      </div>
    </div>
  );
}
