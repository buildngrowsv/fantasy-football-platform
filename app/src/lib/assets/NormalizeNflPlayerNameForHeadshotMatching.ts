/*
  NormalizeNflPlayerNameForHeadshotMatching
  -----------------------------------------
  Normalizes player names so Sleeper catalog entries can be matched to ESPN roster athletes
  even when suffixes, punctuation, or spelling variants differ between data providers.

  Used by sync-nfl-visual-assets.mjs when building the headshot manifest and at runtime
  when resolving accountability rows that only store player_name (no sleeper id).
*/

export function NormalizeNflPlayerNameForHeadshotMatching(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/['']/g, "")
    .replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Composite lookup key: normalized name + team abbreviation.
 * Team disambiguates common names and prevents wrong-headshot swaps across rosters.
 */
export function BuildNflPlayerNameTeamHeadshotLookupKey(fullName: string, teamAbbreviation: string): string {
  return `${NormalizeNflPlayerNameForHeadshotMatching(fullName)}|${teamAbbreviation.toUpperCase()}`;
}
