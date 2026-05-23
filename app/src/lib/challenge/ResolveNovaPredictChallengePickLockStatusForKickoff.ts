/*
  ResolveNovaPredictChallengePickLockStatusForKickoff.ts
  ------------------------------------------------------
  Determines whether Challenge picks are locked for a team based on ESPN kickoff time.

  Spec: lock 90 minutes before kickoff. When kickoff is unknown we allow picks so ingest
  gaps do not block the entire product — but we surface "lock time pending" in the UI.
*/

import { NOVA_PREDICT_CHALLENGE_LOCK_MINUTES_BEFORE_KICKOFF } from "@/lib/challenge/NovaPredictChallengePickConstants";

export interface NovaPredictChallengePickLockStatusRecord {
  isLocked: boolean;
  kickoffAt: Date | null;
  lockAt: Date | null;
  minutesUntilLock: number | null;
  lockReason: string | null;
}

export function ResolveNovaPredictChallengePickLockStatusForKickoff(
  kickoffAt: Date | null,
  now: Date = new Date(),
): NovaPredictChallengePickLockStatusRecord {
  if (!kickoffAt) {
    return {
      isLocked: false,
      kickoffAt: null,
      lockAt: null,
      minutesUntilLock: null,
      lockReason: null,
    };
  }

  const lockAt = new Date(kickoffAt.getTime() - NOVA_PREDICT_CHALLENGE_LOCK_MINUTES_BEFORE_KICKOFF * 60 * 1000);
  const millisecondsUntilLock = lockAt.getTime() - now.getTime();
  const isLocked = millisecondsUntilLock <= 0;

  return {
    isLocked,
    kickoffAt,
    lockAt,
    minutesUntilLock: isLocked ? 0 : Math.ceil(millisecondsUntilLock / 60_000),
    lockReason: isLocked ? "Picks locked — game starts within 90 minutes." : null,
  };
}
