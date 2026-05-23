import Image from "next/image";

import { NovaPredictPageHeaderSection } from "@/components/layout/NovaPredictPageHeaderSection";
import { NovaPredictSleeperLeagueImportPanel } from "@/components/league-import/NovaPredictSleeperLeagueImportPanel";
import { RequireNovaPredictAuthenticatedUserOrRedirectToSignIn } from "@/lib/auth/RequireNovaPredictAuthenticatedUserOrRedirectToSignIn";
import { getNovaPredictLeagueImportProviders } from "@/lib/db/queries";
import { ListNovaPredictLeagueConnectionsForUserFromDatabase } from "@/lib/league-import/ListNovaPredictLeagueConnectionsForUserFromDatabase";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Import league",
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
  const authenticatedUser = await RequireNovaPredictAuthenticatedUserOrRedirectToSignIn("/import");

  const [providers, existingConnections] = await Promise.all([
    getNovaPredictLeagueImportProviders(authenticatedUser.id),
    ListNovaPredictLeagueConnectionsForUserFromDatabase(authenticatedUser.id),
  ]);

  return (
    <section className="np-page-stack">
      <NovaPredictPageHeaderSection
        kicker="Your league"
        title="Import league"
        lead="Connect Sleeper, ESPN, or Yahoo so picks and grades reflect your actual roster."
      />

      <article className="np-card np-league-import-sleeper-card" style={{ padding: "1.1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.85rem" }}>
          <Image src="/assets/providers/sleeper.svg" alt="Sleeper logo" width={48} height={48} style={{ borderRadius: 10 }} />
          <div>
            <div style={{ color: "var(--np-text-strong)", fontWeight: 700 }}>Sleeper</div>
            <div style={{ color: "var(--np-text-muted)", fontSize: "0.86rem" }}>
              {providers.find((provider) => provider.provider === "Sleeper")?.statusText ?? "Connect with your username"}
            </div>
          </div>
        </div>
        <NovaPredictSleeperLeagueImportPanel existingConnections={existingConnections} />
      </article>

      <article className="np-card" style={{ padding: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
        {providers
          .filter((provider) => provider.provider !== "Sleeper")
          .map((provider) => (
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
              <div className="np-metric-sublabel" style={{ marginBottom: "0.75rem" }}>
                Coming soon — OAuth sign-in
              </div>
              <button type="button" className="np-btn np-btn-secondary" style={{ width: "100%" }} disabled>
                Connect {provider.provider}
              </button>
            </div>
          ))}
      </article>
    </section>
  );
}
