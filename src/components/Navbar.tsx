import Link from "next/link";
import { BarChart3, Twitter, Github, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <div className="relative z-10 h-8 w-8 flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-indigo-400 drop-shadow-md" />
              </div>
            </div>
            <h1 className="font-cabinet relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-2xl font-semibold tracking-normal drop-shadow-sm">
              <span className="mr-1">Tweeter</span>
              <span className="font-extrabold">Lens</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Raw Tweets Button */}
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-3 h-9 rounded-full border-white/10 bg-black/50 px-5 py-2 text-sm text-white shadow-md hover:border-purple-500/50 hover:bg-black/70 transition-all"
            >
              <Link href="/tweets" className="flex items-center gap-2.5">
                <div className="text-indigo-400">
                  <Database className="h-4 w-4" />
                </div>
                <span>Raw Tweets</span>
              </Link>
            </Button>

            {/* GitHub Button - Darker, more minimal */}
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-3 h-10 rounded-full border-white/5 bg-black/70 px-5 py-4 text-sm font-medium text-white shadow-md hover:border-white/10 hover:bg-black/90 transition-all duration-300"
            >
              <a
                href="https://github.com/UtkarshTheDev/TweeterLens"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </Button>

            {/* X/Twitter Button - More prominent */}
            <Button
              asChild
              className="relative overflow-hidden flex items-center gap-3 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-medium text-white shadow-lg hover:shadow-indigo-500/15 transition-all duration-300"
            >
              <a
                href="https://twitter.com/UtkarshTheDev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5"
              >
                {/* Subtle shine effect */}
                <div className="absolute inset-0 -z-10 overflow-hidden rounded-full">
                  <div
                    className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    style={{ transform: "rotate(-45deg)" }}
                  ></div>
                </div>
                <Twitter className="h-4 w-4" />
                <span>Follow</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function NavbarClient({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">{children}</div>
    </header>
  );
}
