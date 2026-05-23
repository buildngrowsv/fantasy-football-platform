/**
 * FantasyFootballLeagueStatus
 *
 * Lifecycle states for a fantasy league season. Used on dashboard cards
 * and commissioner admin flows so users always know whether they can
 * draft, set lineups, or review final standings.
 */
export enum FantasyFootballLeagueStatus {
  PreDraft = "pre_draft",
  Drafting = "drafting",
  InSeason = "in_season",
  Playoffs = "playoffs",
  Completed = "completed",
}
