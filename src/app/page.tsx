import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { TwitterFeedWrapper } from "@/components/TwitterFeedWrapper";
import {
  NavbarSkeleton,
  HeroSkeleton,
  FeaturesSkeleton,
} from "@/components/SkeletonLoaders";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Enhanced background with subtle grid pattern */}
      <div className="absolute top-0 left-0 right-0 -z-10 overflow-hidden h-[70vh]">
        <div className="absolute left-0 right-0 top-[-5%] h-[800px] w-full rounded-full bg-[radial-gradient(ellipse_at_top,rgba(120,58,240,0.2),transparent_70%)]"></div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Navbar with SSR */}
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>

      <main className="flex-grow">
        {/* Hero section with SSR - Search input will be inside the hero section */}
        <div className="relative">
          <Suspense fallback={<HeroSkeleton />}>
            <HeroSection />
          </Suspense>
        </div>

        {/* Twitter Feed section with black gradient background */}
        <div
          id="search"
          className="relative bg-gradient-to-b from-black/0 to-black py-16"
        >
          <TwitterFeedWrapper />
        </div>

        {/* Feature highlights with SSR */}
        <Suspense fallback={<FeaturesSkeleton />}>
          <FeaturesSection />
        </Suspense>
      </main>

      {/* Footer with SSR */}
      <Footer />
    </div>
  );
}
