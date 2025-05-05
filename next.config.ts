import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization
  images: {
    domains: ["pbs.twimg.com", "abs.twimg.com"],
    formats: ["image/avif", "image/webp"],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Enable experimental features
  experimental: {
    // Enable optimistic updates for better UX
    optimisticClientCache: true,
    // Enable server actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Configure headers for better caching and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=31536000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
