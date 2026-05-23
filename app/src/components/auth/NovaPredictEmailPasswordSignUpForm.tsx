"use client";

/*
  NovaPredictEmailPasswordSignUpForm.tsx
  --------------------------------------
  Client form for POST /api/auth/sign-up — redirects to dashboard on success.

  Challenge the Model and league import require accounts; this is the entry point
  before Stripe subscriptions land in a later phase.
*/

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function NovaPredictEmailPasswordSignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.error ?? "Sign-up failed. Try again.");
        return;
      }

      router.push("/dashboard");
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
        <span>Display name (optional)</span>
        <input
          type="text"
          name="displayName"
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="How you appear on leaderboards"
        />
      </label>

      <label className="np-auth-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
        />
      </label>

      {errorMessage ? <p className="np-auth-error">{errorMessage}</p> : null}

      <button type="submit" className="np-btn np-btn-primary np-auth-submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      <p className="np-auth-footer">
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </form>
  );
}
