/*
  BuildNovaPredictPageSiteMetadata

  Builds page-scoped Metadata for static NovaPredict routes (dashboard, slate, etc.).

  Why not inline metadata on every page:
  - Centralizing Open Graph + Twitter + canonical construction keeps share previews consistent
    and prevents one page from forgetting twitter:card or canonical when copy-pasting metadata.
  - Each page still exports its own `metadata` constant — this helper only standardizes shape.

  Called from:
  - Individual page.tsx files under app/src/app

  Depends on:
  - ResolveNovaPredictPublicSiteUrl
*/
import type { Metadata } from "next";
import { ResolveNovaPredictPublicSiteUrl } from "@/lib/seo/ResolveNovaPredictPublicSiteUrl";

export function BuildNovaPredictPageSiteMetadata(input: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const siteUrl = ResolveNovaPredictPublicSiteUrl();
  const normalizedPath = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const canonicalUrl = `${siteUrl}${normalizedPath}`;
  const openGraphImageUrl = `${siteUrl}/opengraph-image`;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: normalizedPath,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `${input.title} | NovaPredict`,
      description: input.description,
      images: [
        {
          url: openGraphImageUrl,
          width: 1200,
          height: 630,
          alt: `${input.title} — NovaPredict`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${input.title} | NovaPredict`,
      description: input.description,
      images: [openGraphImageUrl],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
        },
  };
}
