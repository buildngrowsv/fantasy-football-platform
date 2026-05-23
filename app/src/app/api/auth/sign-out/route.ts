import { NextResponse } from "next/server";

import { ClearNovaPredictAuthSessionCookie } from "@/lib/auth/ClearNovaPredictAuthSessionCookie";

export async function POST() {
  try {
    await ClearNovaPredictAuthSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
