"use client";

/*
  NovaPredictEmailPasswordSignInForm.tsx
  --------------------------------------
  Client form for POST /api/auth/sign-in.
*/

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

interface NovaPredictEmailPasswordSignInFormProps {
  returnTo?: string;
}

export function NovaPredictEmailPasswordSignInForm({ returnTo = "/dashboard" }: NovaPredictEmailPasswordSignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedReturnTo = searchParams.get("returnTo") ?? returnTo;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.error ?? "Sign-in failed. Check your credentials.");
        return;
      }

      router.push(resolvedReturnTo.startsWith("/") ? resolvedReturnTo : "/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Network error — check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="np-auth-form" onSubmit={handleSubmit}>
      <label className="np-auth-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </label>

      <label className="np-auth-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
        />
      </label>

      {errorMessage ? <p className="np-auth-error">{errorMessage}</p> : null}

      <button type="submit" className="np-btn np-btn-primary np-auth-submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>

      <p className="np-auth-footer">
        New here? <Link href="/sign-up">Create an account</Link>
      </p>
    </form>
  );
}
