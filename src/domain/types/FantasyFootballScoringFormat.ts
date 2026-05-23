/**
 * FantasyFootballScoringFormat
 *
 * Describes how fantasy points are calculated for a league.
 * Commissioners pick one format at league creation; all scoring engines
 * branch on this value when projecting or tallying weekly results.
 */
export enum FantasyFootballScoringFormat {
  Standard = "standard",
  HalfPointPerReception = "half_ppr",
  PointPerReception = "ppr",
}
