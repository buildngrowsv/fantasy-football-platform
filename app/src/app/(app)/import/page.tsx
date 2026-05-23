import Image from "next/image";
import { getNovaPredictLeagueImportProviders } from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "League Import",
  description:
    "Connect Sleeper, ESPN, or Yahoo leagues to personalize NovaPredict projections, lineup recommendations, and accountability tracking.",
  path: "/import",
});

const PROVIDER_ASSET_MAP: Record<string, string> = {
  Sleeper: "/assets/providers/sleeper.svg",
  ESPN: "/assets/providers/espn.svg",
  Yahoo: "/assets/providers/yahoo.svg",
};

export default async function ImportPage() {
  const providers = await getNovaPredictLeagueImportProviders();

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <article className="np-card" style={{ padding: "1.4rem" }}>
        <h1 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.65rem", letterSpacing: "-0.03em" }}>League Import</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--np-text-muted)", lineHeight: 1.7 }}>
          Connect your Sleeper, ESPN, or Yahoo league to personalize projections, lineup recommendations, and accountability tracking.
        </p>
      </article>

      <article className="np-card" style={{ padding: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
        {providers.map((provider) => (
          <div key={provider.provider} className="np-card-muted" style={{ padding: "0.95rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.55rem" }}>
              <Image
                src={PROVIDER_ASSET_MAP[provider.provider] ?? "/assets/providers/sleeper.svg"}
                alt={`${provider.provider} logo`}
                width={48}
                height={48}
                style={{ borderRadius: 10 }}
              />
              <div style={{ color: "var(--np-text-strong)", fontWeight: 700, letterSpacing: "-0.01em" }}>{provider.provider}</div>
            </div>
            <div style={{ color: "var(--np-text-muted)", lineHeight: 1.6, fontSize: "0.86rem", marginBottom: "0.55rem" }}>{provider.statusText}</div>
            <div style={{ color: "var(--np-text-dim)", fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.72rem", marginBottom: "0.75rem" }}>
              Connected leagues: {provider.connectedLeagueCount}
            </div>
            <button className="np-accent-gradient" style={{ width: "100%", borderRadius: 9, border: 0, padding: "0.58rem 0.7rem", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.06em" }}>
              Connect {provider.provider}
            </button>
          </div>
        ))}
      </article>
    </section>
  );
}
