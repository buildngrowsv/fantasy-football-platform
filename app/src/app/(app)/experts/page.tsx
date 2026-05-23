import type { NovaPredictExpertComparisonRecord } from "@/lib/db/schema";
import { getNovaPredictExpertComparisons } from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Expert comparison",
  description:
    "Compare NovaPredict against leading analysts and consensus feeds on identical weekly slates and scoring rules.",
  path: "/experts",
});

function rowTone(expert: NovaPredictExpertComparisonRecord): string {
  if (expert.analystName.toLowerCase().includes("nova")) {
    return "var(--np-accent)";
  }
  return "var(--np-text-strong)";
}

export default async function ExpertsPage() {
  const experts = await getNovaPredictExpertComparisons(14);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <article className="np-card" style={{ padding: "1.4rem" }}>
        <h1 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.65rem", letterSpacing: "-0.03em" }}>
          Expert comparison
        </h1>
        <p style={{ marginTop: "0.5rem", color: "var(--np-text-muted)", lineHeight: 1.7 }}>
          NovaPredict against the names you already follow — same slates, same scoring, no cherry-picking.
        </p>
      </article>

      <article className="np-card" style={{ padding: "1rem" }}>
        <div className="np-card-muted" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 0.9fr 0.8fr 0.8fr 0.7fr",
              padding: "0.7rem 0.75rem",
              borderBottom: "1px solid var(--np-border-subtle)",
              color: "var(--np-text-dim)",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <span>Source</span>
            <span>Type</span>
            <span style={{ textAlign: "right" }}>Weekly SS%</span>
            <span style={{ textAlign: "right" }}>Season SS%</span>
            <span style={{ textAlign: "right" }}>MAE</span>
          </div>
          {experts.map((expert) => (
            <div
              key={expert.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 0.9fr 0.8fr 0.8fr 0.7fr",
                padding: "0.7rem 0.75rem",
                borderBottom: "1px solid var(--np-border-subtle)",
                alignItems: "center",
              }}
            >
              <span style={{ color: rowTone(expert), fontWeight: 600, fontSize: "0.88rem" }}>{expert.analystName}</span>
              <span style={{ color: "var(--np-text-dim)", fontSize: "0.74rem" }}>{expert.source}</span>
              <span style={{ color: "var(--np-cyan)", textAlign: "right", fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.8rem" }}>
                {expert.weeklyAccuracy.toFixed(1)}%
              </span>
              <span style={{ color: "var(--np-accent)", textAlign: "right", fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.8rem" }}>
                {expert.seasonAccuracy.toFixed(1)}%
              </span>
              <span style={{ color: "#7598bb", textAlign: "right", fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.8rem" }}>
                {expert.seasonMae.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
