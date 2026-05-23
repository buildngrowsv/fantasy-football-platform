/*
  NovaPredictMatchupVisualStrip
  -----------------------------
  Compact team-vs-team logo row used on player cards and slate rows.

  Product relevance: matchup context is the #1 scan signal on pick slates — logos beat plain "DAL vs NYG" text
  for mobile users making quick start/sit decisions under time pressure before lock.
*/

import { NovaPredictNflTeamLogoBadge } from "@/components/media/NovaPredictNflTeamLogoBadge";

export interface NovaPredictMatchupVisualStripProps {
  team: string;
  opponent: string;
  matchupLabel?: string;
  logoSize?: number;
}

export function NovaPredictMatchupVisualStrip({
  team,
  opponent,
  matchupLabel,
  logoSize = 22,
}: NovaPredictMatchupVisualStripProps) {
  return (
    <div className="np-matchup-strip" style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
      <NovaPredictNflTeamLogoBadge teamAbbreviation={team} size={logoSize} />
      <span style={{ color: "var(--np-text-dim)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>VS</span>
      <NovaPredictNflTeamLogoBadge teamAbbreviation={opponent} size={logoSize} />
      {matchupLabel ? (
        <span style={{ color: "var(--np-text-dim)", fontSize: "0.68rem", marginLeft: 2 }}>{matchupLabel}</span>
      ) : null}
    </div>
  );
}
