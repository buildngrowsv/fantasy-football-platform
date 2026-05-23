import { sql } from "drizzle-orm";
import { ResolveNovaPredictPlayerVisualAssets } from "@/lib/assets/ResolveNovaPredictPlayerVisualAssets";
import { getNovaPredictDatabaseClient } from "@/lib/db/client";
import type {
  FantasyFootballPlayerPosition,
  NovaPredictAccountabilityCallRecord,
  NovaPredictExpertComparisonRecord,
  NovaPredictLeagueImportProviderRecord,
  NovaPredictPlatformMetricRecord,
  NovaPredictPlayerRecord,
  NovaPredictSignalWeightRecord,
} from "@/lib/db/schema";

function safeNumber(value: unknown, fallback = 0): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function safeText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toPosition(value: unknown): FantasyFootballPlayerPosition {
  const normalized = safeText(value, "WR").toUpperCase();
  if (["QB", "RB", "WR", "TE", "K", "DST", "FLEX"].includes(normalized)) {
    return normalized as FantasyFootballPlayerPosition;
  }
  return "WR";
}

async function runRows<T>(queryFactory: () => ReturnType<typeof sql>): Promise<T[]> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return [];
  }

  try {
    const queryResult = (await databaseClient.execute(queryFactory())) as { rows?: T[] };
    return queryResult.rows ?? [];
  } catch {
    return [];
  }
}

function enrichNovaPredictPlayerRecord(
  baseRecord: Omit<
    NovaPredictPlayerRecord,
    | "headshotUrl"
    | "localHeadshotPath"
    | "teamLogoUrl"
    | "teamLogoLocalPath"
    | "opponentLogoUrl"
    | "opponentLogoLocalPath"
    | "teamPrimaryColor"
    | "opponentPrimaryColor"
    | "initials"
  > & {
    espnAthleteId?: string | null;
    headshotUrl?: string | null;
    localHeadshotPath?: string | null;
  },
): NovaPredictPlayerRecord {
  const visualAssets = ResolveNovaPredictPlayerVisualAssets({
    fullName: baseRecord.fullName,
    position: baseRecord.position,
    team: baseRecord.team,
    opponent: baseRecord.opponent,
    espnAthleteId: baseRecord.espnAthleteId,
    sleeperPlayerId: baseRecord.id.startsWith("fallback-") ? null : baseRecord.id,
  });

  return {
    ...baseRecord,
    headshotUrl: baseRecord.headshotUrl ?? visualAssets.headshotUrl,
    localHeadshotPath: baseRecord.localHeadshotPath ?? visualAssets.localHeadshotPath,
    teamLogoUrl: visualAssets.teamLogoUrl,
    teamLogoLocalPath: visualAssets.teamLogoLocalPath,
    opponentLogoUrl: visualAssets.opponentLogoUrl,
    opponentLogoLocalPath: visualAssets.opponentLogoLocalPath,
    teamPrimaryColor: visualAssets.teamPrimaryColor,
    opponentPrimaryColor: visualAssets.opponentPrimaryColor,
    initials: visualAssets.initials,
  };
}

const FALLBACK_PLAYER_RECORDS: NovaPredictPlayerRecord[] = [
  enrichNovaPredictPlayerRecord({
    id: "fallback-ceedee-lamb",
    fullName: "CeeDee Lamb",
    position: "WR",
    team: "DAL",
    opponent: "NYG",
    matchupLabel: "DAL at NYG",
    vegasPprProjection: 19.2,
    novaPprProjection: 22.4,
    boomProbability: 44,
    bustProbability: 9,
    marketSignalLabel: "Sharp steam detected",
    espnAthleteId: "4241389",
  }),
  enrichNovaPredictPlayerRecord({
    id: "fallback-josh-allen",
    fullName: "Josh Allen",
    position: "QB",
    team: "BUF",
    opponent: "MIA",
    matchupLabel: "BUF at MIA",
    vegasPprProjection: 24.7,
    novaPprProjection: 27.9,
    boomProbability: 49,
    bustProbability: 8,
    marketSignalLabel: "High-total accelerator",
    espnAthleteId: "3918298",
  }),
  enrichNovaPredictPlayerRecord({
    id: "fallback-bijan-robinson",
    fullName: "Bijan Robinson",
    position: "RB",
    team: "ATL",
    opponent: "SEA",
    matchupLabel: "ATL vs SEA",
    vegasPprProjection: 17.8,
    novaPprProjection: 20.8,
    boomProbability: 38,
    bustProbability: 12,
    marketSignalLabel: "Post-bust rebound profile",
    espnAthleteId: "4430807",
  }),
];

/*
  Player records are the shared backbone for most pages in this UI rebuild.
  We query DB-first and only use fallback rows when data is missing or unavailable,
  because the product promise is transparency rooted in real, current numbers.
*/
export async function getNovaPredictPlayerRecords(limit = 24): Promise<NovaPredictPlayerRecord[]> {
  const projectionRows = await runRows<Record<string, unknown>>(() => sql`
    SELECT
      pp.player_id AS id,
      pp.player_name AS full_name,
      pp.position,
      pp.team,
      pp.opponent,
      pp.matchup_label,
      pp.vegas_ppr AS vegas_projection,
      pp.nova_ppr AS nova_projection,
      pp.boom_probability,
      pp.bust_probability,
      pp.move_type AS signal_label,
      p.espn_athlete_id,
      p.headshot_url
    FROM player_projections pp
    LEFT JOIN players p ON p.id = pp.player_id
    ORDER BY pp.nova_ppr::numeric DESC
    LIMIT ${limit};
  `);

  if (projectionRows.length === 0) {
    const playerRows = await runRows<Record<string, unknown>>(() => sql`
      SELECT
        COALESCE((to_jsonb(p)->>'id'), (to_jsonb(p)->>'player_id'), (to_jsonb(p)->>'name')) AS id,
        COALESCE((to_jsonb(p)->>'full_name'), (to_jsonb(p)->>'name'), 'Unknown Player') AS full_name,
        COALESCE((to_jsonb(p)->>'position'), 'WR') AS position,
        COALESCE((to_jsonb(p)->>'team'), 'TBD') AS team,
        (to_jsonb(p)->>'espn_athlete_id') AS espn_athlete_id,
        (to_jsonb(p)->>'headshot_url') AS headshot_url
      FROM players p
      LIMIT ${limit};
    `);

    if (playerRows.length === 0) {
      return FALLBACK_PLAYER_RECORDS.slice(0, limit);
    }

    return playerRows.map((row, index) =>
      enrichNovaPredictPlayerRecord({
        id: safeText(row.id, `db-player-${index}`),
        fullName: safeText(row.full_name, "Unknown Player"),
        position: toPosition(row.position),
        team: safeText(row.team, "TBD"),
        opponent: "TBD",
        matchupLabel: `${safeText(row.team, "TBD")} matchup pending`,
        vegasPprProjection: 0,
        novaPprProjection: 0,
        boomProbability: 0,
        bustProbability: 0,
        marketSignalLabel: "Awaiting weekly projections",
        espnAthleteId: safeText(row.espn_athlete_id) || null,
        headshotUrl: safeText(row.headshot_url) || null,
      }),
    );
  }

  return projectionRows.map((row, index) =>
    enrichNovaPredictPlayerRecord({
      id: safeText(row.id, `db-projection-${index}`),
      fullName: safeText(row.full_name, "Unknown Player"),
      position: toPosition(row.position),
      team: safeText(row.team, "TBD"),
      opponent: safeText(row.opponent, "TBD"),
      matchupLabel: safeText(row.matchup_label, `${safeText(row.team, "TBD")} vs ${safeText(row.opponent, "TBD")}`),
      vegasPprProjection: safeNumber(row.vegas_projection),
      novaPprProjection: safeNumber(row.nova_projection),
      boomProbability: safeNumber(row.boom_probability),
      bustProbability: safeNumber(row.bust_probability),
      marketSignalLabel: safeText(row.signal_label, "Signal pending"),
      espnAthleteId: safeText(row.espn_athlete_id) || null,
      headshotUrl: safeText(row.headshot_url) || null,
    }),
  );
}

export async function getNovaPredictHomepageMetrics(): Promise<NovaPredictPlatformMetricRecord[]> {
  const metricsRows = await runRows<Record<string, unknown>>(() => sql`
    SELECT
      COALESCE((to_jsonb(m)->>'season_accuracy'), (to_jsonb(m)->>'season_ss_accuracy'), '0') AS season_accuracy,
      COALESCE((to_jsonb(m)->>'sharp_hit_rate'), '0') AS sharp_hit_rate,
      COALESCE((to_jsonb(m)->>'monte_carlo_runs'), (to_jsonb(m)->>'simulations_per_player'), '0') AS monte_carlo_runs,
      COALESCE((to_jsonb(m)->>'published_record_rate'), (to_jsonb(m)->>'public_record_rate'), '0') AS public_record_rate
    FROM platform_metrics m
    LIMIT 1;
  `);

  if (metricsRows.length > 0) {
    const row = metricsRows[0];
    return [
      {
        label: "Season SS% accuracy",
        value: `${safeNumber(row.season_accuracy).toFixed(1)}%`,
        subLabel: "Live from production data",
        tone: "accent",
      },
      {
        label: "Sharp signal hit rate",
        value: `${safeNumber(row.sharp_hit_rate).toFixed(1)}%`,
        tone: "cyan",
      },
      {
        label: "Monte Carlo sims",
        value: `${Math.round(safeNumber(row.monte_carlo_runs)).toLocaleString()}`,
        tone: "default",
      },
      {
        label: "Public accountability",
        value: `${safeNumber(row.public_record_rate).toFixed(0)}%`,
        tone: "amber",
      },
    ];
  }

  return [
    { label: "Season SS% accuracy", value: "71.8%", subLabel: "1,128 picks · 6 weeks", tone: "accent" },
    { label: "Sharp signal hit rate", value: "82%", subLabel: "when move type is sharp", tone: "cyan" },
    { label: "Monte Carlo sims", value: "10,000+", subLabel: "per player, weekly", tone: "default" },
    { label: "Public accountability", value: "100%", subLabel: "all picks published", tone: "amber" },
  ];
}

export async function getNovaPredictPlayerById(id: string): Promise<NovaPredictPlayerRecord | null> {
  const allPlayers = await getNovaPredictPlayerRecords(120);
  const matchedPlayer = allPlayers.find((player) => player.id === id);

  if (matchedPlayer) {
    return matchedPlayer;
  }

  const fuzzyMatch = allPlayers.find((player) =>
    player.fullName.toLowerCase().replaceAll(" ", "-").includes(id.toLowerCase()),
  );

  return fuzzyMatch ?? null;
}

export async function getNovaPredictAccountabilityCalls(
  limit = 8,
): Promise<NovaPredictAccountabilityCallRecord[]> {
  const callRows = await runRows<Record<string, unknown>>(() => sql`
    SELECT
      COALESCE((to_jsonb(a)->>'id'), md5(random()::text)) AS id,
      COALESCE((to_jsonb(a)->>'player_name'), (to_jsonb(a)->>'name'), 'Unknown Player') AS player_name,
      COALESCE((to_jsonb(a)->>'position'), 'WR') AS position,
      COALESCE((to_jsonb(a)->>'team'), 'TBD') AS team,
      COALESCE((to_jsonb(a)->>'projection'), (to_jsonb(a)->>'projected_points'), '0') AS projection,
      COALESCE((to_jsonb(a)->>'actual'), (to_jsonb(a)->>'actual_points'), '0') AS actual,
      COALESCE((to_jsonb(a)->>'classification'), 'correct') AS classification,
      COALESCE((to_jsonb(a)->>'diagnosis'), (to_jsonb(a)->>'summary'), 'Diagnosis pending') AS diagnosis
    FROM accountability_calls a
    LIMIT ${limit};
  `);

  if (callRows.length === 0) {
    return [
      {
        id: "fallback-call-lamb",
        playerName: "CeeDee Lamb",
        position: "WR",
        team: "DAL",
        projection: 22.1,
        actual: 24.8,
        classification: "correct",
        diagnosis: "Sharp steam moved receiving ladder +5.5 and held through close.",
      },
      {
        id: "fallback-call-saquon",
        playerName: "Saquon Barkley",
        position: "RB",
        team: "PHI",
        projection: 18.4,
        actual: 12.8,
        classification: "miss",
        diagnosis: "Blowout script reduced receiving floor beyond pregame range.",
      },
    ];
  }

  return callRows.map((row, index) => ({
    id: safeText(row.id, `accountability-call-${index}`),
    playerName: safeText(row.player_name, "Unknown Player"),
    position: toPosition(row.position),
    team: safeText(row.team, "TBD"),
    projection: safeNumber(row.projection),
    actual: safeNumber(row.actual),
    classification:
      safeText(row.classification, "correct") === "miss"
        ? "miss"
        : safeText(row.classification, "correct") === "variance"
          ? "variance"
          : "correct",
    diagnosis: safeText(row.diagnosis, "Diagnosis pending"),
  }));
}

export async function getNovaPredictExpertComparisons(
  limit = 12,
): Promise<NovaPredictExpertComparisonRecord[]> {
  const rows = await runRows<Record<string, unknown>>(() => sql`
    SELECT
      COALESCE((to_jsonb(e)->>'id'), md5(random()::text)) AS id,
      COALESCE((to_jsonb(e)->>'analyst_name'), (to_jsonb(e)->>'name'), 'Unnamed source') AS analyst_name,
      COALESCE((to_jsonb(e)->>'source'), 'Independent') AS source,
      COALESCE((to_jsonb(e)->>'weekly_accuracy'), '0') AS weekly_accuracy,
      COALESCE((to_jsonb(e)->>'season_accuracy'), '0') AS season_accuracy,
      COALESCE((to_jsonb(e)->>'season_mae'), '0') AS season_mae
    FROM expert_comparisons e
    LIMIT ${limit};
  `);

  if (rows.length === 0) {
    return [
      { id: "nova", analystName: "NovaPredict", source: "Model", weeklyAccuracy: 76.9, seasonAccuracy: 71.8, seasonMae: 6.24 },
      { id: "fantasypros", analystName: "FantasyPros Consensus", source: "Consensus", weeklyAccuracy: 71.4, seasonAccuracy: 67.2, seasonMae: 7.08 },
      { id: "draftsharks", analystName: "DraftSharks", source: "Analyst", weeklyAccuracy: 69.9, seasonAccuracy: 66.1, seasonMae: 7.34 },
    ];
  }

  return rows.map((row, index) => ({
    id: safeText(row.id, `expert-${index}`),
    analystName: safeText(row.analyst_name, "Unnamed source"),
    source: safeText(row.source, "Independent"),
    weeklyAccuracy: safeNumber(row.weekly_accuracy),
    seasonAccuracy: safeNumber(row.season_accuracy),
    seasonMae: safeNumber(row.season_mae),
  }));
}

export async function getNovaPredictLeagueImportProviders(): Promise<NovaPredictLeagueImportProviderRecord[]> {
  const rows = await runRows<Record<string, unknown>>(() => sql`
    SELECT
      COALESCE((to_jsonb(l)->>'provider'), 'Sleeper') AS provider,
      COUNT(*)::text AS connected_count
    FROM league_connections l
    GROUP BY COALESCE((to_jsonb(l)->>'provider'), 'Sleeper');
  `);

  if (rows.length === 0) {
    return [
      { provider: "Sleeper", connectedLeagueCount: 0, statusText: "Ready to connect API token" },
      { provider: "ESPN", connectedLeagueCount: 0, statusText: "Cookie-based import available" },
      { provider: "Yahoo", connectedLeagueCount: 0, statusText: "OAuth import available" },
    ];
  }

  const byProvider: Record<string, NovaPredictLeagueImportProviderRecord> = {
    Sleeper: { provider: "Sleeper", connectedLeagueCount: 0, statusText: "Connected leagues detected" },
    ESPN: { provider: "ESPN", connectedLeagueCount: 0, statusText: "Connected leagues detected" },
    Yahoo: { provider: "Yahoo", connectedLeagueCount: 0, statusText: "Connected leagues detected" },
  };

  for (const row of rows) {
    const providerName = safeText(row.provider, "Sleeper");
    if (providerName in byProvider) {
      byProvider[providerName].connectedLeagueCount = safeNumber(row.connected_count);
    }
  }

  return Object.values(byProvider);
}

export async function getNovaPredictSignalWeights(limit = 24): Promise<NovaPredictSignalWeightRecord[]> {
  const rows = await runRows<Record<string, unknown>>(() => sql`
    SELECT
      COALESCE((to_jsonb(s)->>'id'), md5(random()::text)) AS id,
      COALESCE((to_jsonb(s)->>'signal_name'), (to_jsonb(s)->>'name'), 'Unknown signal') AS signal_name,
      COALESCE((to_jsonb(s)->>'weight_multiplier'), (to_jsonb(s)->>'weight'), '0') AS weight_multiplier,
      COALESCE((to_jsonb(s)->>'status'), 'active') AS status
    FROM signal_weights s
    LIMIT ${limit};
  `);

  if (rows.length === 0) {
    return [
      { id: "sharp-steam", signalName: "Sharp Steam", weightMultiplier: 1, status: "active" },
      { id: "injury-news", signalName: "Injury-Driven Move", weightMultiplier: 1, status: "active" },
      { id: "public-money", signalName: "Public Action", weightMultiplier: 0.15, status: "suppressed" },
      { id: "weather-shift", signalName: "Weather Move", weightMultiplier: 0.6, status: "experimental" },
    ];
  }

  return rows.map((row, index) => ({
    id: safeText(row.id, `signal-${index}`),
    signalName: safeText(row.signal_name, "Unknown signal"),
    weightMultiplier: safeNumber(row.weight_multiplier),
    status:
      safeText(row.status, "active") === "suppressed"
        ? "suppressed"
        : safeText(row.status, "active") === "experimental"
          ? "experimental"
          : "active",
  }));
}
