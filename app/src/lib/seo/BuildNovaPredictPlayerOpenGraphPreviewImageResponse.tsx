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
  const edgeColor = modelEdge >= 0 ? "#00d28c" : "#e05050";

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
          background: "linear-gradient(145deg, #090b11 0%, #0f1118 50%, #101820 100%)",
          color: "#f0f4ff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 52, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{input.fullName}</div>
            <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "rgba(0,180,216,0.12)",
                  border: "1px solid rgba(0,180,216,0.35)",
                  color: "#7de8ff",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {input.position}
              </div>
              <div style={{ fontSize: 22, color: "#5a6a84" }}>
                {input.team} vs {input.opponent}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 20, color: "#00d28c", fontWeight: 700 }}>NovaPredict</div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "28px 32px",
              borderRadius: 18,
              background: "rgba(15,17,24,0.92)",
              border: "1px solid rgba(0,210,140,0.28)",
            }}
          >
            <div style={{ display: "flex", fontSize: 16, color: "#5a6a84", textTransform: "uppercase", letterSpacing: "0.12em" }}>Nova PPR</div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 64, fontWeight: 700, color: "#00d28c", lineHeight: 1 }}>{input.novaPprProjection.toFixed(1)}</div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "28px 32px",
              borderRadius: 18,
              background: "rgba(15,17,24,0.92)",
              border: "1px solid rgba(28,33,51,0.9)",
            }}
          >
            <div style={{ display: "flex", fontSize: 16, color: "#5a6a84", textTransform: "uppercase", letterSpacing: "0.12em" }}>Vegas Implied</div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 64, fontWeight: 700, lineHeight: 1 }}>{input.vegasPprProjection.toFixed(1)}</div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 20, color: edgeColor, fontWeight: 700 }}>{edgeLabel}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, color: "#c98c2a", fontWeight: 600 }}>{input.marketSignalLabel}</div>
          <div style={{ fontSize: 18, color: "#5a6a84" }}>{input.matchupLabel}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
