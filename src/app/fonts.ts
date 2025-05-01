import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const sentient = localFont({
  src: [
    {
      path: "../../public/fonts/sentient-web/Sentient-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/sentient-web/Sentient-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/sentient-web/Sentient-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sentient",
  display: "swap",
});
