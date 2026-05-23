/*
  BuildNovaPredictRootSiteMetadata

  Produces the default Metadata object for the NovaPredict root layout.

  Product context:
  - NovaPredict is a fantasy football intelligence platform that translates sportsbook
    probability into accountable weekly decisions (projections, slate picks, challenge mode).
  - Marketing polish on share previews matters because users forward player cards and
    accountability reports to league chats — broken previews erode trust instantly.

  Called from:
  - app/src/app/layout.tsx (export const metadata)

  Depends on:
  - ResolveNovaPredictPublicSiteUrl for metadataBase and absolute social URLs
*/
import type { Metadata } from "next";
import { ResolveNovaPredictPublicSiteUrl } from "@/lib/seo/ResolveNovaPredictPublicSiteUrl";

const NOVA_PREDICT_SITE_NAME = "NovaPredict";
const NOVA_PREDICT_DEFAULT_TITLE = "NovaPredict | Fantasy Intelligence Platform";
const NOVA_PREDICT_DEFAULT_DESCRIPTION =
  "NovaPredict reads the Vegas prop market, classifies why lines move, and turns that into accountable weekly fantasy decisions.";
const NOVA_PREDICT_KEYWORDS = [
  "fantasy football",
  "NFL projections",
  "PPR rankings",
  "start sit advice",
  "sportsbook props",
  "fantasy analytics",
  "NovaPredict",
  "weekly fantasy picks",
  "accountability",
  "Monte Carlo projections",
];

export function BuildNovaPredictRootSiteMetadata(): Metadata {
  const siteUrl = ResolveNovaPredictPublicSiteUrl();
  const openGraphImageUrl = `${siteUrl}/opengraph-image`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: NOVA_PREDICT_DEFAULT_TITLE,
      template: `%s | ${NOVA_PREDICT_SITE_NAME}`,
    },
    description: NOVA_PREDICT_DEFAULT_DESCRIPTION,
    applicationName: NOVA_PREDICT_SITE_NAME,
    authors: [{ name: NOVA_PREDICT_SITE_NAME, url: siteUrl }],
    creator: NOVA_PREDICT_SITE_NAME,
    publisher: NOVA_PREDICT_SITE_NAME,
    category: "Sports",
    keywords: NOVA_PREDICT_KEYWORDS,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: NOVA_PREDICT_SITE_NAME,
      title: NOVA_PREDICT_DEFAULT_TITLE,
      description: NOVA_PREDICT_DEFAULT_DESCRIPTION,
      images: [
        {
          url: openGraphImageUrl,
          width: 1200,
          height: 630,
          alt: "NovaPredict — Fantasy intelligence platform powered by sportsbook probability",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: NOVA_PREDICT_DEFAULT_TITLE,
      description: NOVA_PREDICT_DEFAULT_DESCRIPTION,
      images: [openGraphImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/icon", sizes: "32x32", type: "image/png" },
        { url: "/icon-192", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
      shortcut: ["/icon"],
    },
    manifest: "/manifest.webmanifest",
    other: {
      "apple-mobile-web-app-title": NOVA_PREDICT_SITE_NAME,
      "mobile-web-app-capable": "yes",
    },
  };
}
