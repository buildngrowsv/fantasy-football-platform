"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SITE_NAVIGATION_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/slate", label: "Pick Slate" },
  { href: "/accountability", label: "Accountability" },
  { href: "/challenge", label: "Challenge" },
  { href: "/experts", label: "Experts" },
  { href: "/import", label: "Import" },
  { href: "/admin", label: "Admin" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--np-border-subtle)",
        background: "rgba(9, 11, 17, 0.92)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="np-page-shell" style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "0.95rem 0" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginRight: "0.8rem" }}>
          <Image src="/assets/brand/novapredict-logo.svg" alt="NovaPredict" width={140} height={28} priority style={{ height: 28, width: "auto" }} />
        </Link>

        <nav style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
          {SITE_NAVIGATION_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  borderRadius: "999px",
                  border: isActive ? "1px solid rgba(0, 210, 140, 0.35)" : "1px solid transparent",
                  background: isActive ? "rgba(0, 210, 140, 0.08)" : "transparent",
                  color: isActive ? "var(--np-accent)" : "var(--np-text-muted)",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "0.45rem 0.8rem",
                  transition: "all 140ms ease",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
