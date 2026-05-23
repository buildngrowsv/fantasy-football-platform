/*
  BuildEspnNflPlayerHeadshotUrl
  -----------------------------
  Constructs ESPN CDN headshot URLs from the cross-reference ESPN athlete ID.

  Data lineage:
  - Sleeper player catalog (ingested by FetchSleeperNflPlayerCatalogIngestJob) includes `espn_id` on most active NFL players.
  - When Sleeper lacks espn_id (e.g. some rookies), seed script can backfill via ESPN search API.
  - ESPN headshot pattern verified live: https://a.espncdn.com/i/headshots/nfl/players/full/{espn_id}.png

  Used by: queries.ts enrichment, NovaPredictPlayerHeadshotAvatar, sync-nfl-visual-assets.mjs
*/

export function BuildEspnNflPlayerHeadshotUrl(espnAthleteId: string | number | null | undefined): string | null {
  if (espnAthleteId === null || espnAthleteId === undefined || espnAthleteId === "") {
    return null;
  }

  const normalizedId = String(espnAthleteId).trim();
  if (!/^\d+$/.test(normalizedId)) {
    return null;
  }

  return `https://a.espncdn.com/i/headshots/nfl/players/full/${normalizedId}.png`;
}

/**
 * Derives player initials for avatar fallback when headshot CDN returns 404.
 * Product reason: slate cards must never show empty circles — initials preserve scanability on mobile.
 */
export function BuildPlayerInitialsFromFullName(fullName: string): string {
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) {
    return "?";
  }
  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }
  return `${nameParts[0][0] ?? ""}${nameParts[nameParts.length - 1][0] ?? ""}`.toUpperCase();
}
