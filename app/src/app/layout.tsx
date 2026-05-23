import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import { NovaPredictSiteHeader } from "@/components/layout/NovaPredictSiteHeader";
import { BuildNovaPredictRootSiteMetadata } from "@/lib/seo/BuildNovaPredictRootSiteMetadata";

/*
  Root typography — Broadcast Ledger identity.
  Newsreader gives headlines an editorial Sunday-desk feel; IBM Plex Sans/Mono replace
  the overused Inter + JetBrains pairing that made the product read as generic AI chrome.
*/
const newsreader = Newsreader({
  variable: "--font-display-loaded",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans-loaded",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-loaded",
  weight: ["400", "500", "600"],
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
    <html
      lang="en"
      className={`${newsreader.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NovaPredictSiteHeader />
        <main className="np-main-content">{children}</main>
      </body>
    </html>
  );
}
