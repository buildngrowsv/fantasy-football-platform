import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FantasyFootballPlatformNavigationHeader } from "@/components/layout/FantasyFootballPlatformNavigationHeader";
import { FantasyFootballPlatformSiteFooter } from "@/components/layout/FantasyFootballPlatformSiteFooter";
import {
  FantasyFootballPlatformApplicationName,
  FantasyFootballPlatformTagline,
} from "@/lib/constants/FantasyFootballPlatformConstants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: FantasyFootballPlatformApplicationName,
    template: `%s | ${FantasyFootballPlatformApplicationName}`,
  },
  description: FantasyFootballPlatformTagline,
};

/**
 * RootLayout
 *
 * Wraps every route with global nav, footer, fonts, and the dark
 * gridiron-themed background. Product pages inherit this shell automatically.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#060d18] font-sans text-white">
        <FantasyFootballPlatformNavigationHeader />
        <div className="flex-1">{children}</div>
        <FantasyFootballPlatformSiteFooter />
      </body>
    </html>
  );
}
