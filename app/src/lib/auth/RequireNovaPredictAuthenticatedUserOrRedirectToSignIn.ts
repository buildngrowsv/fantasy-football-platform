/*
  RequireNovaPredictAuthenticatedUserOrRedirectToSignIn.ts
  --------------------------------------------------------
  Server-side guard for subscriber-only surfaces (Challenge, league import).

  Why redirect instead of a client modal:
  - Challenge picks and league tokens must never render for anonymous users.
  - Next.js server redirect keeps protected HTML out of the initial response.

  Called by:
  - app/(app)/challenge/page.tsx
  - app/(app)/import/page.tsx
*/

import { redirect } from "next/navigation";

import { ResolveNovaPredictAuthenticatedUserFromRequestCookies } from "@/lib/auth/ResolveNovaPredictAuthenticatedUserFromRequestCookies";
import type { NovaPredictAuthenticatedUserRecord } from "@/lib/db/schema";

export async function RequireNovaPredictAuthenticatedUserOrRedirectToSignIn(
  returnPath: string,
): Promise<NovaPredictAuthenticatedUserRecord> {
  const authenticatedUser = await ResolveNovaPredictAuthenticatedUserFromRequestCookies();

  if (!authenticatedUser) {
    const safeReturnPath = returnPath.startsWith("/") ? returnPath : "/dashboard";
    redirect(`/sign-in?returnTo=${encodeURIComponent(safeReturnPath)}`);
  }

  return authenticatedUser;
}
