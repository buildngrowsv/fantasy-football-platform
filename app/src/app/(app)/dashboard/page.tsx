import Link from "next/link";
import { NovaPredictMetricStripSection } from "@/components/layout/NovaPredictMetricStripSection";
import { NovaPredictPageHeaderSection } from "@/components/layout/NovaPredictPageHeaderSection";
import { NovaPredictPlayerProjectionCard } from "@/components/players/NovaPredictPlayerProjectionCard";
import { getNovaPredictHomepageMetrics, getNovaPredictPlayerRecords } from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Dashboard",
  description:
    "Live NovaPredict weekly dashboard — platform metrics, top signals, and projection cards for your fantasy decisions.",
  path: "/dashboard",
});

export default async function DashboardPage() {
  const [metrics, players] = await Promise.all([getNovaPredictHomepageMetrics(), getNovaPredictPlayerRecords(12)]);

  return (
    <section className="np-page-stack">
      <NovaPredictPageHeaderSection
        kicker="This week"
        title="Dashboard"
        lead="Market moves, blended projections, and the players worth a closer look before lock."
      />

      <NovaPredictMetricStripSection
        metrics={metrics.map((metric) => ({
          label: metric.label,
          value: metric.value,
          subLabel: metric.subLabel ?? undefined,
        }))}
      />

      <article className="np-card" style={{ padding: "1rem 1.1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", gap: "0.75rem" }}>
          <h2 className="np-page-title" style={{ fontSize: "1.25rem" }}>
            Top projections
          </h2>
          <Link href="/slate" className="np-text-link">
            Open pick slate →
          </Link>
        </div>

        <div className="np-player-card-grid">
          {players.map((player, index) => (
            <NovaPredictPlayerProjectionCard key={player.id} player={player} variant="compact" priorityImage={index < 3} />
          ))}
        </div>
      </article>
    </section>
  );
}
