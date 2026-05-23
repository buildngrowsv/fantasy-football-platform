/*
  ResolveNovaPredictPublicSiteUrl

  Returns the canonical public origin for NovaPredict (no trailing slash).

  Why this exists:
  - Open Graph, Twitter cards, canonical URLs, sitemap entries, and JSON-LD all need an
    absolute URL. Relative paths break when links are pasted into iMessage, Slack, or X.
  - Production deploys through Cloudflare Workers with NEXT_PUBLIC_APP_URL in wrangler.jsonc.
  - Local dev falls back to localhost on the app's non-default port (4827) so previews still work.

  Called from:
  - BuildNovaPredictRootSiteMetadata
  - BuildNovaPredictPageSiteMetadata
  - app/sitemap.ts, app/robots.ts, app/manifest.ts
  - NovaPredictHomepageJsonLdScript (structured data)
*/
export function ResolveNovaPredictPublicSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  return "http://127.0.0.1:4827";
}
