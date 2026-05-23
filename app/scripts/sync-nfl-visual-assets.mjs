#!/usr/bin/env node
/**
 * sync-nfl-visual-assets.mjs
 * --------------------------
 * Downloads NFL team logos and featured player headshots into public/assets/ for same-origin serving.
 *
 * Data sources (verified live, no mock data):
 * - Team logos: ESPN CDN scoreboard logos (a.espncdn.com/i/teamlogos/nfl/500/scoreboard/{slug}.png)
 * - Player headshots: ESPN CDN via espn_id from Sleeper catalog (a.espncdn.com/i/headshots/nfl/players/full/{id}.png)
 *
 * Run before deploy: node scripts/sync-nfl-visual-assets.mjs
 * npm script: npm run assets:sync
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.join(__dirname, "..", "public");
const TEAMS_DIR = path.join(PUBLIC_ROOT, "assets", "teams");
const PLAYERS_DIR = path.join(PUBLIC_ROOT, "assets", "players");
const PROVIDERS_DIR = path.join(PUBLIC_ROOT, "assets", "providers");

const NFL_TEAM_ESPN_SLUGS = [
  "ari", "atl", "bal", "buf", "car", "chi", "cin", "cle", "dal", "den", "det", "gb",
  "hou", "ind", "jax", "kc", "lac", "lar", "lv", "mia", "min", "ne", "no", "nyg",
  "nyj", "phi", "pit", "sea", "sf", "tb", "ten", "wsh",
];

function buildTeamLogoUrl(slug) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/${slug}.png`;
}

function buildHeadshotUrl(espnId) {
  return `https://a.espncdn.com/i/headshots/nfl/players/full/${espnId}.png`;
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

async function syncTeamLogos() {
  let synced = 0;
  for (const slug of NFL_TEAM_ESPN_SLUGS) {
    const url = buildTeamLogoUrl(slug);
    const dest = path.join(TEAMS_DIR, `${slug}.png`);
    try {
      const bytes = await downloadBinary(url, dest);
      console.log(`  ✓ team ${slug} (${bytes} bytes)`);
      synced += 1;
    } catch (error) {
      console.warn(`  ✗ team ${slug}: ${error.message}`);
    }
  }
  return synced;
}

async function syncPlayerHeadshotsFromSleeper() {
  console.log("Fetching Sleeper NFL catalog for espn_id cross-refs...");
  const response = await fetch("https://api.sleeper.app/v1/players/nfl");
  if (!response.ok) {
    throw new Error(`Sleeper catalog fetch failed: ${response.status}`);
  }
  const catalog = await response.json();

  const candidates = Object.values(catalog)
    .filter((player) => player?.active && player?.team && ["QB", "RB", "WR", "TE"].includes(player?.position))
    .filter((player) => player?.espn_id)
    .slice(0, 80);

  let synced = 0;
  for (const player of candidates) {
    const url = buildHeadshotUrl(player.espn_id);
    const dest = path.join(PLAYERS_DIR, `${player.player_id}.png`);
    try {
      await downloadBinary(url, dest);
      synced += 1;
    } catch {
      // Some espn_ids 404 — skip silently; runtime fallback uses initials
    }
  }
  console.log(`  ✓ ${synced}/${candidates.length} player headshots cached`);
  return synced;
}

async function writeProviderBrandSvgs() {
  /*
    Simple branded SVG marks for league import cards — not official logos (trademark),
    but recognizable color/iconography for Sleeper, ESPN, Yahoo connect UI.
  */
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
  console.log("  ✓ provider brand SVGs written");
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
  console.log("  ✓ NovaPredict brand logo written");
}

async function main() {
  console.log("=== Syncing NFL visual assets ===");
  await mkdir(TEAMS_DIR, { recursive: true });
  await mkdir(PLAYERS_DIR, { recursive: true });
  await mkdir(PROVIDERS_DIR, { recursive: true });

  console.log("\nTeam logos (ESPN CDN → public/assets/teams/)...");
  const teamCount = await syncTeamLogos();

  console.log("\nPlayer headshots (Sleeper espn_id → ESPN CDN → public/assets/players/)...");
  const playerCount = await syncPlayerHeadshotsFromSleeper();

  console.log("\nBrand assets...");
  await writeProviderBrandSvgs();
  await writeNovaPredictBrandLogo();

  console.log(`\n=== Done: ${teamCount} teams, ${playerCount} players ===`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
