/*
  DeleteNovaPredictUserSessionByTokenFromDatabase.ts
  --------------------------------------------------
  Removes session on sign-out or when validating expired tokens.
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export async function DeleteNovaPredictUserSessionByTokenFromDatabase(sessionToken: string): Promise<void> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return;
  }

  await databaseClient.execute(sql`
    DELETE FROM novapredict_user_sessions
    WHERE id = ${sessionToken}
  `);
}
