import { Button } from "@/components/ui/button";
import { Twitter, Github } from "lucide-react";
import { HeroSearchSection } from "@/components/HeroSearchSection";

export function HeroSection() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 mt-24 mb-32">
        <div className="max-w-2xl mx-auto text-center">
          {/* Main title with app-themed gradient for better visibility */}
          <h2
            className="font-cabinet text-5xl md:text-7xl font-extrabold mb-0 text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(to bottom right, #ffffff, #e2e8f0, #c7d2fe)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.3))",
              animation:
                "fadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          >
            Twitter Analytics Visualized
          </h2>

          {/* Subtitle with improved styling and spacing */}
          <p
            className="text-[#D1D5DB] text-sm mb-8 max-w-xl mx-auto leading-relaxed"
            style={{
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              animation:
                "fadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards",
              opacity: 0,
            }}
          >
            Explore any Twitter profile with beautiful analytics.
          </p>

          {/* Client component for Twitter username input or API key config */}
          <HeroSearchSection />

          {/* Call to action buttons with improved, sleeker styling */}
          <div
            className="flex flex-wrap justify-center gap-4"
            style={{
              animation:
                "fadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.8s forwards",
              opacity: 0,
            }}
          >
            <Button
              asChild
              variant="default"
              className="relative overflow-hidden px-5 py-2 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white transition-all duration-300"
            >
              <a
                href="https://twitter.com/UtkarshTheDev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white"
              >
                <Twitter className="w-4 h-4" />
                <span className="text-[15px]">Follow on X</span>
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <div
                    className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    style={{ transform: "rotate(-45deg)" }}
                  ></div>
                </div>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="px-5 py-2 h-10 border border-white/5 bg-black/70 hover:bg-black/90 rounded-lg text-white transition-all duration-300"
            >
              <a
                href="https://github.com/UtkarshTheDev/TweeterLens"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white"
              >
                <Github className="w-4 h-4" />
                <span className="text-[15px]">Star on GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
