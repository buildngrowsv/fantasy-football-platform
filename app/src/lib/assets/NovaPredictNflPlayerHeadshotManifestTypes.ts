/*
  NovaPredictNflPlayerHeadshotManifestRecord
  ------------------------------------------
  Type definitions for the generated headshot manifest produced by sync-nfl-visual-assets.mjs.

  The manifest is the runtime bridge between Sleeper player IDs / names and ESPN headshot CDN URLs.
  We generate it at build time so Cloudflare Workers pages can resolve images without extra API calls.
*/

export interface NovaPredictNflPlayerHeadshotManifestRecord {
  espnAthleteId: string;
  fullName: string;
  normalizedName: string;
  team: string;
  position: string | null;
  headshotUrl: string;
  localHeadshotPath: string;
  sleeperPlayerId: string | null;
}

export interface NovaPredictNflPlayerHeadshotManifest {
  generatedAt: string;
  espnRosterAthleteCount: number;
  sleeperMatchedCount: number;
  downloadedHeadshotCount: number;
  bySleeperId: Record<string, NovaPredictNflPlayerHeadshotManifestRecord>;
  byEspnAthleteId: Record<string, NovaPredictNflPlayerHeadshotManifestRecord>;
  byNameTeamKey: Record<string, NovaPredictNflPlayerHeadshotManifestRecord>;
}

export const EMPTY_NOVA_PREDICT_NFL_PLAYER_HEADSHOT_MANIFEST: NovaPredictNflPlayerHeadshotManifest = {
  generatedAt: "",
  espnRosterAthleteCount: 0,
  sleeperMatchedCount: 0,
  downloadedHeadshotCount: 0,
  bySleeperId: {},
  byEspnAthleteId: {},
  byNameTeamKey: {},
};
