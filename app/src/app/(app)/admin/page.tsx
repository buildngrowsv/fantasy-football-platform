import type { NovaPredictSignalWeightRecord } from "@/lib/db/schema";
import { getNovaPredictSignalWeights } from "@/lib/db/queries";

function weightStatusPill(signalWeight: NovaPredictSignalWeightRecord): string {
  if (signalWeight.status === "suppressed") return "np-pill-amber";
  if (signalWeight.status === "experimental") return "np-pill-cyan";
  return "np-pill-accent";
}

export default async function AdminPage() {
  const signalWeights = await getNovaPredictSignalWeights(30);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <article className="np-card" style={{ padding: "1.4rem" }}>
        <h1 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.65rem", letterSpacing: "-0.03em" }}>Signal Weights Admin</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--np-text-muted)", lineHeight: 1.7 }}>
          Internal controls for move-type multipliers and contextual model conditioning. This board is designed for transparent tuning, not hidden overrides.
        </p>
      </article>

      <article className="np-card" style={{ padding: "1rem" }}>
        <div className="np-card-muted" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.8fr", padding: "0.7rem 0.8rem", borderBottom: "1px solid var(--np-border-subtle)", color: "var(--np-text-dim)", fontSize: "0.64rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span>Signal</span>
            <span style={{ textAlign: "right" }}>Multiplier</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>
          {signalWeights.map((signalWeight) => (
            <div key={signalWeight.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.8fr", padding: "0.7rem 0.8rem", borderBottom: "1px solid var(--np-border-subtle)", alignItems: "center" }}>
              <span style={{ color: "var(--np-text-strong)", fontSize: "0.86rem", fontWeight: 600 }}>{signalWeight.signalName}</span>
              <span style={{ color: "var(--np-cyan)", textAlign: "right", fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.8rem" }}>
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
