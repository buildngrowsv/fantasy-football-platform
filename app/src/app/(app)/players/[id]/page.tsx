import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NovaPredictMatchupVisualStrip } from "@/components/media/NovaPredictMatchupVisualStrip";
import { NovaPredictPlayerHeadshotAvatar } from "@/components/media/NovaPredictPlayerHeadshotAvatar";
import { NovaPredictPlayerChallengePickActions } from "@/components/players/NovaPredictPlayerChallengePickActions";
import { NovaPredictPlayerProjectionCard } from "@/components/players/NovaPredictPlayerProjectionCard";
import { NovaPredictPlayerWeeklyActualsPerformanceChart } from "@/components/players/NovaPredictPlayerWeeklyActualsPerformanceChart";
import { FindNovaPredictUserChallengePickForPlayerWeekFromDatabase } from "@/lib/challenge/FindNovaPredictUserChallengePickForPlayerWeekFromDatabase";
import { ResolveNovaPredictChallengePickLockStatusForKickoff } from "@/lib/challenge/ResolveNovaPredictChallengePickLockStatusForKickoff";
import { NOVA_PREDICT_ACCOUNTABILITY_BACKTEST_SEASON } from "@/lib/constants/NovaPredictNflSeasonConstants";
import { ComputeNovaPredictTrailingWeeklyPprSummaryFromActuals } from "@/lib/players/ComputeNovaPredictTrailingWeeklyPprSummaryFromActuals";
import { FetchNovaPredictPlayerWeeklyActualsHistoryFromDatabase } from "@/lib/players/FetchNovaPredictPlayerWeeklyActualsHistoryFromDatabase";
import { ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase } from "@/lib/players/ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase";
import { ResolveNovaPredictAuthenticatedUserFromRequestCookies } from "@/lib/auth/ResolveNovaPredictAuthenticatedUserFromRequestCookies";
import { FetchNovaPredictTeamKickoffAtFromDatabase } from "@/lib/slate/FetchNovaPredictTeamKickoffAtFromDatabase";
import type { NovaPredictPlayerRecord } from "@/lib/db/schema";
import { getNovaPredictPlayerById, getNovaPredictPlayerRecords } from "@/lib/db/queries";
import { BuildNovaPredictPlayerPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPlayerPageSiteMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const player = await getNovaPredictPlayerById(resolvedParams.id);

  if (!player) {
    return {
      title: "Player Not Found",
      robots: { index: false, follow: false },
    };
  }

  return BuildNovaPredictPlayerPageSiteMetadata(player);
}

function getTierLabel(player: NovaPredictPlayerRecord): string {
  if (player.novaPprProjection >= 23) return "Tier 1 · Start";
  if (player.novaPprProjection >= 17) return "Tier 2 · Strong Start";
  if (player.novaPprProjection >= 12) return "Tier 3 · Flex";
  return "Tier 4 · Caution";
}

export default async function PlayerCardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const player = await getNovaPredictPlayerById(resolvedParams.id);

  if (!player) {
    notFound();
  }

  const [relatedPlayers, slateContext, authenticatedUser, weeklyActuals] = await Promise.all([
    getNovaPredictPlayerRecords(5),
    ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase(),
    ResolveNovaPredictAuthenticatedUserFromRequestCookies(),
    FetchNovaPredictPlayerWeeklyActualsHistoryFromDatabase(
      player.fullName,
      player.team,
      player.position,
      10,
      NOVA_PREDICT_ACCOUNTABILITY_BACKTEST_SEASON,
    ),
  ]);

  const existingPick = authenticatedUser
    ? await FindNovaPredictUserChallengePickForPlayerWeekFromDatabase(
        authenticatedUser.id,
        player.id,
        slateContext.season,
        slateContext.week,
      )
    : null;

  const kickoffAt = await FetchNovaPredictTeamKickoffAtFromDatabase(player.team, slateContext.season, slateContext.week);
  const pickLockStatus = ResolveNovaPredictChallengePickLockStatusForKickoff(kickoffAt);

  const trailingSummary = ComputeNovaPredictTrailingWeeklyPprSummaryFromActuals(weeklyActuals);
  const modelEdge = player.novaPprProjection - player.vegasPprProjection;
  const filteredRelated = relatedPlayers.filter((candidate) => candidate.id !== player.id);

  return (
    <section className="np-page-stack">
      <article className="np-card" style={{ maxWidth: 760, margin: "0 auto", width: "100%", overflow: "hidden" }}>
        <div
          style={{
            padding: "1.2rem 1.3rem",
            borderBottom: "1px solid var(--np-border-subtle)",
            background: player.teamPrimaryColor
              ? `linear-gradient(135deg, ${player.teamPrimaryColor}18 0%, var(--np-surface-muted) 55%)`
              : "var(--np-surface-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "start", gap: "1rem" }}>
            <NovaPredictPlayerHeadshotAvatar
              fullName={player.fullName}
              position={player.position}
              headshotUrl={player.headshotUrl}
              localHeadshotPath={player.localHeadshotPath}
              initials={player.initials}
              size={96}
              showTeamRing
              teamPrimaryColor={player.teamPrimaryColor}
              priority
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.8rem" }}>
                <div>
                  <h1 className="np-page-title" style={{ fontSize: "1.75rem" }}>
                    {player.fullName}
                  </h1>
                  <div style={{ marginTop: "0.35rem" }}>
                    <NovaPredictMatchupVisualStrip
                      team={player.team}
                      opponent={player.opponent}
                      matchupLabel={player.matchupLabel}
                      logoSize={26}
                    />
                  </div>
                  <div style={{ marginTop: "0.25rem", color: "var(--np-text-dim)", fontSize: "0.78rem" }}>
                    {player.position} · Season {slateContext.season} Week {slateContext.week}
                  </div>
                </div>
                <span className="np-pill np-pill-accent">{getTierLabel(player)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "0.9rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            <div className="np-card-muted" style={{ padding: "0.75rem 0.8rem" }}>
              <div className="np-stat-label">Baseline PPR</div>
              <div className="np-stat-value is-data" style={{ marginTop: "0.25rem", fontSize: "1.8rem" }}>
                {player.vegasPprProjection.toFixed(1)}
              </div>
            </div>
            <div className="np-card-muted" style={{ padding: "0.75rem 0.8rem" }}>
              <div className="np-stat-label">NovaPredict PPR</div>
              <div className="np-stat-value is-signal" style={{ marginTop: "0.25rem", fontSize: "1.8rem" }}>
                {player.novaPprProjection.toFixed(1)}
              </div>
              <div className="np-metric-sublabel" style={{ marginTop: 4 }}>
                {modelEdge >= 0 ? "+" : ""}
                {modelEdge.toFixed(1)} vs baseline
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "1rem 1.3rem", borderBottom: "1px solid var(--np-border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.7rem" }}>
            <span className="np-kicker" style={{ margin: 0, fontSize: "0.78rem" }}>
              Recent performance
            </span>
            <span className="np-pill np-pill-cyan" style={{ padding: "0.2rem 0.55rem" }}>
              {player.marketSignalLabel}
            </span>
          </div>

          <NovaPredictPlayerWeeklyActualsPerformanceChart
            weeklyActuals={weeklyActuals}
            trailingSummary={trailingSummary}
            seasonLabel={NOVA_PREDICT_ACCOUNTABILITY_BACKTEST_SEASON}
            currentProjection={player.novaPprProjection}
          />
        </div>

        <div style={{ padding: "1rem 1.3rem", display: "grid", gap: "0.7rem" }}>
          <div className="np-card-muted" style={{ padding: "0.8rem 0.9rem" }}>
            <div className="np-stat-label">Distribution snapshot</div>
            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem" }}>
              <div>
                <div className="np-stat-label">Boom ≥ 20</div>
                <div className="np-stat-value is-signal">{player.boomProbability.toFixed(0)}%</div>
              </div>
              <div>
                <div className="np-stat-label">Bust &lt; 10</div>
                <div className="np-stat-value" style={{ color: "var(--np-danger)" }}>
                  {player.bustProbability.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="np-stat-label">Median</div>
                <div className="np-stat-value is-data">{player.novaPprProjection.toFixed(1)}</div>
              </div>
            </div>
          </div>

          <NovaPredictPlayerChallengePickActions
            playerId={player.id}
            playerName={player.fullName}
            playerTeam={player.team}
            playerPosition={player.position}
            season={slateContext.season}
            week={slateContext.week}
            modelPprProjection={player.novaPprProjection}
            isAuthenticated={Boolean(authenticatedUser)}
            isLocked={pickLockStatus.isLocked}
            lockLabel={pickLockStatus.lockReason}
            existingPick={existingPick}
          />
        </div>
      </article>

      <article className="np-card" style={{ padding: "1rem" }}>
        <h2 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.1rem" }}>Similar players</h2>
        <div className="np-player-card-grid" style={{ marginTop: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {filteredRelated.map((relatedPlayer) => (
            <NovaPredictPlayerProjectionCard key={relatedPlayer.id} player={relatedPlayer} variant="compact" />
          ))}
        </div>
      </article>
    </section>
  );
}
