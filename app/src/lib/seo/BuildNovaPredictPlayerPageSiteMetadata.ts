/*
  BuildNovaPredictPlayerPageSiteMetadata

  Builds Metadata for /players/[id] detail pages so shared player cards show the right
  title, description, and player-specific Open Graph image in league chats.

  Called from:
  - app/src/app/(app)/players/[id]/page.tsx via generateMetadata

  Depends on:
  - NovaPredictPlayerRecord from db/schema
  - ResolveNovaPredictPublicSiteUrl
*/
import type { Metadata } from "next";
import type { NovaPredictPlayerRecord } from "@/lib/db/schema";
import { ResolveNovaPredictPublicSiteUrl } from "@/lib/seo/ResolveNovaPredictPublicSiteUrl";

export function BuildNovaPredictPlayerPageSiteMetadata(player: NovaPredictPlayerRecord): Metadata {
  const siteUrl = ResolveNovaPredictPublicSiteUrl();
  const playerPath = `/players/${encodeURIComponent(player.id)}`;
  const title = `${player.fullName} · ${player.position} · Week Projection`;
  const description = `${player.fullName} (${player.position}, ${player.team}) — NovaPredict ${player.novaPprProjection.toFixed(1)} PPR vs Vegas ${player.vegasPprProjection.toFixed(1)}. ${player.marketSignalLabel}. ${player.matchupLabel}.`;
  const openGraphImageUrl = `${siteUrl}${playerPath}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: playerPath,
    },
    openGraph: {
      type: "article",
      url: `${siteUrl}${playerPath}`,
      title: `${title} | NovaPredict`,
      description,
      images: [
        {
          url: openGraphImageUrl,
          width: 1200,
          height: 630,
          alt: `${player.fullName} NovaPredict projection card`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | NovaPredict`,
      description,
      images: [openGraphImageUrl],
    },
  };
}
