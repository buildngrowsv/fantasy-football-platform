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
import { LookupNovaPredictPlayerHeadshotFromManifest } from "@/lib/assets/LookupNovaPredictPlayerHeadshotFromManifest";
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
  espnAthleteId: string | null;
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

  /*
    Manifest lookup fills gaps when DB lacks espn_athlete_id — ESPN rosters cover ~2k+ NFL athletes
    while Sleeper espn_id is sparse on rookies and recently promoted players.
  */
  const manifestRecord = LookupNovaPredictPlayerHeadshotFromManifest({
    sleeperPlayerId: input.sleeperPlayerId,
    espnAthleteId: input.espnAthleteId,
    fullName: input.fullName,
    team: input.team,
  });

  const resolvedEspnAthleteId =
    input.espnAthleteId != null && String(input.espnAthleteId).trim()
      ? String(input.espnAthleteId)
      : manifestRecord?.espnAthleteId ?? null;

  const headshotUrl =
    manifestRecord?.headshotUrl ?? BuildEspnNflPlayerHeadshotUrl(resolvedEspnAthleteId);

  const localHeadshotPath = manifestRecord?.localHeadshotPath
    ?? (resolvedEspnAthleteId ? `/assets/players/by-espn/${resolvedEspnAthleteId}.png` : null);

  return {
    headshotUrl,
    localHeadshotPath,
    teamLogoUrl: teamBrand?.logoUrl ?? null,
    teamLogoLocalPath: teamBrand?.localLogoPath ?? null,
    opponentLogoUrl: opponentBrand?.logoUrl ?? null,
    opponentLogoLocalPath: opponentBrand?.localLogoPath ?? null,
    teamPrimaryColor: teamBrand?.primaryColor ?? null,
    opponentPrimaryColor: opponentBrand?.primaryColor ?? null,
    initials: BuildPlayerInitialsFromFullName(input.fullName),
    espnAthleteId: resolvedEspnAthleteId,
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
