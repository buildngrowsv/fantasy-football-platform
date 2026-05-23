import { NextResponse } from "next/server";

import { ResolveNovaPredictChallengePickLockStatusForKickoff } from "@/lib/challenge/ResolveNovaPredictChallengePickLockStatusForKickoff";
import { ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase } from "@/lib/players/ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase";
import { FetchNovaPredictEarliestSlateKickoffLockFromDatabase } from "@/lib/slate/FetchNovaPredictEarliestSlateKickoffLockFromDatabase";

function formatCountdownLabel(minutesUntilLock: number | null, isLocked: boolean): string {
  if (isLocked) {
    return "Locked";
  }
  if (minutesUntilLock === null) {
    return "Lock time pending";
  }
  if (minutesUntilLock >= 60) {
    const hours = Math.floor(minutesUntilLock / 60);
    const minutes = minutesUntilLock % 60;
    return `${hours}h ${minutes}m to lock`;
  }
  return `${minutesUntilLock}m to lock`;
}

export async function GET() {
  const [slateContext, earliestLock] = await Promise.all([
    ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase(),
    FetchNovaPredictEarliestSlateKickoffLockFromDatabase(),
  ]);

  const lockStatus = ResolveNovaPredictChallengePickLockStatusForKickoff(earliestLock?.kickoffAt ?? null);

  return NextResponse.json({
    ok: true,
    season: earliestLock?.season ?? slateContext.season,
    week: earliestLock?.week ?? slateContext.week,
    weekLabel: `Week ${earliestLock?.week ?? slateContext.week}`,
    lockLabel: formatCountdownLabel(lockStatus.minutesUntilLock, lockStatus.isLocked),
    isLocked: lockStatus.isLocked,
    kickoffAt: earliestLock?.kickoffAt?.toISOString() ?? null,
    lockAt: earliestLock?.lockAt?.toISOString() ?? null,
  });
}
