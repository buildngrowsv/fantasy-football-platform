/**
 * Database client for NovaPredict.
 *
 * Local dev + seed scripts use DATABASE_URL from .env.
 * Cloudflare Worker production uses Hyperdrive binding (pooled Neon).
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

type NovaPredictDatabaseClient = ReturnType<typeof drizzle> | null;

let cachedDatabaseClient: NovaPredictDatabaseClient = null;

function resolveDatabaseConnectionString(): string | null {
  return process.env.DATABASE_URL ?? null;
}

export function getNovaPredictDatabaseClient(): NovaPredictDatabaseClient {
  if (cachedDatabaseClient) {
    return cachedDatabaseClient;
  }

  const databaseUrl = resolveDatabaseConnectionString();
  if (!databaseUrl) {
    return null;
  }

  const neonSql = neon(databaseUrl);
  cachedDatabaseClient = drizzle({ client: neonSql });
  return cachedDatabaseClient;
}
