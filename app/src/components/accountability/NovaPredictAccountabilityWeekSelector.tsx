"use client";

/*
  NovaPredictAccountabilityWeekSelector.tsx
  -----------------------------------------
  Week pills for the Gradebook — filters accountability_calls from the 2024 backtest.

  Uses URL search params so filtered views are shareable and server-rendered.
*/

import Link from "next/link";

interface NovaPredictAccountabilityWeekSelectorProps {
  availableWeeks: number[];
  selectedWeek?: number;
}

export function NovaPredictAccountabilityWeekSelector({
  availableWeeks,
  selectedWeek,
}: NovaPredictAccountabilityWeekSelectorProps) {
  if (availableWeeks.length === 0) {
    return null;
  }

  return (
    <div className="np-accountability-week-selector" aria-label="Filter by NFL week">
      <Link href="/accountability" className={`np-accountability-week-btn${selectedWeek ? "" : " is-active"}`}>
        All weeks
      </Link>
      {availableWeeks.map((week) => (
        <Link
          key={week}
          href={`/accountability?week=${week}`}
          className={`np-accountability-week-btn${selectedWeek === week ? " is-active" : ""}`}
        >
          Wk {week}
        </Link>
      ))}
    </div>
  );
}
