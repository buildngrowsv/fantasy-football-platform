/*
  BuildNovaPredictOpenGraphPreviewImageResponse

  Generates the default 1200×630 social share card for NovaPredict marketing and app pages.

  Why a generated card instead of a static PNG:
  - Keeps typography and gradients aligned with globals.css tokens without manual export cycles.
  - Cloudflare/OpenNext builds pick this up automatically via app/opengraph-image.tsx.

  Called from:
  - app/opengraph-image.tsx
  - app/twitter-image.tsx (same visual — X and iMessage both prefer 1200×630)
*/
import { ImageResponse } from "next/og";
import { ResolveNovaPredictPublicSiteUrl } from "@/lib/seo/ResolveNovaPredictPublicSiteUrl";

export function BuildNovaPredictOpenGraphPreviewImageResponse(): ImageResponse {
  const siteHost = new URL(ResolveNovaPredictPublicSiteUrl()).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #090b11 0%, #0f1118 45%, #0a1620 100%)",
          color: "#f0f4ff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(28,33,51,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(28,33,51,0.35) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.45,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(0,210,140,0.2) 0%, rgba(0,180,216,0.12) 100%)",
              border: "1px solid rgba(0,210,140,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 48 48">
              <path
                d="M8 34L18 18L28 28L40 12"
                stroke="#00d28c"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="40" cy="12" r="3.5" fill="#00d28c" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em" }}>
              Nova<span style={{ color: "#00d28c" }}>Predict</span>
            </div>
            <div style={{ fontSize: 18, color: "#5a6a84", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Fantasy Intelligence Platform
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative", maxWidth: 920 }}>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em" }}>
            Vegas already priced the game.
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 34, color: "#00d28c", fontWeight: 600, lineHeight: 1.2 }}>
            NovaPredict translates it into fantasy edge.
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 22, color: "#5a6a84", lineHeight: 1.5, maxWidth: 820 }}>
            Weekly projections, pick slate, accountability reports, and challenge mode — built on sportsbook probability.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(0,210,140,0.12)",
              border: "1px solid rgba(0,210,140,0.35)",
              color: "#a8ffd4",
              fontSize: 16,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            2026 Season Engine
          </div>
          <div style={{ fontSize: 16, color: "#2e3d55" }}>{siteHost}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
