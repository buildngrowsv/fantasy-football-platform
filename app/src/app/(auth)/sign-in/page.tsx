import { redirect } from "next/navigation";
import { Suspense } from "react";

import { NovaPredictEmailPasswordSignInForm } from "@/components/auth/NovaPredictEmailPasswordSignInForm";
import { ResolveNovaPredictAuthenticatedUserFromRequestCookies } from "@/lib/auth/ResolveNovaPredictAuthenticatedUserFromRequestCookies";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Sign in",
  description: "Sign in to NovaPredict to access your dashboard, picks, and league imports.",
  path: "/sign-in",
  noIndex: true,
});

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const existingUser = await ResolveNovaPredictAuthenticatedUserFromRequestCookies();
  const resolvedSearchParams = await searchParams;
  const returnTo = resolvedSearchParams.returnTo?.startsWith("/") ? resolvedSearchParams.returnTo : "/dashboard";

  if (existingUser) {
    redirect(returnTo);
  }

  return (
    <>
      <p className="np-kicker np-auth-eyebrow">Welcome back</p>
      <h1 className="np-auth-title">Sign in</h1>
      <p className="np-auth-lead">Pick up where you left off — slate, challenge board, and accountability.</p>
      <Suspense fallback={<p className="np-auth-lead">Loading sign-in…</p>}>
        <NovaPredictEmailPasswordSignInForm returnTo={returnTo} />
      </Suspense>
    </>
  );
}
