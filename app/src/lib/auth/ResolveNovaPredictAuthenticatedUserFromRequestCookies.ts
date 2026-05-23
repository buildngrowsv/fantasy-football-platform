/*
  ResolveNovaPredictAuthenticatedUserFromRequestCookies.ts
  --------------------------------------------------------
  Server-side helper for layouts and API routes — reads np_session cookie.
*/

import { cookies } from "next/headers";

import { FindNovaPredictAuthenticatedUserBySessionTokenFromDatabase } from "@/lib/auth/FindNovaPredictAuthenticatedUserBySessionTokenFromDatabase";
import { NOVA_PREDICT_AUTH_SESSION_COOKIE_NAME } from "@/lib/auth/NovaPredictAuthConstants";
import type { NovaPredictAuthenticatedUserRecord } from "@/lib/db/schema";

export async function ResolveNovaPredictAuthenticatedUserFromRequestCookies(): Promise<NovaPredictAuthenticatedUserRecord | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(NOVA_PREDICT_AUTH_SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  return FindNovaPredictAuthenticatedUserBySessionTokenFromDatabase(sessionToken);
}
