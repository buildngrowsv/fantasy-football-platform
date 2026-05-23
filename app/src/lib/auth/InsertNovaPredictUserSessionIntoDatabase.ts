/*
  InsertNovaPredictUserSessionIntoDatabase.ts
  -------------------------------------------
  Persists opaque session token with expiry for cookie-based auth.
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export async function InsertNovaPredictUserSessionIntoDatabase(
  sessionToken: string,
  userId: string,
  expiresAt: Date,
): Promise<void> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    throw new Error("Database unavailable");
  }

  await databaseClient.execute(sql`
    INSERT INTO novapredict_user_sessions (id, user_id, expires_at)
    VALUES (${sessionToken}, ${userId}, ${expiresAt.toISOString()})
  `);
}
