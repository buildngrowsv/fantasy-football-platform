/*
  FetchSleeperLeaguesForUserFromPublicApi.ts
  ------------------------------------------
  Lists NFL leagues for a Sleeper user in a given season.

  Sleeper docs: GET https://api.sleeper.app/v1/user/<user_id>/leagues/nfl/<season>
*/

export interface SleeperLeagueSummaryRecord {
  leagueId: string;
  leagueName: string;
  season: number;
  totalRosters: number;
  status: string;
}

export async function FetchSleeperLeaguesForUserFromPublicApi(
  sleeperUserId: string,
  season: number,
): Promise<SleeperLeagueSummaryRecord[]> {
  const response = await fetch(
    `https://api.sleeper.app/v1/user/${encodeURIComponent(sleeperUserId)}/leagues/nfl/${season}`,
    { next: { revalidate: 300 } },
  );

  if (!response.ok) {
    throw new Error(`Sleeper leagues lookup failed (${response.status})`);
  }

  const payload = (await response.json()) as Array<{
    league_id?: string;
    name?: string;
    season?: string | number;
    total_rosters?: number;
    status?: string;
  }>;

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .filter((league) => Boolean(league.league_id))
    .map((league) => ({
      leagueId: String(league.league_id),
      leagueName: String(league.name ?? "Unnamed league"),
      season: Number(league.season ?? season),
      totalRosters: Number(league.total_rosters ?? 0),
      status: String(league.status ?? "unknown"),
    }));
}
