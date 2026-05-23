#!/usr/bin/env node
/**
 * Applies league import SQL migration (006) to Neon via DATABASE_URL.
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const sqlPath = join(repoRoot, "pipeline/sql/006_league_import_user_scope.sql");
const sqlText = readFileSync(sqlPath, "utf8");

const statements = sqlText
  .split(";")
  .map((chunk) => chunk.replace(/--[^\n]*/g, "").trim())
  .filter((chunk) => chunk.length > 0);

const sql = neon(databaseUrl);
for (const statement of statements) {
  await sql.query(statement);
}
console.log(`Applied league import migration (${statements.length} statements): pipeline/sql/006_league_import_user_scope.sql`);
