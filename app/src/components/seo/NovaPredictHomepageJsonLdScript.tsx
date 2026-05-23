/*
  NovaPredictHomepageJsonLdScript

  Injects schema.org JSON-LD on the marketing homepage for rich search results.

  Why JSON-LD on homepage only:
  - Player pages get dynamic metadata via generateMetadata; the homepage is the primary
    branded entry point search engines should understand as WebApplication + Organization.
  - Kept as a small server component so layout stays clean and JSON stays type-safe.

  Called from:
  - app/src/app/page.tsx
*/
import { ResolveNovaPredictPublicSiteUrl } from "@/lib/seo/ResolveNovaPredictPublicSiteUrl";

export function NovaPredictHomepageJsonLdScript() {
  const siteUrl = ResolveNovaPredictPublicSiteUrl();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "NovaPredict",
        url: siteUrl,
        logo: `${siteUrl}/icon-192`,
        description:
          "NovaPredict translates sportsbook probability into actionable fantasy football decisions.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "NovaPredict",
        description:
          "Fantasy intelligence platform with weekly projections, pick slate, accountability reports, and challenge mode.",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#application`,
        name: "NovaPredict",
        url: siteUrl,
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Weekly NFL fantasy projections powered by sportsbook props, Monte Carlo distributions, and fully accountable model tracking.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
