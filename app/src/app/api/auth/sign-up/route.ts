import { NextResponse } from "next/server";

import { CreateNovaPredictAuthSessionForUser } from "@/lib/auth/CreateNovaPredictAuthSessionForUser";
import { HashNovaPredictUserPasswordWithBcrypt } from "@/lib/auth/HashNovaPredictUserPasswordWithBcrypt";
import { InsertNovaPredictUserRecordIntoDatabase } from "@/lib/auth/InsertNovaPredictUserRecordIntoDatabase";
import { NovaPredictEmailPasswordSignUpInputSchema } from "@/lib/auth/ValidateNovaPredictEmailPasswordSignUpInput";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = NovaPredictEmailPasswordSignUpInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid sign-up input" },
        { status: 400 },
      );
    }

    const passwordHash = await HashNovaPredictUserPasswordWithBcrypt(parsed.data.password);
    const insertedUser = await InsertNovaPredictUserRecordIntoDatabase({
      email: parsed.data.email,
      passwordHash,
      displayName: parsed.data.displayName ?? null,
    });

    if (!insertedUser) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists. Sign in instead." },
        { status: 409 },
      );
    }

    await CreateNovaPredictAuthSessionForUser(insertedUser.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: insertedUser.id,
        email: insertedUser.email,
        displayName: insertedUser.displayName,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
