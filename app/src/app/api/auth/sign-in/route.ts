import { NextResponse } from "next/server";

import { CreateNovaPredictAuthSessionForUser } from "@/lib/auth/CreateNovaPredictAuthSessionForUser";
import { FindNovaPredictUserRecordByEmailFromDatabase } from "@/lib/auth/FindNovaPredictUserRecordByEmailFromDatabase";
import { VerifyNovaPredictUserPasswordWithBcrypt } from "@/lib/auth/VerifyNovaPredictUserPasswordWithBcrypt";
import { NovaPredictEmailPasswordSignInInputSchema } from "@/lib/auth/ValidateNovaPredictEmailPasswordSignInInput";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = NovaPredictEmailPasswordSignInInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid sign-in input" },
        { status: 400 },
      );
    }

    const userRecord = await FindNovaPredictUserRecordByEmailFromDatabase(parsed.data.email);
    if (!userRecord) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    const passwordMatches = await VerifyNovaPredictUserPasswordWithBcrypt(
      parsed.data.password,
      userRecord.passwordHash,
    );

    if (!passwordMatches) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    await CreateNovaPredictAuthSessionForUser(userRecord.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
