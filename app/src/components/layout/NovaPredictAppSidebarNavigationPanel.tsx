"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { NOVA_PREDICT_APP_NAVIGATION_GROUPS } from "@/lib/navigation/NovaPredictNavigationLinkCatalog";
import { ResolveNovaPredictNavigationLinkIsContextuallyActive } from "@/lib/navigation/ResolveNovaPredictNavigationLinkIsActive";

/*
  NovaPredictAppSidebarNavigationPanel.tsx
  ----------------------------------------
  Desktop-only sticky sidebar for `(app)` routes. Replaces the old uppercase link
  stack that had no active state and duplicated header destinations.

  Rendered from (app)/layout.tsx with server-fetched "Top Nova Signals" below.
*/

export function NovaPredictAppSidebarNavigationPanel() {
  const pathname = usePathname();

  return (
    <nav className="np-app-sidebar-nav" aria-label="Site sections">
      {NOVA_PREDICT_APP_NAVIGATION_GROUPS.map((group) => (
        <section key={group.id} className="np-app-sidebar-group">
          <h2 className="np-app-sidebar-group-label">{group.label}</h2>
          <div className="np-app-sidebar-links">
            {group.links.map((link) => {
              const isActive = ResolveNovaPredictNavigationLinkIsContextuallyActive(pathname, link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`np-app-sidebar-link${isActive ? " is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  title={link.description}
                >
                  <span className="np-app-sidebar-link-icon">
                    <Icon size={17} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="np-app-sidebar-link-copy">
                    <strong>{link.label}</strong>
                    <small>{link.description}</small>
                  </span>
                  <ChevronRight size={14} className="np-app-sidebar-link-chevron" aria-hidden />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
