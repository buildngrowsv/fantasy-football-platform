import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NovaPredictSiteHeader } from "@/components/layout/NovaPredictSiteHeader";
import { BuildNovaPredictRootSiteMetadata } from "@/lib/seo/BuildNovaPredictRootSiteMetadata";

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

export const metadata = BuildNovaPredictRootSiteMetadata();

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
        <NovaPredictSiteHeader />
        <main className="np-main-content">{children}</main>
      </body>
    </html>
  );
}
