import Link from "next/link";
import Image from "next/image";
import { NovaPredictPlayerProjectionCard } from "@/components/players/NovaPredictPlayerProjectionCard";
import { NovaPredictHomepageJsonLdScript } from "@/components/seo/NovaPredictHomepageJsonLdScript";
import type { NovaPredictPlatformMetricRecord } from "@/lib/db/schema";
import { getNovaPredictHomepageMetrics, getNovaPredictPlayerRecords } from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const dynamic = "force-dynamic";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Fantasy Intelligence Platform",
  description:
    "NovaPredict translates sportsbook probability into actionable fantasy football decisions — weekly projections, pick slate, accountability, and challenge mode.",
  path: "/",
});

function metricToneColor(metric: NovaPredictPlatformMetricRecord): string {
  if (metric.tone === "accent") return "var(--np-accent)";
  if (metric.tone === "cyan") return "var(--np-cyan)";
  if (metric.tone === "amber") return "var(--np-amber)";
  return "var(--np-text-strong)";
}

export default async function HomePage() {
  const [homepageMetrics, featuredPlayers] = await Promise.all([
    getNovaPredictHomepageMetrics(),
    getNovaPredictPlayerRecords(6),
  ]);

  return (
    <>
      <NovaPredictHomepageJsonLdScript />
      <div className="np-page-shell" style={{ display: "grid", gap: "1.25rem" }}>
      <section className="np-card np-grid-background np-marketing-hero" style={{ position: "relative", padding: "4rem 3rem", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            right: "-2%",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.12,
            pointerEvents: "none",
          }}
        >
          <Image src="/assets/brand/novapredict-logo.svg" alt="" width={320} height={64} aria-hidden />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="np-pill np-pill-accent" style={{ marginBottom: "1rem" }}>
            <span
              style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--np-accent)", boxShadow: "0 0 18px rgba(0,210,140,0.65)" }}
            />
            NovaPredict · 2026 Season Engine
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 1.03, letterSpacing: "-0.04em", color: "var(--np-text-strong)", maxWidth: 760 }}>
            Vegas already priced the game.
            <br />
            <span style={{ color: "var(--np-accent)" }}>NovaPredict translates it into fantasy edge.</span>
          </h1>

          <p style={{ marginTop: "1.2rem", maxWidth: 720, lineHeight: 1.78, color: "var(--np-text-muted)", fontSize: "1.02rem" }}>
            We ingest full prop ladders, classify why lines move, run Monte Carlo distributions, and publish a fully accountable record.
            This is not another projection table. It is a transparent decision engine built for winning weeks and long-term trust.
          </p>

          <div style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/dashboard" className="np-accent-gradient" style={{ borderRadius: 10, padding: "0.85rem 1.2rem", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Open Weekly Dashboard
            </Link>
            <Link href="/accountability" style={{ color: "var(--np-cyan)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.8rem" }}>
              View Accountability Report →
            </Link>
          </div>
        </div>
      </section>

      <section className="np-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", overflow: "hidden" }}>
        {homepageMetrics.map((metric) => (
          <div key={metric.label} style={{ borderRight: "1px solid var(--np-border-subtle)", padding: "1.4rem 1rem", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontWeight: 500, fontSize: "1.7rem", color: metricToneColor(metric) }}>{metric.value}</div>
            <div style={{ marginTop: "0.35rem", fontSize: "0.68rem", color: "var(--np-text-dim)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {metric.label}
            </div>
            {metric.subLabel ? (
              <div style={{ marginTop: "0.25rem", fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.68rem", color: "#243247" }}>{metric.subLabel}</div>
            ) : null}
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)", gap: "1.25rem" }}>
        <article className="np-card" style={{ padding: "1.6rem" }}>
          <p className="np-pill np-pill-cyan" style={{ marginBottom: "0.9rem" }}>How It Works</p>
          <h2 style={{ fontSize: "1.8rem", letterSpacing: "-0.02em", color: "var(--np-text-strong)", marginBottom: "0.75rem" }}>
            Nine phases. One trusted output.
          </h2>
          <p style={{ lineHeight: 1.75, color: "var(--np-text-muted)", marginBottom: "1rem" }}>
            Ingestion of alt ladders, vig removal, CDF reconstruction, move-type classification, Monte Carlo simulation, conditioning layers,
            and final blend logic produce the weekly probability profile.
          </p>
          <div className="np-card-muted" style={{ padding: "0.95rem 1rem" }}>
            <strong style={{ color: "var(--np-accent)" }}>Moat:</strong>{" "}
            <span style={{ color: "var(--np-text-muted)" }}>
              public-money suppression, full point breakdown visibility, and public miss diagnostics on every cycle.
            </span>
          </div>
        </article>

        <article className="np-card" style={{ padding: "1.6rem" }}>
          <p className="np-pill np-pill-accent" style={{ marginBottom: "0.9rem" }}>Signal Board</p>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {featuredPlayers.map((player, index) => (
              <NovaPredictPlayerProjectionCard key={player.id} player={player} variant="featured" priorityImage={index < 2} />
            ))}
          </div>
        </article>
      </section>

      <section className="np-card" style={{ padding: "2rem", textAlign: "center" }}>
        <h3 style={{ fontSize: "1.9rem", color: "var(--np-text-strong)", letterSpacing: "-0.03em", marginBottom: "0.6rem" }}>
          Ready to benchmark your decisions against the model?
        </h3>
        <p style={{ color: "var(--np-text-muted)", maxWidth: 640, margin: "0 auto 1.2rem", lineHeight: 1.7 }}>
          Compare your overrides, track edge patterns, and see exactly where your instincts beat consensus.
        </p>
        <Link href="/challenge" className="np-accent-gradient" style={{ borderRadius: 10, padding: "0.9rem 1.3rem", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Enter Challenge Board
        </Link>
      </section>
    </div>
    </>
  );
}
