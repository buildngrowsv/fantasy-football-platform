/*
  InsertNovaPredictUserRecordIntoDatabase.ts
  -----------------------------------------
  Creates a new email/password user row in novapredict_users.

  Email is stored normalized (lowercase) at insert time so sign-in lookup is stable.
  Returns null when email already exists (unique constraint).
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export interface NovaPredictUserInsertPayload {
  email: string;
  passwordHash: string;
  displayName: string | null;
}

export async function InsertNovaPredictUserRecordIntoDatabase(
  payload: NovaPredictUserInsertPayload,
): Promise<{ id: string; email: string; displayName: string | null } | null> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    throw new Error("Database unavailable");
  }

  try {
    const result = await databaseClient.execute(sql`
      INSERT INTO novapredict_users (email, password_hash, display_name)
      VALUES (${payload.email}, ${payload.passwordHash}, ${payload.displayName})
      RETURNING id, email, display_name
    `);

    const row = result.rows?.[0] as { id: string; email: string; display_name: string | null } | undefined;
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
    };
  } catch (error) {
    const message = String(error);
    if (message.includes("unique") || message.includes("duplicate")) {
      return null;
    }
    throw error;
  }
}
