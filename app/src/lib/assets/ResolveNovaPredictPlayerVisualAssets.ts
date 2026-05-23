/*
  ResolveNovaPredictPlayerVisualAssets
  ------------------------------------
  Central resolver that turns raw DB fields (espn_id, team, opponent) into render-ready image URLs.

  Why a dedicated resolver instead of inline URL strings in every page:
  - Keeps fallback logic (CDN → local cached headshot → initials) in one place for AI agents editing UI later.
  - Pages only pass player records; they don't need to know ESPN URL patterns or local asset paths.

  Called from: getNovaPredictPlayerRecords enrichment in queries.ts
*/

import { BuildEspnNflPlayerHeadshotUrl, BuildPlayerInitialsFromFullName } from "@/lib/assets/BuildEspnNflPlayerHeadshotUrl";
import { lookupNflTeamBrandAsset } from "@/lib/assets/NflTeamBrandAssetCatalog";
import type { FantasyFootballPlayerPosition } from "@/lib/db/schema";

export interface NovaPredictPlayerVisualAssetBundle {
  headshotUrl: string | null;
  localHeadshotPath: string | null;
  teamLogoUrl: string | null;
  teamLogoLocalPath: string | null;
  opponentLogoUrl: string | null;
  opponentLogoLocalPath: string | null;
  teamPrimaryColor: string | null;
  opponentPrimaryColor: string | null;
  initials: string;
}

export function ResolveNovaPredictPlayerVisualAssets(input: {
  fullName: string;
  position: FantasyFootballPlayerPosition;
  team: string;
  opponent: string;
  espnAthleteId?: string | number | null;
  sleeperPlayerId?: string | null;
}): NovaPredictPlayerVisualAssetBundle {
  const teamBrand = lookupNflTeamBrandAsset(input.team);
  const opponentBrand = lookupNflTeamBrandAsset(input.opponent);
  const espnHeadshotUrl = BuildEspnNflPlayerHeadshotUrl(input.espnAthleteId);

  /*
    Local headshot path mirrors sync-nfl-visual-assets.mjs output under public/assets/players/.
    We prefer CDN at runtime (always fresh) but local copy gives same-origin fallback on Cloudflare edge.
  */
  const localHeadshotPath =
    input.sleeperPlayerId && espnHeadshotUrl ? `/assets/players/${input.sleeperPlayerId}.png` : null;

  return {
    headshotUrl: espnHeadshotUrl,
    localHeadshotPath,
    teamLogoUrl: teamBrand?.logoUrl ?? null,
    teamLogoLocalPath: teamBrand?.localLogoPath ?? null,
    opponentLogoUrl: opponentBrand?.logoUrl ?? null,
    opponentLogoLocalPath: opponentBrand?.localLogoPath ?? null,
    teamPrimaryColor: teamBrand?.primaryColor ?? null,
    opponentPrimaryColor: opponentBrand?.primaryColor ?? null,
    initials: BuildPlayerInitialsFromFullName(input.fullName),
  };
}

/**
 * Position accent colors match design mocks (novapredect_player_card_v10.html) for visual consistency
 * when headshots fail and we show initials on a tinted background.
 */
export function ResolvePositionAccentColor(position: FantasyFootballPlayerPosition): string {
  if (position === "QB") return "var(--np-amber)";
  if (position === "RB") return "var(--np-accent)";
  if (position === "TE") return "#a36bc8";
  if (position === "K") return "#e8a838";
  if (position === "DST") return "#8899aa";
  return "var(--np-cyan)";
}
