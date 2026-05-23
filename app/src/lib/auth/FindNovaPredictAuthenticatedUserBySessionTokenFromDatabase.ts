/*
  FindNovaPredictAuthenticatedUserBySessionTokenFromDatabase.ts
  -----------------------------------------------------------
  Validates session cookie and returns user profile if session is active.

  Called by: GET /api/auth/session, server components, protected routes.
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";
import type { NovaPredictAuthenticatedUserRecord } from "@/lib/db/schema";
import { DeleteNovaPredictUserSessionByTokenFromDatabase } from "@/lib/auth/DeleteNovaPredictUserSessionByTokenFromDatabase";

export async function FindNovaPredictAuthenticatedUserBySessionTokenFromDatabase(
  sessionToken: string,
): Promise<NovaPredictAuthenticatedUserRecord | null> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return null;
  }

  const result = await databaseClient.execute(sql`
    SELECT
      u.id,
      u.email,
      u.display_name,
      u.created_at,
      s.expires_at
    FROM novapredict_user_sessions s
    INNER JOIN novapredict_users u ON u.id = s.user_id
    WHERE s.id = ${sessionToken}
    LIMIT 1
  `);

  const row = result.rows?.[0] as
    | {
        id: string;
        email: string;
        display_name: string | null;
        created_at: string;
        expires_at: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  const expiresAt = new Date(row.expires_at);
  if (expiresAt.getTime() <= Date.now()) {
    await DeleteNovaPredictUserSessionByTokenFromDatabase(sessionToken);
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: new Date(row.created_at),
  };
}
