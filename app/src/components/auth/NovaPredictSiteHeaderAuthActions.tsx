"use client";

/*
  NovaPredictSiteHeaderAuthActions.tsx
  ------------------------------------
  Sign in / sign up / account menu in the global header.

  Fetches /api/auth/session on mount so marketing pages show the right CTA
  without making the entire header a server component.
*/

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthSessionUser {
  email: string;
  displayName: string | null;
}

export function NovaPredictSiteHeaderAuthActions() {
  const router = useRouter();
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        const payload = (await response.json()) as {
          authenticated: boolean;
          user: AuthSessionUser | null;
        };
        if (!cancelled && payload.authenticated && payload.user) {
          setUser(payload.user);
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (!loaded) {
    return <div className="np-site-header-auth-placeholder" aria-hidden />;
  }

  if (user) {
    const label = user.displayName ?? user.email.split("@")[0];
    return (
      <div className="np-site-header-auth np-site-header-auth--signed-in">
        <Link href="/dashboard" className="np-site-header-auth-user" title={user.email}>
          {label}
        </Link>
        <button type="button" className="np-site-header-auth-signout np-btn-secondary np-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="np-site-header-auth">
      <Link href="/sign-in" className="np-site-header-auth-link">
        Sign in
      </Link>
      <Link href="/sign-up" className="np-btn np-btn-primary np-site-header-cta">
        Sign up
      </Link>
    </div>
  );
}
