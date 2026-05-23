import type { ReactNode } from "react";
import Link from "next/link";
import { getNovaPredictPlayerRecords } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const APP_SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/slate", label: "Pick Slate" },
  { href: "/accountability", label: "Accountability" },
  { href: "/challenge", label: "Challenge" },
  { href: "/experts", label: "Experts" },
  { href: "/import", label: "Import" },
  { href: "/admin", label: "Signal Weights" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const topPlayers = await getNovaPredictPlayerRecords(4);

  return (
    <div className="np-page-shell" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1rem" }}>
      <aside className="np-card" style={{ padding: "1rem", alignSelf: "start", position: "sticky", top: "5.5rem" }}>
        <p className="np-pill np-pill-cyan" style={{ marginBottom: "0.8rem" }}>
          App Navigation
        </p>
        <nav style={{ display: "grid", gap: "0.45rem", marginBottom: "1rem" }}>
          {APP_SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="np-card-muted"
              style={{ padding: "0.6rem 0.75rem", color: "var(--np-text-muted)", fontSize: "0.82rem", letterSpacing: "0.04em", textTransform: "uppercase" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="np-card-muted" style={{ padding: "0.75rem" }}>
          <div style={{ fontSize: "0.66rem", color: "var(--np-text-dim)", textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: "0.65rem" }}>
            Top Nova Signals
          </div>
          <div style={{ display: "grid", gap: "0.45rem" }}>
            {topPlayers.map((player) => (
              <div key={player.id}>
                <div style={{ fontSize: "0.84rem", color: "var(--np-text-strong)", fontWeight: 600 }}>
                  {player.fullName}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--np-text-dim)", fontFamily: "var(--font-jetbrains-mono)" }}>
                  {player.novaPprProjection.toFixed(1)} · {player.marketSignalLabel}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
