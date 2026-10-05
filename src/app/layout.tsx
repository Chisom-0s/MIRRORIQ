import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MirrorIQ — Know What Works Before You Spend",
    template: "%s | MirrorIQ",
  },
  description:
    "Your visual purchase decision engine. AI-powered analysis helps you determine whether a product is right for you before purchasing.",
  keywords: [
    "virtual try-on",
    "purchase decision",
    "beauty",
    "fashion",
    "AI analysis",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900 font-sans">
        {children}
      </body>
    </html>
  );
}
