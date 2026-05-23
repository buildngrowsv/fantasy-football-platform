import Link from "next/link";
import { NovaPredictMetricStripSection } from "@/components/layout/NovaPredictMetricStripSection";
import { NovaPredictPlayerProjectionCard } from "@/components/players/NovaPredictPlayerProjectionCard";
import { NovaPredictHomepageJsonLdScript } from "@/components/seo/NovaPredictHomepageJsonLdScript";
import type { NovaPredictPlatformMetricRecord } from "@/lib/db/schema";
import { getNovaPredictHomepageMetrics, getNovaPredictPlayerRecords } from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const dynamic = "force-dynamic";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Fantasy Intelligence Platform",
  description:
    "NovaPredict reads the Vegas prop market, classifies why lines move, and turns that into accountable weekly fantasy decisions.",
  path: "/",
});

function mapHomepageMetricTone(metric: NovaPredictPlatformMetricRecord): "default" | "accent" | "data" | "amber" {
  if (metric.tone === "accent") return "accent";
  if (metric.tone === "cyan") return "data";
  if (metric.tone === "amber") return "amber";
  return "default";
}

export default async function HomePage() {
  const [homepageMetrics, featuredPlayers] = await Promise.all([
    getNovaPredictHomepageMetrics(),
    getNovaPredictPlayerRecords(6),
  ]);

  return (
    <>
      <NovaPredictHomepageJsonLdScript />
      <div className="np-page-shell np-page-stack">
        <section className="np-card np-marketing-hero">
          <p className="np-kicker">The signal behind the signal</p>

          <h1 className="np-marketing-hero-title">
            Vegas already priced the game.
            <br />
            <span className="np-marketing-hero-accent">We tell you whether to believe it.</span>
          </h1>

          <p className="np-marketing-hero-lead">
            Sportsbooks publish a full probability ladder for every player, every week. NovaPredict reads that
            distribution, strips the vig, and converts it to fantasy points — then classifies whether a line moved
            on sharp money or public noise before you start anyone.
          </p>

          <div className="np-marketing-hero-actions">
            <Link href="/dashboard" className="np-btn np-btn-primary">
              Open dashboard
            </Link>
            <Link href="/accountability" className="np-text-link">
              Read the gradebook →
            </Link>
          </div>
        </section>

        <NovaPredictMetricStripSection
          metrics={homepageMetrics.map((metric) => ({
            label: metric.label,
            value: metric.value,
            subLabel: metric.subLabel ?? undefined,
            tone: mapHomepageMetricTone(metric),
          }))}
        />

        <section className="np-section-grid-2">
          <article className="np-card" style={{ padding: "1.5rem" }}>
            <p className="np-kicker">How it works</p>
            <h2 className="np-page-title">Read Vegas. Weigh the move. Publish the record.</h2>
            <p className="np-page-lead">
              Ingest alt ladders, remove book margin, reconstruct the distribution, run Monte Carlo, classify the move
              type, then blend our internal model on top. Every output ships with floor, ceiling, boom rate, and a public
              miss log.
            </p>
            <div className="np-insight-block">
              <p>
                <strong style={{ color: "var(--np-text-strong)" }}>What others miss:</strong> when a star&apos;s line
                jumps before primetime, we flag public action and leave the projection alone. When sharp money moves a
                Thursday line, we apply the full signal.
              </p>
            </div>
          </article>

          <article className="np-card" style={{ padding: "1.5rem" }}>
            <p className="np-kicker">This week&apos;s board</p>
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {featuredPlayers.map((player, index) => (
                <NovaPredictPlayerProjectionCard key={player.id} player={player} variant="featured" priorityImage={index < 2} />
              ))}
            </div>
          </article>
        </section>

        <section className="np-card np-marketing-cta-band">
          <h3 className="np-marketing-cta-title">Track your reads against the model</h3>
          <p className="np-marketing-cta-lead">
            Override before lock, tag your reason, and see where your instincts beat consensus after Sunday.
          </p>
          <Link href="/challenge" className="np-btn np-btn-primary">
            Take the challenge
          </Link>
        </section>
      </div>
    </>
  );
}
