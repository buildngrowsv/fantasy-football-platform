/*
  BuildNovaPredictOpenGraphPreviewImageResponse

  Generates the default 1200×630 social share card for NovaPredict marketing and app pages.

  Why a generated card instead of a static PNG:
  - Keeps typography and colors aligned with globals.css tokens without manual export cycles.
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
          background: "linear-gradient(145deg, #12110f 0%, #1a1816 55%, #151412 100%)",
          color: "#f5f0e8",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#c8960c",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              background: "rgba(200,150,12,0.12)",
              border: "1px solid rgba(200,150,12,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 48 48">
              <path
                d="M8 34L18 18L28 28L40 12"
                stroke="#e0ad2e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="40" cy="12" r="3.5" fill="#c8960c" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em" }}>
              Nova<span style={{ color: "#e0ad2e" }}>Predict</span>
            </div>
            <div style={{ fontSize: 18, color: "#9a9288" }}>The signal behind the signal</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative", maxWidth: 920 }}>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.04em" }}>
            Vegas already priced the game.
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 34, color: "#e0ad2e", fontWeight: 600, lineHeight: 1.2 }}>
            We tell you whether to believe it.
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 22, color: "#9a9288", lineHeight: 1.5, maxWidth: 820 }}>
            Weekly projections, pick slate, gradebook, and challenge mode — built on prop-market probability.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 6,
              background: "rgba(200,150,12,0.12)",
              border: "1px solid rgba(200,150,12,0.35)",
              color: "#e0ad2e",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            2026 season desk
          </div>
          <div style={{ fontSize: 16, color: "#6b645c" }}>{siteHost}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
