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
  /** Cross-reference ID from Sleeper payload — used to build ESPN headshot CDN URLs. */
  espnAthleteId: text("espn_athlete_id"),
  /** Precomputed headshot URL for query convenience; mirrors ESPN CDN pattern. */
  headshotUrl: text("headshot_url"),
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

/** Email/password accounts for Challenge the Model, league import, and subscriptions. */
export const novapredictUsersTable = pgTable("novapredict_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Opaque session tokens stored server-side — HTTP-only cookie holds session id only. */
export const novapredictUserSessionsTable = pgTable("novapredict_user_sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => novapredictUsersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export interface NovaPredictAuthenticatedUserRecord {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
}

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
  /** ESPN athlete ID from Sleeper cross-ref — drives headshot CDN URL. */
  espnAthleteId?: string | null;
  headshotUrl?: string | null;
  localHeadshotPath?: string | null;
  teamLogoUrl?: string | null;
  teamLogoLocalPath?: string | null;
  opponentLogoUrl?: string | null;
  opponentLogoLocalPath?: string | null;
  teamPrimaryColor?: string | null;
  opponentPrimaryColor?: string | null;
  initials: string;
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
  week: number;
}

export interface NovaPredictAccountabilitySummaryRecord {
  totalCalls: number;
  correctCount: number;
  missCount: number;
  varianceCount: number;
  hitRatePercent: number;
  meanAbsoluteError: number;
  seasonLabel: string;
  availableWeeks: number[];
}

export interface NovaPredictLeagueConnectionRecord {
  id: string;
  provider: "Sleeper" | "ESPN" | "Yahoo";
  externalLeagueId: string;
  leagueName: string;
  season: number;
  sleeperUsername: string | null;
  connectedAt: Date;
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
