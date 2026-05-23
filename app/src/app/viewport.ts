/*
  viewport export — separated from metadata per Next.js 14+ convention.

  themeColor tracks --np-bg per color scheme so mobile browser chrome matches the shell.
*/
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090b11" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
  ],
  colorScheme: "dark light",
};
