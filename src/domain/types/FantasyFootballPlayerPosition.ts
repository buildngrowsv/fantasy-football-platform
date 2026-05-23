/**
 * FantasyFootballPlayerPosition
 *
 * Canonical roster positions used across the platform for lineup validation,
 * draft board filtering, and waiver wire eligibility checks.
 *
 * We mirror standard NFL fantasy designations (QB, RB, WR, TE, K, DEF) plus
 * flex and bench slots because most commissioner tools expect this vocabulary.
 * Keeping positions in one enum prevents string drift between draft UI,
 * roster screens, and future API adapters (Sleeper, ESPN, Yahoo).
 */
export enum FantasyFootballPlayerPosition {
  Quarterback = "QB",
  RunningBack = "RB",
  WideReceiver = "WR",
  TightEnd = "TE",
  Kicker = "K",
  Defense = "DEF",
  Flex = "FLEX",
  Bench = "BN",
}
