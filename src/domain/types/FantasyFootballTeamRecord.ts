/**
 * FantasyFootballTeamRecord
 *
 * Represents a manager's franchise inside a league. Wins/losses start at
 * zero until game results sync; the type supports standings tables and
 * head-to-head matchup headers without coupling to a specific database.
 */
export interface FantasyFootballTeamRecord {
  readonly teamId: string;
  readonly leagueId: string;
  readonly managerDisplayName: string;
  readonly teamName: string;
  readonly wins: number;
  readonly losses: number;
  readonly ties: number;
  readonly totalPointsFor: number;
}
