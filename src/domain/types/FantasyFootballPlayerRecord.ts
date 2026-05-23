import { FantasyFootballPlayerPosition } from "@/domain/types/FantasyFootballPlayerPosition";

/**
 * FantasyFootballPlayerRecord
 *
 * Minimal player shape the UI and services share. Real stats and names
 * will arrive from external NFL data providers; this type defines the
 * contract so adapters can plug in without refactoring screens.
 */
export interface FantasyFootballPlayerRecord {
  readonly externalPlayerId: string;
  readonly displayName: string;
  readonly nflTeamAbbreviation: string;
  readonly primaryPosition: FantasyFootballPlayerPosition;
  readonly isActive: boolean;
}
