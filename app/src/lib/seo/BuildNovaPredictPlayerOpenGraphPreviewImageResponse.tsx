/*
  BuildNovaPredictPlayerOpenGraphPreviewImageResponse

  Player-specific 1200×630 share card for /players/[id] links.

  Product relevance:
  - Users share individual player projections in group chats; the preview should show name,
    position, Nova vs Vegas edge, and matchup — not the generic marketing hero.

  Called from:
  - app/(app)/players/[id]/opengraph-image.tsx
*/
import { ImageResponse } from "next/og";

export function BuildNovaPredictPlayerOpenGraphPreviewImageResponse(input: {
  fullName: string;
  position: string;
  team: string;
  opponent: string;
  novaPprProjection: number;
  vegasPprProjection: number;
  marketSignalLabel: string;
  matchupLabel: string;
}): ImageResponse {
  const modelEdge = input.novaPprProjection - input.vegasPprProjection;
  const edgeLabel = modelEdge >= 0 ? `+${modelEdge.toFixed(1)} vs Vegas` : `${modelEdge.toFixed(1)} vs Vegas`;
  const edgeColor = modelEdge >= 0 ? "#e0ad2e" : "#c45c4a";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "linear-gradient(145deg, #12110f 0%, #1a1816 50%, #151412 100%)",
          color: "#f5f0e8",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 52, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{input.fullName}</div>
            <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  background: "rgba(122,150,176,0.12)",
                  border: "1px solid rgba(122,150,176,0.35)",
                  color: "#9eb4c9",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {input.position}
              </div>
              <div style={{ fontSize: 22, color: "#9a9288" }}>
                {input.team} vs {input.opponent}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 20, color: "#e0ad2e", fontWeight: 600 }}>NovaPredict</div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "28px 32px",
              borderRadius: 12,
              background: "rgba(26,24,22,0.92)",
              border: "1px solid rgba(200,150,12,0.28)",
            }}
          >
            <div style={{ display: "flex", fontSize: 16, color: "#9a9288" }}>Nova PPR</div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 64, fontWeight: 600, color: "#e0ad2e", lineHeight: 1 }}>{input.novaPprProjection.toFixed(1)}</div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "28px 32px",
              borderRadius: 12,
              background: "rgba(26,24,22,0.92)",
              border: "1px solid rgba(42,38,34,0.9)",
            }}
          >
            <div style={{ display: "flex", fontSize: 16, color: "#9a9288" }}>Vegas implied</div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 64, fontWeight: 600, lineHeight: 1 }}>{input.vegasPprProjection.toFixed(1)}</div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 20, color: edgeColor, fontWeight: 600 }}>{edgeLabel}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, color: "#b8842e", fontWeight: 600 }}>{input.marketSignalLabel}</div>
          <div style={{ fontSize: 18, color: "#9a9288" }}>{input.matchupLabel}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
