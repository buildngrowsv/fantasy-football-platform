import { NextResponse } from "next/server";
import { z } from "zod";

import { ResolveNovaPredictAuthenticatedUserFromRequestCookies } from "@/lib/auth/ResolveNovaPredictAuthenticatedUserFromRequestCookies";
import { NOVA_PREDICT_NFL_SEASON } from "@/lib/constants/NovaPredictNflSeasonConstants";
import { FetchSleeperLeaguesForUserFromPublicApi } from "@/lib/sleeper/FetchSleeperLeaguesForUserFromPublicApi";
import { FetchSleeperUserProfileByUsernameFromPublicApi } from "@/lib/sleeper/FetchSleeperUserProfileByUsernameFromPublicApi";

const DiscoverSleeperLeaguesRequestSchema = z.object({
  username: z.string().trim().min(2, "Enter your Sleeper username").max(64),
  season: z.number().int().min(2017).max(2030).optional(),
});

export async function POST(request: Request) {
  const authenticatedUser = await ResolveNovaPredictAuthenticatedUserFromRequestCookies();
  if (!authenticatedUser) {
    return NextResponse.json({ ok: false, error: "Sign in to import leagues." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = DiscoverSleeperLeaguesRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const season = parsed.data.season ?? NOVA_PREDICT_NFL_SEASON;
    const sleeperUser = await FetchSleeperUserProfileByUsernameFromPublicApi(parsed.data.username);

    if (!sleeperUser) {
      return NextResponse.json(
        { ok: false, error: "Sleeper username not found. Check spelling and try again." },
        { status: 404 },
      );
    }

    let leagues = await FetchSleeperLeaguesForUserFromPublicApi(sleeperUser.userId, season);
    let resolvedSeason = season;

    if (leagues.length === 0 && season > 2017) {
      const fallbackSeason = season - 1;
      const fallbackLeagues = await FetchSleeperLeaguesForUserFromPublicApi(sleeperUser.userId, fallbackSeason);
      if (fallbackLeagues.length > 0) {
        leagues = fallbackLeagues;
        resolvedSeason = fallbackSeason;
      }
    }

    return NextResponse.json({
      ok: true,
      sleeperUser,
      season: resolvedSeason,
      leagues,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
