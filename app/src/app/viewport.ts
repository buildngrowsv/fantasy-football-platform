/*
  viewport export — separated from metadata per Next.js 14+ convention.

  themeColor matches --np-bg so mobile browser chrome blends with the NovaPredict shell.
*/
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090b11" },
    { media: "(prefers-color-scheme: light)", color: "#090b11" },
  ],
  colorScheme: "dark",
};
