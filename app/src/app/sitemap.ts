/*
  sitemap.xml — helps search engines discover NovaPredict routes and player detail pages.

  Player URLs are included when the database is reachable at build/request time; static routes
  are always listed so sitemap never ships empty on a cold DB.
*/
import type { MetadataRoute } from "next";
import { getNovaPredictPlayerRecords } from "@/lib/db/queries";
import { ResolveNovaPredictPublicSiteUrl } from "@/lib/seo/ResolveNovaPredictPublicSiteUrl";

const STATIC_NOVA_PREDICT_ROUTES = [
  { path: "/", changeFrequency: "daily" as const, priority: 1 },
  { path: "/dashboard", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/slate", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/accountability", changeFrequency: "weekly" as const, priority: 0.85 },
  { path: "/challenge", changeFrequency: "weekly" as const, priority: 0.85 },
  { path: "/experts", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/import", changeFrequency: "monthly" as const, priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = ResolveNovaPredictPublicSiteUrl();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_NOVA_PREDICT_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const players = await getNovaPredictPlayerRecords(120);
  const playerEntries: MetadataRoute.Sitemap = players.map((player) => ({
    url: `${siteUrl}/players/${encodeURIComponent(player.id)}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  return [...staticEntries, ...playerEntries];
}
