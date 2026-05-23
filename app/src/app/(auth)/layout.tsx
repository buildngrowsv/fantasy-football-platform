import type { ReactNode } from "react";

/*
  (auth)/layout.tsx
  -----------------
  Centered card layout for sign-in and sign-up — no app sidebar noise.
*/

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="np-auth-page">
      <div className="np-auth-card np-card">{children}</div>
    </div>
  );
}
