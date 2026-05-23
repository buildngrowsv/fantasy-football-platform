import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/layout/SiteNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NovaPredict | Fantasy Intelligence Platform",
  description:
    "NovaPredict translates sportsbook probability into actionable fantasy football decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/*
          We keep one global nav mounted at the root because this platform has both
          a marketing narrative and a power-user workflow. A persistent nav prevents
          users from feeling "lost in a separate app" when they jump between those contexts.
        */}
        <SiteNav />
        <main style={{ flex: 1, padding: "1.5rem 0 3rem" }}>{children}</main>
      </body>
    </html>
  );
}
