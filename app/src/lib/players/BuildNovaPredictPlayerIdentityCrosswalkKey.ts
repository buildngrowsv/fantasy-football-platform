/*
  BuildNovaPredictPlayerIdentityCrosswalkKey.ts
  ---------------------------------------------
  Deterministic join key for Sleeper catalog rows ↔ nflverse weekly actuals.

  Mirrors pipeline/lib/BuildNovaPredictPlayerIdentityCrosswalkKey.py so the web app
  can query player_weekly_actuals without maintaining a separate ID map table yet.
*/

export function BuildNovaPredictPlayerIdentityCrosswalkKey(
  fullName: string,
  team: string | null | undefined,
  position: string | null | undefined,
): string {
  const normalizedName = fullName.toLowerCase().split(/\s+/).filter(Boolean).join(" ");
  const normalizedTeam = (team ?? "").trim().toLowerCase();
  const normalizedPosition = (position ?? "").trim().toLowerCase();
  return `${normalizedName}|${normalizedTeam}|${normalizedPosition}`;
}
