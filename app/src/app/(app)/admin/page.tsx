import { NovaPredictPageHeaderSection } from "@/components/layout/NovaPredictPageHeaderSection";
import type { NovaPredictSignalWeightRecord } from "@/lib/db/schema";
import { getNovaPredictSignalWeights } from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Signal weights",
  description: "Tune how market signals feed NovaPredict's weekly projection blend.",
  path: "/admin",
  noIndex: true,
});

function weightStatusPill(signalWeight: NovaPredictSignalWeightRecord): string {
  if (signalWeight.status === "suppressed") return "np-pill-amber";
  if (signalWeight.status === "experimental") return "np-pill-cyan";
  return "np-pill-accent";
}

export default async function AdminPage() {
  const signalWeights = await getNovaPredictSignalWeights(30);

  return (
    <section className="np-page-stack">
      <NovaPredictPageHeaderSection
        kicker="Model tuning"
        title="Signal weights"
        lead="How each market signal feeds the weekly blend — tuned in the open, not hidden behind the model."
      />

      <article className="np-card" style={{ padding: "1rem" }}>
        <div className="np-card-muted" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 0.8fr 0.8fr",
              padding: "0.7rem 0.8rem",
              borderBottom: "1px solid var(--np-border-subtle)",
              color: "var(--np-stat-label)",
              fontSize: "0.78rem",
            }}
          >
            <span>Signal</span>
            <span style={{ textAlign: "right" }}>Multiplier</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>
          {signalWeights.map((signalWeight) => (
            <div
              key={signalWeight.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 0.8fr 0.8fr",
                padding: "0.7rem 0.8rem",
                borderBottom: "1px solid var(--np-border-subtle)",
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--np-text-strong)", fontSize: "0.86rem", fontWeight: 600 }}>{signalWeight.signalName}</span>
              <span className="np-stat-value is-data" style={{ textAlign: "right", fontSize: "0.82rem" }}>
                {signalWeight.weightMultiplier.toFixed(2)}x
              </span>
              <span style={{ justifySelf: "end" }} className={`np-pill ${weightStatusPill(signalWeight)}`}>
                {signalWeight.status}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
