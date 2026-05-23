/*
  ResolveNflTeamAbbreviationAliasesForHeadshotLookup
  --------------------------------------------------
  Maps equivalent NFL team abbreviations across data providers.

  Why this exists:
  - Sleeper uses "WAS" for Washington Commanders; ESPN rosters use "WSH".
  - Without alias expansion, manifest name+team lookups fail and players show initials
    even when ESPN has a valid headshot (e.g. Jayden Daniels).
*/

const NFL_TEAM_ABBREVIATION_ALIAS_GROUPS: string[][] = [
  ["WAS", "WSH"],
];

const ALIAS_LOOKUP = new Map<string, string[]>();

for (const aliasGroup of NFL_TEAM_ABBREVIATION_ALIAS_GROUPS) {
  for (const abbreviation of aliasGroup) {
    ALIAS_LOOKUP.set(abbreviation, aliasGroup);
  }
}

/**
 * Returns team abbreviation variants to try when matching manifest byNameTeamKey entries.
 * Called from LookupNovaPredictPlayerHeadshotFromManifest before giving up on name+team match.
 */
export function ResolveNflTeamAbbreviationAliasesForHeadshotLookup(teamAbbreviation: string): string[] {
  const normalizedTeam = teamAbbreviation.toUpperCase();
  return ALIAS_LOOKUP.get(normalizedTeam) ?? [normalizedTeam];
}
