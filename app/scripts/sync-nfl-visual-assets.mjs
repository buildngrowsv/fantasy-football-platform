#!/usr/bin/env node
/**
 * sync-nfl-visual-assets.mjs
 * --------------------------
 * Full NFL visual asset pipeline for NovaPredict:
 *
 * 1. Team logos — all 32 NFL teams from ESPN CDN → public/assets/teams/
 * 2. Player headshots — ALL ESPN roster athletes with NFL headshots (~2k+)
 *    → public/assets/players/by-espn/{espnAthleteId}.png
 * 3. Sleeper crosswalk — match Sleeper player_id to ESPN athletes via espn_id OR name+team
 * 4. Manifest — src/generated/nfl-player-headshot-manifest.json for runtime lookups
 *
 * Data sources (verified live, no mock data):
 * - ESPN teams/rosters: site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{id}/roster
 * - Sleeper catalog: api.sleeper.app/v1/players/nfl
 * - ESPN headshots: a.espncdn.com/i/headshots/nfl/players/full/{espnAthleteId}.png
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, "..");
const PUBLIC_ROOT = path.join(APP_ROOT, "public");
const GENERATED_ROOT = path.join(APP_ROOT, "src", "generated");
const TEAMS_DIR = path.join(PUBLIC_ROOT, "assets", "teams");
const PLAYERS_BY_ESPN_DIR = path.join(PUBLIC_ROOT, "assets", "players", "by-espn");
const PROVIDERS_DIR = path.join(PUBLIC_ROOT, "assets", "providers");
const MANIFEST_PATH = path.join(GENERATED_ROOT, "nfl-player-headshot-manifest.json");

const NFL_TEAM_ESPN_SLUGS = [
  "ari", "atl", "bal", "buf", "car", "chi", "cin", "cle", "dal", "den", "det", "gb",
  "hou", "ind", "jax", "kc", "lac", "lar", "lv", "mia", "min", "ne", "no", "nyg",
  "nyj", "phi", "pit", "sea", "sf", "tb", "ten", "wsh",
];

const ESPN_TEAMS_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams?limit=32";
const SLEEPER_CATALOG_URL = "https://api.sleeper.app/v1/players/nfl";
const DOWNLOAD_CONCURRENCY = 24;

function buildTeamLogoUrl(slug) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/${slug}.png`;
}

function buildNflHeadshotUrl(espnAthleteId) {
  return `https://a.espncdn.com/i/headshots/nfl/players/full/${espnAthleteId}.png`;
}

function normalizePlayerName(fullName) {
  return String(fullName || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/['']/g, "")
    .replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildNameTeamKey(fullName, teamAbbreviation) {
  return `${normalizePlayerName(fullName)}|${String(teamAbbreviation || "").toUpperCase()}`;
}

const TEAM_ALIAS_GROUPS = [["WAS", "WSH"]];

function expandTeamAbbreviationAliases(teamAbbreviation) {
  const normalizedTeam = String(teamAbbreviation || "").toUpperCase();
  for (const aliasGroup of TEAM_ALIAS_GROUPS) {
    if (aliasGroup.includes(normalizedTeam)) {
      return aliasGroup;
    }
  }
  return [normalizedTeam];
}

async function downloadBinary(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destPath, buffer);
  return buffer.length;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function runConcurrent(items, worker, concurrency) {
  let index = 0;
  const results = [];

  async function runner() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => runner()));
  return results;
}

async function syncTeamLogos() {
  let synced = 0;
  for (const slug of NFL_TEAM_ESPN_SLUGS) {
    const url = buildTeamLogoUrl(slug);
    const dest = path.join(TEAMS_DIR, `${slug}.png`);
    try {
      await downloadBinary(url, dest);
      synced += 1;
    } catch (error) {
      console.warn(`  ✗ team ${slug}: ${error.message}`);
    }
  }
  console.log(`  ✓ ${synced}/${NFL_TEAM_ESPN_SLUGS.length} team logos`);
  return synced;
}

async function fetchAllEspnRosterAthletes() {
  console.log("Fetching ESPN NFL team list...");
  const teamsPayload = await fetchJson(ESPN_TEAMS_URL);
  const teamEntries = teamsPayload?.sports?.[0]?.leagues?.[0]?.teams ?? [];

  const espnAthletesById = new Map();

  for (const teamEntry of teamEntries) {
    const team = teamEntry?.team;
    if (!team?.id) continue;

    const teamAbbreviation = team.abbreviation;
    const rosterUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team.id}/roster`;

    let rosterPayload;
    try {
      rosterPayload = await fetchJson(rosterUrl);
    } catch (error) {
      console.warn(`  ✗ roster ${teamAbbreviation}: ${error.message}`);
      continue;
    }

    for (const positionGroup of rosterPayload?.athletes ?? []) {
      for (const athlete of positionGroup?.items ?? []) {
        const espnAthleteId = String(athlete?.id ?? "").trim();
        if (!espnAthleteId) continue;

        const headshotHref = athlete?.headshot?.href ?? "";
        const nflHeadshotUrl = headshotHref.includes("/nfl/players/")
          ? headshotHref
          : buildNflHeadshotUrl(espnAthleteId);

        espnAthletesById.set(espnAthleteId, {
          espnAthleteId,
          fullName: athlete?.displayName ?? athlete?.fullName ?? "Unknown Player",
          normalizedName: normalizePlayerName(athlete?.displayName ?? athlete?.fullName ?? ""),
          team: teamAbbreviation,
          position: athlete?.position?.abbreviation ?? positionGroup?.position ?? null,
          headshotUrl: nflHeadshotUrl,
          localHeadshotPath: `/assets/players/by-espn/${espnAthleteId}.png`,
          sleeperPlayerId: null,
        });
      }
    }

    process.stdout.write(`  · ${teamAbbreviation} `);
  }

  console.log(`\n  ✓ ${espnAthletesById.size} ESPN roster athletes indexed`);
  return espnAthletesById;
}

async function crosswalkSleeperPlayers(espnAthletesById) {
  console.log("Crosswalking Sleeper catalog → ESPN athletes...");
  const catalog = await fetchJson(SLEEPER_CATALOG_URL);

  const espnByNameTeam = new Map();
  for (const record of espnAthletesById.values()) {
    for (const teamVariant of expandTeamAbbreviationAliases(record.team)) {
      espnByNameTeam.set(buildNameTeamKey(record.fullName, teamVariant), record);
    }
  }

  let matched = 0;

  for (const sleeperPlayer of Object.values(catalog)) {
    if (!sleeperPlayer?.active || !sleeperPlayer?.team) continue;
    if (!["QB", "RB", "WR", "TE"].includes(sleeperPlayer?.position)) continue;

    const sleeperPlayerId = String(sleeperPlayer.player_id);
    let espnRecord = null;

    if (sleeperPlayer.espn_id) {
      espnRecord = espnAthletesById.get(String(sleeperPlayer.espn_id)) ?? null;
    }

    if (!espnRecord) {
      const sleeperName = sleeperPlayer.full_name ?? `${sleeperPlayer.first_name ?? ""} ${sleeperPlayer.last_name ?? ""}`.trim();
      espnRecord = espnByNameTeam.get(buildNameTeamKey(sleeperName, sleeperPlayer.team)) ?? null;
    }

    if (espnRecord) {
      espnRecord.sleeperPlayerId = sleeperPlayerId;
      matched += 1;
    }
  }

  console.log(`  ✓ ${matched} Sleeper fantasy players matched to ESPN headshots`);
  return matched;
}

async function downloadFantasyMatchedHeadshots(espnAthletesById) {
  const downloadHeadshots = process.env.SKIP_HEADSHOT_DOWNLOAD !== "1";
  const records = [...espnAthletesById.values()].filter((record) => record.sleeperPlayerId);

  await rm(PLAYERS_BY_ESPN_DIR, { recursive: true, force: true });
  await mkdir(PLAYERS_BY_ESPN_DIR, { recursive: true });

  if (!downloadHeadshots) {
    console.log(`  ↷ Skipping download (SKIP_HEADSHOT_DOWNLOAD=1). Manifest CDN URLs cover all ${espnAthletesById.size} athletes.`);
    return 0;
  }

  console.log(`Downloading ${records.length} fantasy-matched headshots (concurrency ${DOWNLOAD_CONCURRENCY})...`);
  console.log(`  (Full manifest includes ${espnAthletesById.size} ESPN athletes — runtime uses CDN URLs for all)`);

  let downloaded = 0;
  let failed = 0;

  await runConcurrent(
    records,
    async (record) => {
      const dest = path.join(PLAYERS_BY_ESPN_DIR, `${record.espnAthleteId}.png`);
      try {
        await downloadBinary(record.headshotUrl, dest);
        downloaded += 1;
      } catch {
        failed += 1;
      }
    },
    DOWNLOAD_CONCURRENCY,
  );

  console.log(`  ✓ ${downloaded} downloaded, ${failed} failed (CDN 404 or network)`);
  return downloaded;
}

function buildManifest(espnAthletesById, sleeperMatchedCount, downloadedHeadshotCount) {
  const bySleeperId = {};
  const byEspnAthleteId = {};
  const byNameTeamKey = {};

  for (const record of espnAthletesById.values()) {
    byEspnAthleteId[record.espnAthleteId] = record;
    for (const teamVariant of expandTeamAbbreviationAliases(record.team)) {
      byNameTeamKey[buildNameTeamKey(record.fullName, teamVariant)] = record;
    }
    if (record.sleeperPlayerId) {
      bySleeperId[record.sleeperPlayerId] = record;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    espnRosterAthleteCount: espnAthletesById.size,
    sleeperMatchedCount,
    downloadedHeadshotCount,
    bySleeperId,
    byEspnAthleteId,
    byNameTeamKey,
  };
}

async function writeProviderBrandSvgs() {
  const sleeperSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#1a1f2e"/>
  <circle cx="60" cy="60" r="32" stroke="#00d28c" stroke-width="6"/>
  <path d="M60 38v44M38 60h44" stroke="#00d28c" stroke-width="6" stroke-linecap="round"/>
  <text x="60" y="108" text-anchor="middle" fill="#5a6a84" font-family="system-ui" font-size="11" font-weight="700">SLEEPER</text>
</svg>`;

  const espnSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#cc0000"/>
  <text x="60" y="68" text-anchor="middle" fill="#ffffff" font-family="system-ui" font-size="28" font-weight="800" letter-spacing="-1">ESPN</text>
  <text x="60" y="92" text-anchor="middle" fill="#ffcccc" font-family="system-ui" font-size="10" font-weight="600">FANTASY</text>
</svg>`;

  const yahooSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#6001d2"/>
  <text x="60" y="62" text-anchor="middle" fill="#ffffff" font-family="system-ui" font-size="22" font-weight="800">Y!</text>
  <text x="60" y="88" text-anchor="middle" fill="#d4b8ff" font-family="system-ui" font-size="10" font-weight="600">FANTASY</text>
</svg>`;

  await writeFile(path.join(PROVIDERS_DIR, "sleeper.svg"), sleeperSvg);
  await writeFile(path.join(PROVIDERS_DIR, "espn.svg"), espnSvg);
  await writeFile(path.join(PROVIDERS_DIR, "yahoo.svg"), yahooSvg);
}

async function writeNovaPredictBrandLogo() {
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48" fill="none">
  <defs>
    <linearGradient id="npGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00d28c"/>
      <stop offset="1" stop-color="#00b4d8"/>
    </linearGradient>
  </defs>
  <rect x="0" y="4" width="40" height="40" rx="10" fill="url(#npGrad)" opacity="0.15"/>
  <path d="M12 32L20 16L28 26L36 14" stroke="url(#npGrad)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="36" cy="14" r="3" fill="#00d28c"/>
  <text x="52" y="32" fill="#f0f4ff" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" letter-spacing="-0.5">Nova</text>
  <text x="108" y="32" fill="#00d28c" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" letter-spacing="-0.5">Predict</text>
</svg>`;
  await mkdir(path.join(PUBLIC_ROOT, "assets", "brand"), { recursive: true });
  await writeFile(path.join(PUBLIC_ROOT, "assets", "brand", "novapredict-logo.svg"), logoSvg);
}

async function main() {
  console.log("=== Syncing FULL NFL visual asset library ===\n");
  await mkdir(TEAMS_DIR, { recursive: true });
  await mkdir(PLAYERS_BY_ESPN_DIR, { recursive: true });
  await mkdir(PROVIDERS_DIR, { recursive: true });
  await mkdir(GENERATED_ROOT, { recursive: true });

  console.log("Team logos...");
  const teamCount = await syncTeamLogos();

  console.log("\nESPN roster athletes...");
  const espnAthletesById = await fetchAllEspnRosterAthletes();
  const sleeperMatchedCount = await crosswalkSleeperPlayers(espnAthletesById);

  console.log("\nPlayer headshots...");
  const downloadedHeadshotCount = await downloadFantasyMatchedHeadshots(espnAthletesById);

  const manifest = buildManifest(espnAthletesById, sleeperMatchedCount, downloadedHeadshotCount);
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nManifest written: ${MANIFEST_PATH}`);
  console.log(`  · ${manifest.espnRosterAthleteCount} ESPN athletes`);
  console.log(`  · ${manifest.sleeperMatchedCount} Sleeper matches`);
  console.log(`  · ${Object.keys(manifest.byNameTeamKey).length} name+team keys`);

  console.log("\nBrand assets...");
  await writeProviderBrandSvgs();
  await writeNovaPredictBrandLogo();

  console.log(`\n=== Done: ${teamCount} teams, ${downloadedHeadshotCount} headshots ===`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
