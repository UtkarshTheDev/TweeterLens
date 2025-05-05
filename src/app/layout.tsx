import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { cabinet } from "./fonts";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
  themeColor: "#090418",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "TweeterLens - Twitter Analytics & Visualization",
  description:
    "Visualize and analyze Twitter/X data with beautiful analytics dashboards and interactive insights",
  metadataBase: new URL("https://tweeterlens.vercel.app"),
  openGraph: {
    title: "TweeterLens - Twitter Analytics & Visualization",
    description:
      "Visualize and analyze Twitter/X data with beautiful analytics dashboards",
    url: "https://tweeterlens.vercel.app",
    siteName: "TweeterLens",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TweeterLens - Twitter Analytics & Visualization",
    description:
      "Visualize and analyze Twitter/X data with beautiful analytics dashboards",
    creator: "@UtkarshTheDev",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preload critical assets */}
        <link
          rel="preload"
          href="/fonts/cabinet-web/CabinetGrotesk-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/cabinet-web/CabinetGrotesk-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preload" href="/bg.png" as="image" type="image/png" />
        <link
          rel="preconnect"
          href="https://api.socialdata.tools"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${GeistSans.className} ${cabinet.variable} min-h-screen relative`}
      >
        {/* Global background applied to all pages - optimized for performance with animation */}
        <div className="fixed inset-0 -z-10 bg-[#090418]">
          {/* Background image with optimized loading and animation */}
          <div
            className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundSize: "cover",
              willChange: "transform",
              contain: "paint",
              animation: "fadeIn 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          ></div>

          {/* Subtler overlay gradient - optimized with animation */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/40"
            style={{
              willChange: "opacity",
              animation:
                "fadeIn 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards",
            }}
          ></div>

          {/* Lighter grid pattern - optimized with animation */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f08_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px]"
            style={{
              willChange: "transform",
              animation:
                "fadeIn 2s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards",
            }}
          ></div>

          {/* Animated particles */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              animation:
                "fadeIn 2.2s cubic-bezier(0.22, 1, 0.36, 1) 0.6s forwards",
              opacity: 0,
            }}
          >
            <div
              className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse"
              style={{ top: "20%", left: "30%" }}
            ></div>
            <div
              className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse"
              style={{ top: "50%", left: "20%", animationDelay: "1s" }}
            ></div>
            <div
              className="absolute h-2 w-2 rounded-full bg-indigo-400 animate-pulse"
              style={{ top: "30%", left: "70%", animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse"
              style={{ top: "60%", left: "80%", animationDelay: "1.5s" }}
            ></div>
            <div
              className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse"
              style={{ top: "70%", left: "40%", animationDelay: "2s" }}
            ></div>
          </div>
        </div>

        <Providers>
          {children}

          {/* Deferred analytics loading */}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
