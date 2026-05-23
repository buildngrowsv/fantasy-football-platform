import { NextResponse } from "next/server";
import { getNovaPredictDatabaseClient } from "@/lib/db/client";
import { sql } from "drizzle-orm";

/*
  Pipeline status endpoint for admin/ops — surfaces ingest health without exposing secrets.
  Reads pipeline_run_summaries and recent ingest_runs written by the Python orchestrator.
*/
export async function GET() {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return NextResponse.json({ ok: false, database: "missing DATABASE_URL" }, { status: 503 });
  }

  try {
    const latestRunResult = await databaseClient.execute(sql`
      SELECT orchestrator_name, status, started_at, finished_at, stage_results, error_message
      FROM pipeline_run_summaries
      ORDER BY started_at DESC
      LIMIT 1
    `);

    const ingestHealthResult = await databaseClient.execute(sql`
      SELECT job_name, source_provider, status, row_count, started_at, finished_at
      FROM ingest_runs
      ORDER BY started_at DESC
      LIMIT 12
    `);

    const countsResult = await databaseClient.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM players) AS players,
        (SELECT COUNT(*)::int FROM player_projections) AS projections,
        (SELECT COUNT(*)::int FROM player_weekly_actuals) AS weekly_actuals,
        (SELECT COUNT(*)::int FROM accountability_calls) AS accountability_calls
    `);

    const latestRun = latestRunResult.rows?.[0] ?? null;
    const counts = countsResult.rows?.[0] ?? {};

    return NextResponse.json({
      ok: true,
      service: "novapredict-pipeline",
      latestOrchestratorRun: latestRun,
      recentIngestRuns: ingestHealthResult.rows ?? [],
      tableCounts: counts,
      pendingApiKeys: {
        THE_ODDS_API_KEY: !process.env.THE_ODDS_API_KEY,
        SPORTSDATAIO_API_KEY: !process.env.SPORTSDATAIO_API_KEY,
        OPENWEATHERMAP_API_KEY: !process.env.OPENWEATHERMAP_API_KEY,
        PFF_API_KEY: !process.env.PFF_API_KEY,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
