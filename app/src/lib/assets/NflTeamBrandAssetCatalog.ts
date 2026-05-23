/*
  NflTeamBrandAssetCatalog
  ------------------------
  Static NFL team metadata used across NovaPredict UI for logos, colors, and matchup strips.

  Why a local catalog instead of only runtime ESPN calls:
  - Pages render on Cloudflare Workers where we want zero extra API hops for team colors.
  - ESPN scoreboard logos use lowercase slug paths (e.g. "dal", "lar") — this map is the single source of truth.
  - Product polish: cards can tint borders/backgrounds with official team primary colors even when logos fail.

  Logo URLs point at ESPN CDN (verified live 2026-05-23). We also mirror logos into /public/assets/teams/
  via scripts/sync-nfl-visual-assets.mjs so deploys have local fallbacks on the same origin.
*/

export interface NflTeamBrandAssetRecord {
  abbreviation: string;
  city: string;
  name: string;
  espnSlug: string;
  primaryColor: string;
  alternateColor: string;
  logoUrl: string;
  localLogoPath: string;
}

export const NFL_TEAM_BRAND_ASSET_CATALOG: Record<string, NflTeamBrandAssetRecord> = {
  ARI: { abbreviation: "ARI", city: "Arizona", name: "Cardinals", espnSlug: "ari", primaryColor: "#97233F", alternateColor: "#000000", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/ari.png", localLogoPath: "/assets/teams/ari.png" },
  ATL: { abbreviation: "ATL", city: "Atlanta", name: "Falcons", espnSlug: "atl", primaryColor: "#A71930", alternateColor: "#000000", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/atl.png", localLogoPath: "/assets/teams/atl.png" },
  BAL: { abbreviation: "BAL", city: "Baltimore", name: "Ravens", espnSlug: "bal", primaryColor: "#241773", alternateColor: "#000000", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/bal.png", localLogoPath: "/assets/teams/bal.png" },
  BUF: { abbreviation: "BUF", city: "Buffalo", name: "Bills", espnSlug: "buf", primaryColor: "#00338D", alternateColor: "#C60C30", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/buf.png", localLogoPath: "/assets/teams/buf.png" },
  CAR: { abbreviation: "CAR", city: "Carolina", name: "Panthers", espnSlug: "car", primaryColor: "#0085CA", alternateColor: "#000000", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/car.png", localLogoPath: "/assets/teams/car.png" },
  CHI: { abbreviation: "CHI", city: "Chicago", name: "Bears", espnSlug: "chi", primaryColor: "#0B162A", alternateColor: "#C83803", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/chi.png", localLogoPath: "/assets/teams/chi.png" },
  CIN: { abbreviation: "CIN", city: "Cincinnati", name: "Bengals", espnSlug: "cin", primaryColor: "#FB4F14", alternateColor: "#000000", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/cin.png", localLogoPath: "/assets/teams/cin.png" },
  CLE: { abbreviation: "CLE", city: "Cleveland", name: "Browns", espnSlug: "cle", primaryColor: "#311D00", alternateColor: "#FF3C00", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/cle.png", localLogoPath: "/assets/teams/cle.png" },
  DAL: { abbreviation: "DAL", city: "Dallas", name: "Cowboys", espnSlug: "dal", primaryColor: "#003594", alternateColor: "#869397", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/dal.png", localLogoPath: "/assets/teams/dal.png" },
  DEN: { abbreviation: "DEN", city: "Denver", name: "Broncos", espnSlug: "den", primaryColor: "#FB4F14", alternateColor: "#002244", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/den.png", localLogoPath: "/assets/teams/den.png" },
  DET: { abbreviation: "DET", city: "Detroit", name: "Lions", espnSlug: "det", primaryColor: "#0076B6", alternateColor: "#B0B7BC", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/det.png", localLogoPath: "/assets/teams/det.png" },
  GB: { abbreviation: "GB", city: "Green Bay", name: "Packers", espnSlug: "gb", primaryColor: "#203731", alternateColor: "#FFB612", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/gb.png", localLogoPath: "/assets/teams/gb.png" },
  HOU: { abbreviation: "HOU", city: "Houston", name: "Texans", espnSlug: "hou", primaryColor: "#03202F", alternateColor: "#A71930", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/hou.png", localLogoPath: "/assets/teams/hou.png" },
  IND: { abbreviation: "IND", city: "Indianapolis", name: "Colts", espnSlug: "ind", primaryColor: "#002C5F", alternateColor: "#A2AAAD", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/ind.png", localLogoPath: "/assets/teams/ind.png" },
  JAX: { abbreviation: "JAX", city: "Jacksonville", name: "Jaguars", espnSlug: "jax", primaryColor: "#101820", alternateColor: "#D7A22A", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/jax.png", localLogoPath: "/assets/teams/jax.png" },
  KC: { abbreviation: "KC", city: "Kansas City", name: "Chiefs", espnSlug: "kc", primaryColor: "#E31837", alternateColor: "#FFB81C", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/kc.png", localLogoPath: "/assets/teams/kc.png" },
  LAC: { abbreviation: "LAC", city: "Los Angeles", name: "Chargers", espnSlug: "lac", primaryColor: "#0080C6", alternateColor: "#FFC20E", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/lac.png", localLogoPath: "/assets/teams/lac.png" },
  LAR: { abbreviation: "LAR", city: "Los Angeles", name: "Rams", espnSlug: "lar", primaryColor: "#003594", alternateColor: "#FFA300", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/lar.png", localLogoPath: "/assets/teams/lar.png" },
  LV: { abbreviation: "LV", city: "Las Vegas", name: "Raiders", espnSlug: "lv", primaryColor: "#000000", alternateColor: "#A5ACAF", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/lv.png", localLogoPath: "/assets/teams/lv.png" },
  MIA: { abbreviation: "MIA", city: "Miami", name: "Dolphins", espnSlug: "mia", primaryColor: "#008E97", alternateColor: "#FC4C02", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/mia.png", localLogoPath: "/assets/teams/mia.png" },
  MIN: { abbreviation: "MIN", city: "Minnesota", name: "Vikings", espnSlug: "min", primaryColor: "#4F2683", alternateColor: "#FFC62F", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/min.png", localLogoPath: "/assets/teams/min.png" },
  NE: { abbreviation: "NE", city: "New England", name: "Patriots", espnSlug: "ne", primaryColor: "#002244", alternateColor: "#C60C30", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/ne.png", localLogoPath: "/assets/teams/ne.png" },
  NO: { abbreviation: "NO", city: "New Orleans", name: "Saints", espnSlug: "no", primaryColor: "#D3BC8D", alternateColor: "#101820", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/no.png", localLogoPath: "/assets/teams/no.png" },
  NYG: { abbreviation: "NYG", city: "New York", name: "Giants", espnSlug: "nyg", primaryColor: "#0B2265", alternateColor: "#A71930", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/nyg.png", localLogoPath: "/assets/teams/nyg.png" },
  NYJ: { abbreviation: "NYJ", city: "New York", name: "Jets", espnSlug: "nyj", primaryColor: "#125740", alternateColor: "#000000", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/nyj.png", localLogoPath: "/assets/teams/nyj.png" },
  PHI: { abbreviation: "PHI", city: "Philadelphia", name: "Eagles", espnSlug: "phi", primaryColor: "#004C54", alternateColor: "#A5ACAF", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/phi.png", localLogoPath: "/assets/teams/phi.png" },
  PIT: { abbreviation: "PIT", city: "Pittsburgh", name: "Steelers", espnSlug: "pit", primaryColor: "#FFB612", alternateColor: "#101820", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/pit.png", localLogoPath: "/assets/teams/pit.png" },
  SEA: { abbreviation: "SEA", city: "Seattle", name: "Seahawks", espnSlug: "sea", primaryColor: "#002244", alternateColor: "#69BE28", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/sea.png", localLogoPath: "/assets/teams/sea.png" },
  SF: { abbreviation: "SF", city: "San Francisco", name: "49ers", espnSlug: "sf", primaryColor: "#AA0000", alternateColor: "#B3995D", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/sf.png", localLogoPath: "/assets/teams/sf.png" },
  TB: { abbreviation: "TB", city: "Tampa Bay", name: "Buccaneers", espnSlug: "tb", primaryColor: "#D50A0A", alternateColor: "#FF7900", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/tb.png", localLogoPath: "/assets/teams/tb.png" },
  TEN: { abbreviation: "TEN", city: "Tennessee", name: "Titans", espnSlug: "ten", primaryColor: "#0C2340", alternateColor: "#4B92DB", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/ten.png", localLogoPath: "/assets/teams/ten.png" },
  WAS: { abbreviation: "WAS", city: "Washington", name: "Commanders", espnSlug: "wsh", primaryColor: "#5A1414", alternateColor: "#FFB612", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/wsh.png", localLogoPath: "/assets/teams/wsh.png" },
  WSH: { abbreviation: "WSH", city: "Washington", name: "Commanders", espnSlug: "wsh", primaryColor: "#5A1414", alternateColor: "#FFB612", logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/wsh.png", localLogoPath: "/assets/teams/wsh.png" },
};

/**
 * Resolves team brand metadata by abbreviation (case-insensitive).
 * Called from TeamLogoBadge, matchup strips, and player cards for color tinting.
 */
export function lookupNflTeamBrandAsset(teamAbbreviation: string | null | undefined): NflTeamBrandAssetRecord | null {
  if (!teamAbbreviation || teamAbbreviation === "TBD") {
    return null;
  }
  return NFL_TEAM_BRAND_ASSET_CATALOG[teamAbbreviation.toUpperCase()] ?? null;
}
