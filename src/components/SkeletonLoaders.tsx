"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function NavbarSkeleton() {
  return (
    <div className="w-full border-b border-white/10 bg-black/30 backdrop-blur-xl py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
            <Skeleton className="h-8 w-40 bg-gray-800" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-28 rounded-full bg-gray-800" />
            <Skeleton className="h-10 w-28 rounded-full bg-gray-800" />
            <Skeleton className="h-9 w-28 rounded-full bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <div className="max-w-2xl mx-auto text-center">
        <Skeleton className="h-16 w-full max-w-xl mx-auto mb-4 bg-gray-800" />
        <Skeleton className="h-4 w-full max-w-md mx-auto mb-12 bg-gray-800" />
        <Skeleton className="h-64 w-full max-w-md mx-auto mb-10 rounded-xl bg-gray-800" />
        <div className="flex flex-wrap justify-center gap-4">
          <Skeleton className="h-10 w-36 rounded-lg bg-gray-800" />
          <Skeleton className="h-10 w-36 rounded-lg bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export function FeaturesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Skeleton className="h-8 w-64 mx-auto mb-12 bg-gray-800" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-64 rounded-2xl bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}

export function TwitterFeedSkeleton() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col items-center space-y-8">
        <Skeleton className="w-full max-w-xl h-16 rounded-2xl bg-gray-800" />
        <div className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-black/95 to-zinc-900/80 p-6 backdrop-blur-xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2 bg-gray-800" />
              <Skeleton className="h-4 w-32 bg-gray-800" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28 rounded-lg bg-gray-800" />
              <Skeleton className="h-10 w-28 rounded-lg bg-gray-800" />
              <Skeleton className="h-10 w-28 rounded-lg bg-gray-800" />
            </div>
          </div>
          <Skeleton className="w-full h-64 rounded-lg mb-6 bg-gray-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-24 rounded-lg bg-gray-800"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TweetCardSkeleton() {
  return (
    <div className="w-full border border-white/10 bg-black/40 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-32 bg-gray-800" />
            <Skeleton className="h-4 w-24 bg-gray-800" />
          </div>
          <Skeleton className="h-16 w-full bg-gray-800" />
          <div className="mt-2 flex items-center gap-4">
            <Skeleton className="h-4 w-24 bg-gray-800" />
            <Skeleton className="h-4 w-24 bg-gray-800" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 pt-3 flex justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16 bg-gray-800" />
          <Skeleton className="h-4 w-16 bg-gray-800" />
          <Skeleton className="h-4 w-16 bg-gray-800" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16 bg-gray-800" />
          <Skeleton className="h-4 w-16 bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
