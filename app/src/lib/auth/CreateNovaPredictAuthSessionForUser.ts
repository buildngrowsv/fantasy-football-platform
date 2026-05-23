/*
  CreateNovaPredictAuthSessionForUser.ts
  --------------------------------------
  Orchestrates session token generation + DB insert + cookie write after sign-up/sign-in.
*/

import { cookies } from "next/headers";

import { GenerateNovaPredictAuthSessionToken } from "@/lib/auth/GenerateNovaPredictAuthSessionToken";
import { InsertNovaPredictUserSessionIntoDatabase } from "@/lib/auth/InsertNovaPredictUserSessionIntoDatabase";
import {
  NOVA_PREDICT_AUTH_SESSION_COOKIE_NAME,
  NOVA_PREDICT_AUTH_SESSION_DURATION_MS,
} from "@/lib/auth/NovaPredictAuthConstants";

export async function CreateNovaPredictAuthSessionForUser(userId: string): Promise<string> {
  const sessionToken = GenerateNovaPredictAuthSessionToken();
  const expiresAt = new Date(Date.now() + NOVA_PREDICT_AUTH_SESSION_DURATION_MS);

  await InsertNovaPredictUserSessionIntoDatabase(sessionToken, userId, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(NOVA_PREDICT_AUTH_SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return sessionToken;
}
