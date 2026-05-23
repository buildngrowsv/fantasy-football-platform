import Link from "next/link";
import { NovaPredictMatchupVisualStrip } from "@/components/media/NovaPredictMatchupVisualStrip";
import { NovaPredictPlayerHeadshotAvatar } from "@/components/media/NovaPredictPlayerHeadshotAvatar";
import { ResolvePositionAccentColor } from "@/lib/assets/ResolveNovaPredictPlayerVisualAssets";
import type { NovaPredictPlayerRecord } from "@/lib/db/schema";

/*
  NovaPredictPlayerProjectionCard
  -------------------------------
  Reusable rich player card with headshot, team logos, and projection stats.

  Consolidates duplicated inline card markup from dashboard, homepage signal board, and related profiles.
  One component per file per project convention — keeps visual upgrades consistent across routes.
*/

export interface NovaPredictPlayerProjectionCardProps {
  player: NovaPredictPlayerRecord;
  variant?: "compact" | "featured" | "sidebar";
  priorityImage?: boolean;
}

export function NovaPredictPlayerProjectionCard({
  player,
  variant = "compact",
  priorityImage = false,
}: NovaPredictPlayerProjectionCardProps) {
  const positionAccent = ResolvePositionAccentColor(player.position);
  const isFeatured = variant === "featured";

  return (
    <Link
      href={`/players/${encodeURIComponent(player.id)}`}
      className="np-card-muted np-player-projection-card"
      style={{
        padding: isFeatured ? "1rem" : "0.85rem",
        display: "grid",
        gap: "0.55rem",
        borderLeft: player.teamPrimaryColor ? `3px solid ${player.teamPrimaryColor}` : undefined,
        transition: "transform 140ms ease, border-color 140ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <NovaPredictPlayerHeadshotAvatar
          fullName={player.fullName}
          position={player.position}
          headshotUrl={player.headshotUrl}
          localHeadshotPath={player.localHeadshotPath}
          initials={player.initials}
          size={isFeatured ? 64 : variant === "sidebar" ? 40 : 52}
          showTeamRing
          teamPrimaryColor={player.teamPrimaryColor}
          priority={priorityImage}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.5rem" }}>
            <div style={{ fontWeight: 600, color: "var(--np-text-strong)", fontSize: isFeatured ? "1.05rem" : "0.92rem" }}>
              {player.fullName}
            </div>
            <span
              className="np-pill"
              style={{
                border: `1px solid ${positionAccent}44`,
                color: positionAccent,
                padding: "0.18rem 0.45rem",
                fontSize: "0.62rem",
                flexShrink: 0,
              }}
            >
              {player.position}
            </span>
          </div>

          <div style={{ marginTop: "0.35rem" }}>
            <NovaPredictMatchupVisualStrip team={player.team} opponent={player.opponent} logoSize={20} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem" }}>
        <div className="np-card-muted" style={{ padding: "0.45rem 0.5rem" }}>
          <div style={{ color: "#395275", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Vegas PPR</div>
          <div style={{ color: "#7a9bbb", fontFamily: "var(--font-jetbrains-mono)" }}>{player.vegasPprProjection.toFixed(1)}</div>
        </div>
        <div className="np-card-muted" style={{ padding: "0.45rem 0.5rem" }}>
          <div style={{ color: "rgba(0,210,140,0.58)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Nova PPR</div>
          <div style={{ color: "var(--np-accent)", fontFamily: "var(--font-jetbrains-mono)", fontWeight: 600 }}>
            {player.novaPprProjection.toFixed(1)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--np-text-dim)", fontSize: "0.68rem", fontFamily: "var(--font-jetbrains-mono)" }}>
        <span>Boom {player.boomProbability.toFixed(0)}%</span>
        <span style={{ color: "var(--np-text-muted)", fontSize: "0.62rem", maxWidth: "55%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {player.marketSignalLabel}
        </span>
      </div>
    </Link>
  );
}
