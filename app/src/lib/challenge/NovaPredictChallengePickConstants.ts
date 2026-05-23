/*
  NovaPredictChallengePickConstants.ts
  ------------------------------------
  Override reason codes from Master Spec Challenge the Model — short list users pick in 2 seconds.
*/

export const NOVA_PREDICT_CHALLENGE_OVERRIDE_REASON_OPTIONS = [
  { value: "vegas_line_moved", label: "Vegas line moved late" },
  { value: "injury_report", label: "Injury report read" },
  { value: "historical_pattern", label: "Historical pattern" },
  { value: "matchup_read", label: "Matchup read" },
  { value: "gut_other", label: "Gut / other" },
] as const;

export type NovaPredictChallengeOverrideReasonCode =
  (typeof NOVA_PREDICT_CHALLENGE_OVERRIDE_REASON_OPTIONS)[number]["value"];

export type NovaPredictChallengePickType = "agree" | "override";

/** Master Spec: picks lock 90 minutes before the player's game kickoff. */
export const NOVA_PREDICT_CHALLENGE_LOCK_MINUTES_BEFORE_KICKOFF = 90;

/** Minimum picks required for a week to count on the Challenge scoreboard. */
export const NOVA_PREDICT_CHALLENGE_MINIMUM_PICKS_FOR_SCORED_WEEK = 5;

export type NovaPredictChallengePickScoreStatus = "pending" | "scored";
