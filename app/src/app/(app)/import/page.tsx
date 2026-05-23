import { getNovaPredictLeagueImportProviders } from "@/lib/db/queries";

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

      <article className="np-card" style={{ padding: "1rem", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
        {providers.map((provider) => (
          <div key={provider.provider} className="np-card-muted" style={{ padding: "0.95rem" }}>
            <div style={{ color: "var(--np-text-strong)", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "0.45rem" }}>{provider.provider}</div>
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
