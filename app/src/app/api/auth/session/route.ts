import { NextResponse } from "next/server";

import { ResolveNovaPredictAuthenticatedUserFromRequestCookies } from "@/lib/auth/ResolveNovaPredictAuthenticatedUserFromRequestCookies";

export async function GET() {
  try {
    const user = await ResolveNovaPredictAuthenticatedUserFromRequestCookies();

    if (!user) {
      return NextResponse.json({ ok: true, authenticated: false, user: null });
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
