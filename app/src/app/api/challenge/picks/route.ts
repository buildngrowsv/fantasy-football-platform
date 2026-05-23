import { NextResponse } from "next/server";

import { ResolveNovaPredictChallengePickLockStatusForKickoff } from "@/lib/challenge/ResolveNovaPredictChallengePickLockStatusForKickoff";
import { ListNovaPredictUserChallengePicksWithScoresForWeekFromDatabase } from "@/lib/challenge/ListNovaPredictUserChallengePicksWithScoresForWeekFromDatabase";
import { UpsertNovaPredictUserChallengePickIntoDatabase } from "@/lib/challenge/UpsertNovaPredictUserChallengePickIntoDatabase";
import { NovaPredictChallengePickSubmissionInputSchema } from "@/lib/challenge/ValidateNovaPredictChallengePickSubmissionInput";
import { ResolveNovaPredictAuthenticatedUserFromRequestCookies } from "@/lib/auth/ResolveNovaPredictAuthenticatedUserFromRequestCookies";
import { ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase } from "@/lib/players/ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase";
import { FetchNovaPredictTeamKickoffAtFromDatabase } from "@/lib/slate/FetchNovaPredictTeamKickoffAtFromDatabase";

export async function GET(request: Request) {
  const authenticatedUser = await ResolveNovaPredictAuthenticatedUserFromRequestCookies();
  if (!authenticatedUser) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const slateContext = await ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase();
  const season = Number.parseInt(url.searchParams.get("season") ?? String(slateContext.season), 10);
  const week = Number.parseInt(url.searchParams.get("week") ?? String(slateContext.week), 10);

  const picks = await ListNovaPredictUserChallengePicksWithScoresForWeekFromDatabase(
    authenticatedUser.id,
    season,
    week,
  );

  return NextResponse.json({ ok: true, season, week, picks });
}

export async function POST(request: Request) {
  const authenticatedUser = await ResolveNovaPredictAuthenticatedUserFromRequestCookies();
  if (!authenticatedUser) {
    return NextResponse.json({ ok: false, error: "Sign in to submit Challenge picks." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = NovaPredictChallengePickSubmissionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid pick input" },
        { status: 400 },
      );
    }

    const kickoffAt = await FetchNovaPredictTeamKickoffAtFromDatabase(
      parsed.data.playerTeam,
      parsed.data.season,
      parsed.data.week,
    );
    const lockStatus = ResolveNovaPredictChallengePickLockStatusForKickoff(kickoffAt);

    if (lockStatus.isLocked) {
      return NextResponse.json(
        { ok: false, error: lockStatus.lockReason ?? "Picks are locked for this player's game." },
        { status: 423 },
      );
    }

    const savedPick = await UpsertNovaPredictUserChallengePickIntoDatabase({
      novapredictUserId: authenticatedUser.id,
      playerId: parsed.data.playerId,
      playerName: parsed.data.playerName,
      playerTeam: parsed.data.playerTeam,
      playerPosition: parsed.data.playerPosition,
      season: parsed.data.season,
      week: parsed.data.week,
      pickType: parsed.data.pickType,
      modelPprProjection: parsed.data.modelPprProjection,
      userPprProjection:
        parsed.data.pickType === "override" ? (parsed.data.userPprProjection ?? null) : parsed.data.modelPprProjection,
      overrideReason: parsed.data.pickType === "override" ? (parsed.data.overrideReason ?? null) : null,
    });

    return NextResponse.json({ ok: true, pickId: savedPick.id });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
