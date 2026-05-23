import { NextResponse } from "next/server";
import { getNovaPredictDatabaseClient } from "@/lib/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  const db = getNovaPredictDatabaseClient();
  if (!db) {
    return NextResponse.json({ ok: false, database: "missing DATABASE_URL" }, { status: 503 });
  }

  try {
    const result = await db.execute(sql`SELECT COUNT(*)::int AS count FROM player_projections`);
    const count = Number((result.rows?.[0] as { count?: number })?.count ?? 0);
    return NextResponse.json({ ok: true, service: "novapredict", projections: count });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
