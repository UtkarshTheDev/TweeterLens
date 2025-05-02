import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { cabinet } from "./fonts";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "TweeterLens - Twitter Analytics & Visualization",
  description:
    "Visualize and analyze Twitter/X data with beautiful analytics dashboards and interactive insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} ${cabinet.variable} min-h-screen relative`}
      >
        {/* Global background applied to all pages - reduced intensity */}
        <div className="fixed inset-0 -z-10 bg-[#090418]">
          {/* Background image with reduced opacity */}
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat opacity-100 "></div>

          {/* Subtler overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/40"></div>

          {/* Lighter grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f08_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
