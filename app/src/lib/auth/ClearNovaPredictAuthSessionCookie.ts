/*
  ClearNovaPredictAuthSessionCookie.ts
  ------------------------------------
  Signs user out — deletes DB session and clears HTTP-only cookie.
*/

import { cookies } from "next/headers";

import { DeleteNovaPredictUserSessionByTokenFromDatabase } from "@/lib/auth/DeleteNovaPredictUserSessionByTokenFromDatabase";
import { NOVA_PREDICT_AUTH_SESSION_COOKIE_NAME } from "@/lib/auth/NovaPredictAuthConstants";

export async function ClearNovaPredictAuthSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(NOVA_PREDICT_AUTH_SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await DeleteNovaPredictUserSessionByTokenFromDatabase(sessionToken);
  }

  cookieStore.set(NOVA_PREDICT_AUTH_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
