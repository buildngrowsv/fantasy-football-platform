import Link from "next/link";

import { NovaPredictPageHeaderSection } from "@/components/layout/NovaPredictPageHeaderSection";
import { NovaPredictPlayerProjectionCard } from "@/components/players/NovaPredictPlayerProjectionCard";
import { ListNovaPredictUserChallengePicksForWeekFromDatabase } from "@/lib/challenge/ListNovaPredictUserChallengePicksForWeekFromDatabase";
import { NOVA_PREDICT_CHALLENGE_OVERRIDE_REASON_OPTIONS } from "@/lib/challenge/NovaPredictChallengePickConstants";
import { RequireNovaPredictAuthenticatedUserOrRedirectToSignIn } from "@/lib/auth/RequireNovaPredictAuthenticatedUserOrRedirectToSignIn";
import { ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase } from "@/lib/players/ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase";
import { getNovaPredictHomepageMetrics, getNovaPredictPlayerRecords } from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Challenge The Model",
  description:
    "Override NovaPredict projections, track your record by reason code, and discover where your instincts beat consensus and the model.",
  path: "/challenge",
});

function resolveOverrideReasonLabel(reasonCode: string | null): string {
  if (!reasonCode) {
    return "—";
  }
  return NOVA_PREDICT_CHALLENGE_OVERRIDE_REASON_OPTIONS.find((option) => option.value === reasonCode)?.label ?? reasonCode;
}

export default async function ChallengePage() {
  const authenticatedUser = await RequireNovaPredictAuthenticatedUserOrRedirectToSignIn("/challenge");
  const slateContext = await ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase();

  const [metrics, challengePlayers, userPicks] = await Promise.all([
    getNovaPredictHomepageMetrics(),
    getNovaPredictPlayerRecords(6),
    ListNovaPredictUserChallengePicksForWeekFromDatabase(
      authenticatedUser.id,
      slateContext.season,
      slateContext.week,
    ),
  ]);

  const agreeCount = userPicks.filter((pick) => pick.pickType === "agree").length;
  const overrideCount = userPicks.filter((pick) => pick.pickType === "override").length;

  return (
    <section className="np-page-stack">
      <NovaPredictPageHeaderSection
        kicker={`${authenticatedUser.displayName ?? authenticatedUser.email} · S${slateContext.season} W${slateContext.week}`}
        title="Challenge the model"
        lead="Submit your reads before lock, then see whether you beat the model and the field after Sunday."
      />

      <article className="np-card" style={{ padding: "1rem 1.1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ color: "var(--np-text-strong)", fontWeight: 600 }}>Your picks this week</div>
          <div className="np-metric-sublabel">
            {userPicks.length} saved · {agreeCount} agree · {overrideCount} override
          </div>
        </div>

        {userPicks.length === 0 ? (
          <p style={{ margin: 0, color: "var(--np-text-muted)", lineHeight: 1.65, fontSize: "0.9rem" }}>
            No picks yet — open a player card and tap <strong>Agree</strong> or <strong>Override</strong>.
          </p>
        ) : (
          <div className="np-challenge-picks-list">
            {userPicks.map((pick) => (
              <div key={pick.id} className="np-challenge-pick-row np-card-muted">
                <div>
                  <Link href={`/players/${encodeURIComponent(pick.playerId)}`} style={{ color: "var(--np-text-strong)", fontWeight: 600, textDecoration: "none" }}>
                    {pick.playerName}
                  </Link>
                  <div style={{ color: "var(--np-text-dim)", fontSize: "0.78rem", marginTop: 2 }}>
                    {pick.pickType === "agree" ? "Agreed with model" : resolveOverrideReasonLabel(pick.overrideReason)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="np-stat-value is-signal" style={{ fontSize: "0.88rem" }}>
                    {pick.pickType === "override" ? pick.userPprProjection?.toFixed(1) : pick.modelPprProjection.toFixed(1)} PPR
                  </div>
                  <div className="np-metric-sublabel">Model {pick.modelPprProjection.toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="np-card" style={{ padding: "1rem 1.1rem" }}>
        <div style={{ color: "var(--np-text-strong)", fontWeight: 600, marginBottom: "0.75rem" }}>This week&apos;s slate</div>
        <div className="np-player-card-grid">
          {challengePlayers.map((player, index) => (
            <NovaPredictPlayerProjectionCard key={player.id} player={player} variant="compact" priorityImage={index < 3} />
          ))}
        </div>
      </article>

      <article className="np-card" style={{ padding: "1rem 1.1rem" }}>
        <div style={{ marginBottom: "0.7rem", color: "var(--np-text-strong)", fontWeight: 600 }}>Season benchmarks</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.45rem" }}>
          {metrics.map((metric) => (
            <div key={metric.label} className="np-card-muted" style={{ padding: "0.6rem 0.65rem" }}>
              <div className="np-stat-value">{metric.value}</div>
              <div className="np-stat-label" style={{ marginTop: 4 }}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
