/*
  BuildNovaPredictBrandMarkImageResponse

  Renders the NovaPredict app icon (favicon + PWA + Apple touch) using next/og ImageResponse.

  Design notes:
  - Matches the SVG mark in public/assets/brand/novapredict-logo.svg: gradient chart line on
    a dark surface so tabs and home-screen shortcuts feel native to the product UI.
  - ImageResponse runs at build/request time — no checked-in PNGs to drift out of sync with brand.

  Called from:
  - app/icon.tsx, app/apple-icon.tsx, app/icon-192.tsx
*/
import { ImageResponse } from "next/og";

export function BuildNovaPredictBrandMarkImageResponse(size: number): ImageResponse {
  const cornerRadius = Math.round(size * 0.22);
  const strokeWidth = Math.max(2, Math.round(size * 0.09));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#090b11",
        }}
      >
        <div
          style={{
            width: Math.round(size * 0.78),
            height: Math.round(size * 0.78),
            borderRadius: cornerRadius,
            background: "linear-gradient(135deg, rgba(0,210,140,0.18) 0%, rgba(0,180,216,0.12) 100%)",
            border: "1px solid rgba(0,210,140,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg width={Math.round(size * 0.52)} height={Math.round(size * 0.52)} viewBox="0 0 48 48">
            <defs>
              <linearGradient id="npIconGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00d28c" />
                <stop offset="1" stopColor="#00b4d8" />
              </linearGradient>
            </defs>
            <path
              d="M8 34L18 18L28 28L40 12"
              stroke="url(#npIconGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="40" cy="12" r={strokeWidth * 0.85} fill="#00d28c" />
          </svg>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}
