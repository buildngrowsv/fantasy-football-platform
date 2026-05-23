#!/usr/bin/env node
/** Syncs NEXT_PUBLIC_* vars from wrangler.jsonc into .env.production before OpenNext build. */
import fs from "node:fs";
import path from "node:path";

const wranglerPath = path.join(process.cwd(), "wrangler.jsonc");
const outputPath = path.join(process.cwd(), ".env.production");
const raw = fs.readFileSync(wranglerPath, "utf8");
const varsMatch = raw.match(/"vars"\s*:\s*\{([\s\S]*?)\n\s*\}/);
if (!varsMatch) {
  console.log("No vars block in wrangler.jsonc");
  process.exit(0);
}

const lines = [`# generated from wrangler.jsonc`, ``];
for (const line of varsMatch[1].split("\n")) {
  const match = line.match(/"([A-Z0-9_]+)"\s*:\s*"([^"]*)"/);
  if (match) lines.push(`${match[1]}=${match[2]}`);
}

fs.writeFileSync(outputPath, lines.join("\n") + "\n");
console.log(`Wrote ${outputPath}`);
