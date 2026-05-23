"use client";

import { useEffect, useState } from "react";

/*
  NovaPredictWeekContextStatusStrip.tsx
  -------------------------------------
  Live week + lock countdown from GET /api/slate/context (ESPN kickoff ingest).

  Replaces static copy catalog values once weekly_team_matchups.kickoff_at is populated.
*/

interface SlateContextPayload {
  weekLabel: string;
  lockLabel: string;
  isLocked: boolean;
}

export function NovaPredictWeekContextStatusStrip() {
  const [context, setContext] = useState<SlateContextPayload>({
    weekLabel: "Week —",
    lockLabel: "Loading lock…",
    isLocked: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSlateContext() {
      try {
        const response = await fetch("/api/slate/context");
        const payload = (await response.json()) as SlateContextPayload & { ok?: boolean };
        if (!cancelled && payload.ok !== false) {
          setContext({
            weekLabel: payload.weekLabel,
            lockLabel: payload.lockLabel,
            isLocked: payload.isLocked,
          });
        }
      } catch {
        if (!cancelled) {
          setContext({
            weekLabel: "Week —",
            lockLabel: "Lock time pending",
            isLocked: false,
          });
        }
      }
    }

    void loadSlateContext();
    const intervalId = window.setInterval(() => {
      void loadSlateContext();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="np-week-context-strip" aria-label="Current NFL week">
      <span className="np-week-context-week">{context.weekLabel}</span>
      <span className={`np-week-context-lock${context.isLocked ? " is-locked" : ""}`}>
        <span className="np-week-context-lock-dot" aria-hidden />
        {context.lockLabel}
      </span>
    </div>
  );
}
