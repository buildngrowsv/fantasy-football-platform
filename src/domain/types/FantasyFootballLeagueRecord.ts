import { FantasyFootballLeagueStatus } from "@/domain/types/FantasyFootballLeagueStatus";
import { FantasyFootballScoringFormat } from "@/domain/types/FantasyFootballScoringFormat";

/**
 * FantasyFootballLeagueRecord
 *
 * Core league metadata shown on the leagues index and league detail header.
 * Does not embed rosters or schedules — those load through dedicated services
 * so list views stay fast on mobile.
 */
export interface FantasyFootballLeagueRecord {
  readonly leagueId: string;
  readonly leagueName: string;
  readonly commissionerDisplayName: string;
  readonly teamCount: number;
  readonly scoringFormat: FantasyFootballScoringFormat;
  readonly status: FantasyFootballLeagueStatus;
  readonly seasonYear: number;
}
