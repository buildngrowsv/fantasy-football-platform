/*
  LookupNovaPredictPlayerHeadshotFromManifest
  -------------------------------------------
  Resolves ESPN headshot URLs and local cached paths from the build-time manifest.

  Why manifest instead of DB-only espn_athlete_id:
  - Sleeper only includes espn_id on ~20% of active fantasy players; ESPN rosters cover the full NFL.
  - Accountability and fallback UI rows often have name+team but no sleeper id — manifest name keys fix that.
  - Single lookup module keeps queries.ts and page components free of matching logic.

  Called from ResolveNovaPredictPlayerVisualAssets and getNovaPredictPlayerRecords enrichment.
*/

import rawHeadshotManifest from "@/generated/nfl-player-headshot-manifest.json";
import { BuildNflPlayerNameTeamHeadshotLookupKey } from "@/lib/assets/NormalizeNflPlayerNameForHeadshotMatching";
import { ResolveNflTeamAbbreviationAliasesForHeadshotLookup } from "@/lib/assets/ResolveNflTeamAbbreviationAliasesForHeadshotLookup";
import type {
  NovaPredictNflPlayerHeadshotManifest,
  NovaPredictNflPlayerHeadshotManifestRecord,
} from "@/lib/assets/NovaPredictNflPlayerHeadshotManifestTypes";

const headshotManifest = rawHeadshotManifest as NovaPredictNflPlayerHeadshotManifest;

export function LookupNovaPredictPlayerHeadshotFromManifest(input: {
  sleeperPlayerId?: string | null;
  espnAthleteId?: string | number | null;
  fullName?: string | null;
  team?: string | null;
}): NovaPredictNflPlayerHeadshotManifestRecord | null {
  if (input.sleeperPlayerId && headshotManifest.bySleeperId[input.sleeperPlayerId]) {
    return headshotManifest.bySleeperId[input.sleeperPlayerId];
  }

  if (input.espnAthleteId) {
    const espnKey = String(input.espnAthleteId);
    if (headshotManifest.byEspnAthleteId[espnKey]) {
      return headshotManifest.byEspnAthleteId[espnKey];
    }
  }

  if (input.fullName && input.team && input.team !== "TBD") {
    for (const teamVariant of ResolveNflTeamAbbreviationAliasesForHeadshotLookup(input.team)) {
      const nameTeamKey = BuildNflPlayerNameTeamHeadshotLookupKey(input.fullName, teamVariant);
      if (headshotManifest.byNameTeamKey[nameTeamKey]) {
        return headshotManifest.byNameTeamKey[nameTeamKey];
      }
    }
  }

  return null;
}

export function GetNovaPredictHeadshotManifestStats() {
  return {
    generatedAt: headshotManifest.generatedAt,
    espnRosterAthleteCount: headshotManifest.espnRosterAthleteCount,
    sleeperMatchedCount: headshotManifest.sleeperMatchedCount,
    downloadedHeadshotCount: headshotManifest.downloadedHeadshotCount,
  };
}
