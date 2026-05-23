import { redirect } from "next/navigation";

import { NovaPredictEmailPasswordSignUpForm } from "@/components/auth/NovaPredictEmailPasswordSignUpForm";
import { ResolveNovaPredictAuthenticatedUserFromRequestCookies } from "@/lib/auth/ResolveNovaPredictAuthenticatedUserFromRequestCookies";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Sign up",
  description: "Create your NovaPredict account to challenge the model and import your leagues.",
  path: "/sign-up",
  noIndex: true,
});

export default async function SignUpPage() {
  const existingUser = await ResolveNovaPredictAuthenticatedUserFromRequestCookies();
  if (existingUser) {
    redirect("/dashboard");
  }

  return (
    <>
      <p className="np-kicker np-auth-eyebrow">Get started</p>
      <h1 className="np-auth-title">Create your account</h1>
      <p className="np-auth-lead">
        Save picks, import leagues, and track your edge against the model every week.
      </p>
      <NovaPredictEmailPasswordSignUpForm />
    </>
  );
}
