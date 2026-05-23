/**
 * StandardFantasyFootballScoringRules
 *
 * Industry-standard non-PPR point values used as the default commissioner
 * preset. Values match widely published scoring charts (passing TD = 4,
 * rushing/receiving TD = 6, etc.) so migrated leagues feel familiar.
 *
 * These are configuration constants, not fabricated player statistics.
 */
export const StandardFantasyFootballScoringRules = {
  passingYardsPerPoint: 25,
  passingTouchdownPoints: 4,
  interceptionPenaltyPoints: -2,
  rushingYardsPerPoint: 10,
  rushingTouchdownPoints: 6,
  receivingYardsPerPoint: 10,
  receivingTouchdownPoints: 6,
  receptionPoints: 0,
  fumbleLostPenaltyPoints: -2,
  fieldGoalMadePoints: 3,
  extraPointMadePoints: 1,
} as const;
