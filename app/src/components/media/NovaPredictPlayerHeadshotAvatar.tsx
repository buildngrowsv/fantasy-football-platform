"use client";

/*
  NovaPredictPlayerHeadshotAvatar
  -------------------------------
  Renders ESPN player headshots with graceful degradation to initials badge.

  Why client component:
  - next/image onError requires client-side state to swap CDN → local cached → initials fallback chain.
  - Used across dashboard cards, slate rows, player detail hero, sidebar signals, accountability list.

  Fallback order (because CDN 404s happen for retired/inactive players still in seed data):
  1. ESPN CDN headshot (headshotUrl)
  2. Local synced copy (/assets/players/{sleeperId}.png)
  3. Initials on position-colored gradient (matches design mock position badges)
*/

import Image from "next/image";
import { useState } from "react";
import { ResolvePositionAccentColor } from "@/lib/assets/ResolveNovaPredictPlayerVisualAssets";
import type { FantasyFootballPlayerPosition } from "@/lib/db/schema";

export interface NovaPredictPlayerHeadshotAvatarProps {
  fullName: string;
  position: FantasyFootballPlayerPosition;
  headshotUrl?: string | null;
  localHeadshotPath?: string | null;
  initials: string;
  size?: number;
  showTeamRing?: boolean;
  teamPrimaryColor?: string | null;
  priority?: boolean;
}

export function NovaPredictPlayerHeadshotAvatar({
  fullName,
  position,
  headshotUrl,
  localHeadshotPath,
  initials,
  size = 52,
  showTeamRing = false,
  teamPrimaryColor,
  priority = false,
}: NovaPredictPlayerHeadshotAvatarProps) {
  const [fallbackStage, setFallbackStage] = useState<"cdn" | "local" | "initials">("cdn");

  const positionAccent = ResolvePositionAccentColor(position);
  const ringColor = teamPrimaryColor ?? positionAccent;

  const activeSrc =
    fallbackStage === "cdn" && headshotUrl
      ? headshotUrl
      : fallbackStage === "local" && localHeadshotPath
        ? localHeadshotPath
        : null;

  return (
    <div
      className="np-player-avatar-shell"
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        border: showTeamRing ? `2px solid ${ringColor}` : "2px solid var(--np-border)",
        boxShadow: showTeamRing ? `0 0 14px ${ringColor}44` : "0 4px 14px rgba(0,0,0,0.35)",
        background: "var(--np-surface-muted)",
      }}
      aria-label={`${fullName} headshot`}
    >
      {activeSrc ? (
        <Image
          src={activeSrc}
          alt={`${fullName} NFL headshot`}
          width={size}
          height={size}
          priority={priority}
          style={{ objectFit: "cover", objectPosition: "top center", width: "100%", height: "100%" }}
          onError={() => {
            if (fallbackStage === "cdn" && localHeadshotPath) {
              setFallbackStage("local");
              return;
            }
            setFallbackStage("initials");
          }}
        />
      ) : (
        <div
          className="np-player-avatar-initials"
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: size * 0.32,
            letterSpacing: "0.04em",
            color: "var(--np-text-strong)",
            background: `linear-gradient(145deg, ${positionAccent}33, var(--np-surface-muted))`,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
