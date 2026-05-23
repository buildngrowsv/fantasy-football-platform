/*
  Web app manifest for installable / home-screen behavior and theme color in mobile browsers.
*/
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NovaPredict",
    short_name: "NovaPredict",
    description:
      "Fantasy football intelligence platform — sportsbook probability translated into weekly projections and accountable picks.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#090b11",
    theme_color: "#090b11",
    orientation: "portrait-primary",
    lang: "en-US",
    dir: "ltr",
    categories: ["sports", "fantasy", "football"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
