"use client";

/*
  NovaPredictNflTeamLogoBadge
  ---------------------------
  Small circular or rounded team logo badge for matchup strips and card headers.

  Data source: ESPN CDN team logos (also mirrored locally via sync-nfl-visual-assets.mjs).
  Fallback: team abbreviation text on brand color background when logo fails to load.

  Used by: NovaPredictMatchupVisualStrip, player cards, import page (future league team context).
*/

import Image from "next/image";
import { useState } from "react";
import { lookupNflTeamBrandAsset } from "@/lib/assets/NflTeamBrandAssetCatalog";

export interface NovaPredictNflTeamLogoBadgeProps {
  teamAbbreviation: string;
  size?: number;
  variant?: "circle" | "rounded";
  showLabel?: boolean;
}

export function NovaPredictNflTeamLogoBadge({
  teamAbbreviation,
  size = 28,
  variant = "circle",
  showLabel = false,
}: NovaPredictNflTeamLogoBadgeProps) {
  const teamBrand = lookupNflTeamBrandAsset(teamAbbreviation);
  const [useFallback, setUseFallback] = useState(false);

  if (!teamBrand || teamAbbreviation === "TBD") {
    return (
      <span
        className="np-team-logo-fallback"
        style={{
          display: "inline-grid",
          placeItems: "center",
          width: size,
          height: size,
          borderRadius: variant === "circle" ? "50%" : 6,
          background: "var(--np-surface-muted)",
          border: "1px solid var(--np-border)",
          fontSize: size * 0.28,
          fontWeight: 700,
          color: "var(--np-text-dim)",
        }}
      >
        ?
      </span>
    );
  }

  const borderRadius = variant === "circle" ? "50%" : 6;

  return (
    <span className="np-team-logo-badge" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {useFallback ? (
        <span
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: size,
            height: size,
            borderRadius,
            background: `${teamBrand.primaryColor}22`,
            border: `1px solid ${teamBrand.primaryColor}55`,
            fontSize: size * 0.28,
            fontWeight: 800,
            color: teamBrand.primaryColor,
            letterSpacing: "0.02em",
          }}
        >
          {teamBrand.abbreviation}
        </span>
      ) : (
        <span
          style={{
            display: "inline-block",
            width: size,
            height: size,
            borderRadius,
            overflow: "hidden",
            background: "var(--np-surface-muted)",
            border: "1px solid var(--np-border-subtle)",
          }}
        >
          <Image
            src={teamBrand.localLogoPath}
            alt={`${teamBrand.city} ${teamBrand.name} logo`}
            width={size}
            height={size}
            style={{ objectFit: "contain", padding: 2 }}
            onError={() => setUseFallback(true)}
          />
        </span>
      )}
      {showLabel ? (
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--np-text-muted)" }}>{teamBrand.abbreviation}</span>
      ) : null}
    </span>
  );
}
