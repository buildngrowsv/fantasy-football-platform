import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** NFL players synced from Sleeper API — stable IDs for league import mapping. */
export const playersTable = pgTable("players", {
  id: text("id").primaryKey(),
  sleeperId: text("sleeper_id").notNull(),
  fullName: text("full_name").notNull(),
  position: text("position").notNull(),
  team: text("team"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/** Weekly projection outputs from the deterministic engine (Vegas + Nova blend). */
export const playerProjectionsTable = pgTable("player_projections", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: text("player_id").notNull(),
  playerName: text("player_name").notNull(),
  position: text("position").notNull(),
  team: text("team").notNull(),
  opponent: text("opponent").notNull(),
  matchupLabel: text("matchup_label").notNull(),
  season: integer("season").notNull(),
  week: integer("week").notNull(),
  vegasPpr: numeric("vegas_ppr", { precision: 6, scale: 2 }).notNull(),
  novaPpr: numeric("nova_ppr", { precision: 6, scale: 2 }).notNull(),
  boomProbability: numeric("boom_probability", { precision: 5, scale: 2 }).notNull(),
  bustProbability: numeric("bust_probability", { precision: 5, scale: 2 }).notNull(),
  moveType: text("move_type").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const platformMetricsTable = pgTable("platform_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  seasonAccuracy: numeric("season_accuracy", { precision: 5, scale: 2 }).notNull(),
  sharpHitRate: numeric("sharp_hit_rate", { precision: 5, scale: 2 }).notNull(),
  monteCarloRuns: integer("monte_carlo_runs").notNull(),
  publishedRecordRate: numeric("published_record_rate", { precision: 5, scale: 2 }).notNull(),
});

export const accountabilityCallsTable = pgTable("accountability_calls", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerName: text("player_name").notNull(),
  position: text("position").notNull(),
  team: text("team").notNull(),
  projection: numeric("projection", { precision: 6, scale: 2 }).notNull(),
  actual: numeric("actual", { precision: 6, scale: 2 }).notNull(),
  classification: text("classification").notNull(),
  diagnosis: text("diagnosis").notNull(),
  week: integer("week").notNull(),
});

export const expertComparisonsTable = pgTable("expert_comparisons", {
  id: uuid("id").defaultRandom().primaryKey(),
  analystName: text("analyst_name").notNull(),
  source: text("source").notNull(),
  weeklyAccuracy: numeric("weekly_accuracy", { precision: 5, scale: 2 }).notNull(),
  seasonAccuracy: numeric("season_accuracy", { precision: 5, scale: 2 }).notNull(),
  seasonMae: numeric("season_mae", { precision: 5, scale: 2 }).notNull(),
});

export const signalWeightsTable = pgTable("signal_weights", {
  id: uuid("id").defaultRandom().primaryKey(),
  signalName: text("signal_name").notNull(),
  weightMultiplier: numeric("weight_multiplier", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull(),
});

export const leagueConnectionsTable = pgTable("league_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull(),
  externalLeagueId: text("external_league_id").notNull(),
  leagueName: text("league_name").notNull(),
});

export type FantasyFootballPlayerPosition = "QB" | "RB" | "WR" | "TE" | "K" | "DST" | "FLEX";

export interface NovaPredictPlayerRecord {
  id: string;
  fullName: string;
  position: FantasyFootballPlayerPosition;
  team: string;
  opponent: string;
  matchupLabel: string;
  vegasPprProjection: number;
  novaPprProjection: number;
  boomProbability: number;
  bustProbability: number;
  marketSignalLabel: string;
}

export interface NovaPredictPlatformMetricRecord {
  label: string;
  value: string;
  subLabel?: string;
  tone: "accent" | "cyan" | "amber" | "default";
}

export interface NovaPredictAccountabilityCallRecord {
  id: string;
  playerName: string;
  position: FantasyFootballPlayerPosition;
  team: string;
  projection: number;
  actual: number;
  classification: "correct" | "miss" | "variance";
  diagnosis: string;
}

export interface NovaPredictExpertComparisonRecord {
  id: string;
  analystName: string;
  source: string;
  weeklyAccuracy: number;
  seasonAccuracy: number;
  seasonMae: number;
}

export interface NovaPredictSignalWeightRecord {
  id: string;
  signalName: string;
  weightMultiplier: number;
  status: "active" | "suppressed" | "experimental";
}

export interface NovaPredictLeagueImportProviderRecord {
  provider: "Sleeper" | "ESPN" | "Yahoo";
  connectedLeagueCount: number;
  statusText: string;
}
