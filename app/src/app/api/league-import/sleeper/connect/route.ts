import { NextResponse } from "next/server";
import { z } from "zod";

import { ResolveNovaPredictAuthenticatedUserFromRequestCookies } from "@/lib/auth/ResolveNovaPredictAuthenticatedUserFromRequestCookies";
import { UpsertNovaPredictSleeperLeagueConnectionForUserIntoDatabase } from "@/lib/league-import/UpsertNovaPredictSleeperLeagueConnectionForUserIntoDatabase";

const ConnectSleeperLeaguesRequestSchema = z.object({
  sleeperUserId: z.string().min(1),
  sleeperUsername: z.string().min(1),
  season: z.number().int(),
  leagues: z
    .array(
      z.object({
        leagueId: z.string().min(1),
        leagueName: z.string().min(1),
      }),
    )
    .min(1, "Select at least one league"),
});

export async function POST(request: Request) {
  const authenticatedUser = await ResolveNovaPredictAuthenticatedUserFromRequestCookies();
  if (!authenticatedUser) {
    return NextResponse.json({ ok: false, error: "Sign in to import leagues." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = ConnectSleeperLeaguesRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const connectedLeagueIds: string[] = [];

    for (const league of parsed.data.leagues) {
      const inserted = await UpsertNovaPredictSleeperLeagueConnectionForUserIntoDatabase({
        novapredictUserId: authenticatedUser.id,
        sleeperUserId: parsed.data.sleeperUserId,
        sleeperUsername: parsed.data.sleeperUsername,
        externalLeagueId: league.leagueId,
        leagueName: league.leagueName,
        season: parsed.data.season,
      });
      connectedLeagueIds.push(inserted.id);
    }

    return NextResponse.json({
      ok: true,
      connectedCount: connectedLeagueIds.length,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
