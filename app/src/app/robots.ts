/*
  robots.txt — tells crawlers what to index.

  Admin is excluded because signal-weight tuning is internal ops, not a public landing page.
*/
import type { MetadataRoute } from "next";
import { ResolveNovaPredictPublicSiteUrl } from "@/lib/seo/ResolveNovaPredictPublicSiteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = ResolveNovaPredictPublicSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
