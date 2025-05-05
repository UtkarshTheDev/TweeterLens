"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface SearchContextType {
  globalUsername: string;
  setGlobalUsername: (username: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [globalUsername, setGlobalUsername] = useState("");

  return (
    <SearchContext.Provider value={{ globalUsername, setGlobalUsername }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
