import type { ReactNode } from "react";
import Link from "next/link";
import { NovaPredictAppSidebarNavigationPanel } from "@/components/layout/NovaPredictAppSidebarNavigationPanel";
import { NovaPredictWeeklyDecisionFlowStrip } from "@/components/layout/NovaPredictWeeklyDecisionFlowStrip";
import { NovaPredictPlayerHeadshotAvatar } from "@/components/media/NovaPredictPlayerHeadshotAvatar";
import { getNovaPredictPlayerRecords } from "@/lib/db/queries";
import {
  NOVA_PREDICT_CURRENT_WEEK_LABEL,
  NOVA_PREDICT_SIDEBAR_INTRO_COPY,
  NOVA_PREDICT_TOP_SIGNALS_ACTION_LABEL,
  NOVA_PREDICT_TOP_SIGNALS_HEADING,
} from "@/lib/copy/NovaPredictPlatformUserFacingCopyCatalog";

export const dynamic = "force-dynamic";

/*
  (app)/layout.tsx
  ----------------
  App shell: desktop sidebar with grouped IA + top signals, weekly flow strip,
  and main content column. Mobile navigation lives in NovaPredictSiteHeader
  (bottom bar + drawer) — sidebar hides under 900px via CSS.
*/

export default async function AppLayout({ children }: { children: ReactNode }) {
  const topPlayers = await getNovaPredictPlayerRecords(4);

  return (
    <div className="np-page-shell np-app-shell">
      <aside className="np-app-sidebar np-card">
        <div className="np-app-sidebar-intro">
          <p className="np-kicker">{NOVA_PREDICT_CURRENT_WEEK_LABEL}</p>
          <p className="np-app-sidebar-intro-copy">{NOVA_PREDICT_SIDEBAR_INTRO_COPY}</p>
        </div>

        <NovaPredictAppSidebarNavigationPanel />

        <div className="np-app-sidebar-signals np-card-muted">
          <div className="np-app-sidebar-signals-header">
            <span>{NOVA_PREDICT_TOP_SIGNALS_HEADING}</span>
            <Link href="/slate" className="np-app-sidebar-signals-action">
              {NOVA_PREDICT_TOP_SIGNALS_ACTION_LABEL}
            </Link>
          </div>

          <div className="np-app-sidebar-signals-list">
            {topPlayers.map((player) => (
              <Link key={player.id} href={`/players/${encodeURIComponent(player.id)}`} className="np-app-sidebar-signal-row">
                <NovaPredictPlayerHeadshotAvatar
                  fullName={player.fullName}
                  position={player.position}
                  headshotUrl={player.headshotUrl}
                  localHeadshotPath={player.localHeadshotPath}
                  initials={player.initials}
                  size={36}
                  showTeamRing
                  teamPrimaryColor={player.teamPrimaryColor}
                />
                <div className="np-app-sidebar-signal-copy">
                  <div className="np-app-sidebar-signal-name">{player.fullName}</div>
                  <div className="np-app-sidebar-signal-meta">
                    {player.novaPprProjection.toFixed(1)} · {player.marketSignalLabel}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <div className="np-app-main">
        <NovaPredictWeeklyDecisionFlowStrip />
        {children}
      </div>
    </div>
  );
}
