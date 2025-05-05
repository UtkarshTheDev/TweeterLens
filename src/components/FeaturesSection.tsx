import { Search, BarChart2, Zap } from "lucide-react";

export function FeaturesSection() {
  return (
    <div className="relative bg-black py-16">
      <div className="container mx-auto px-4">
        <h3 className="heading-cabinet text-2xl font-bold text-white mb-12 text-center">
          Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/5 to-blue-900/5 border border-white/5 backdrop-blur-sm">
            <div className="h-16 w-16 bg-purple-500/5 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <Search className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="heading-cabinet text-xl font-semibold text-white mb-4">
              Search Any User
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Enter any Twitter/X username to analyze their posting history and
              engagement patterns
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/5 to-violet-900/5 border border-white/5 backdrop-blur-sm">
            <div className="h-16 w-16 bg-blue-500/5 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <BarChart2 className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="heading-cabinet text-xl font-semibold text-white mb-4">
              Detailed Analytics
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              View engagement metrics, hashtag usage, and interactive heatmaps
              of activity patterns
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-900/5 to-purple-900/5 border border-white/5 backdrop-blur-sm">
            <div className="h-16 w-16 bg-violet-500/5 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <Zap className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="heading-cabinet text-xl font-semibold text-white mb-4">
              Fast & Efficient
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Smart caching and optimized data fetching for quick results and
              seamless user experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
