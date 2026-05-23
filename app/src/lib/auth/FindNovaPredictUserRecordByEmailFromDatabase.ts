/*
  FindNovaPredictUserRecordByEmailFromDatabase.ts
  -----------------------------------------------
  Loads user row by normalized email for sign-in verification.
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export interface NovaPredictUserCredentialRecord {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
}

export async function FindNovaPredictUserRecordByEmailFromDatabase(
  normalizedEmail: string,
): Promise<NovaPredictUserCredentialRecord | null> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    throw new Error("Database unavailable");
  }

  const result = await databaseClient.execute(sql`
    SELECT id, email, password_hash, display_name
    FROM novapredict_users
    WHERE lower(email) = ${normalizedEmail}
    LIMIT 1
  `);

  const row = result.rows?.[0] as
    | { id: string; email: string; password_hash: string; display_name: string | null }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
  };
}
