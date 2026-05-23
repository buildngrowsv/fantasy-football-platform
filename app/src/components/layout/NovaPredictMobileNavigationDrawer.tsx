"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NOVA_PREDICT_APP_NAVIGATION_GROUPS,
  NOVA_PREDICT_MARKETING_HEADER_LINKS,
} from "@/lib/navigation/NovaPredictNavigationLinkCatalog";
import {
  ResolveNovaPredictNavigationLinkIsActive,
  ResolveNovaPredictNavigationLinkIsContextuallyActive,
} from "@/lib/navigation/ResolveNovaPredictNavigationLinkIsActive";

type NovaPredictMobileNavigationDrawerProps = {
  open: boolean;
  onClose: () => void;
  isAppShellRoute: boolean;
};

/*
  NovaPredictMobileNavigationDrawer.tsx
  -------------------------------------
  Full-height slide-over for small screens when the header hamburger is tapped.

  Marketing routes show story links + CTA; app routes expose the complete grouped
  IA (Play / Trust / Tools) because the bottom bar only fits four primaries + More.
*/

export function NovaPredictMobileNavigationDrawer({ open, onClose, isAppShellRoute }: NovaPredictMobileNavigationDrawerProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        className={`np-mobile-nav-backdrop${open ? " is-visible" : ""}`}
        aria-label="Close navigation menu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />

      <aside
        id="np-mobile-navigation-drawer"
        className={`np-mobile-nav-drawer${open ? " is-open" : ""}`}
        aria-hidden={!open}
        aria-label="Mobile navigation menu"
      >
        <div className="np-mobile-nav-drawer-header">
          <p className="np-pill np-pill-accent">Menu</p>
          <p className="np-mobile-nav-drawer-subtitle">
            {isAppShellRoute
              ? "Jump between weekly workflows, trust reports, and tools."
              : "Explore NovaPredict before you open the weekly dashboard."}
          </p>
        </div>

        {isAppShellRoute ? (
          <div className="np-mobile-nav-drawer-groups">
            {NOVA_PREDICT_APP_NAVIGATION_GROUPS.map((group) => (
              <section key={group.id} className="np-mobile-nav-drawer-group">
                <h2 className="np-mobile-nav-drawer-group-label">{group.label}</h2>
                <div className="np-mobile-nav-drawer-links">
                  {group.links.map((link) => {
                    const isActive = ResolveNovaPredictNavigationLinkIsContextuallyActive(pathname, link.href);
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`np-mobile-nav-drawer-link${isActive ? " is-active" : ""}`}
                        onClick={onClose}
                      >
                        <Icon size={18} strokeWidth={2} aria-hidden />
                        <span>
                          <strong>{link.label}</strong>
                          <small>{link.description}</small>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="np-mobile-nav-drawer-links">
            {NOVA_PREDICT_MARKETING_HEADER_LINKS.map((link) => {
              const isActive = ResolveNovaPredictNavigationLinkIsActive(pathname, link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`np-mobile-nav-drawer-link${isActive ? " is-active" : ""}`}
                  onClick={onClose}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden />
                  <span>
                    <strong>{link.label}</strong>
                    <small>{link.description}</small>
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="np-mobile-nav-drawer-footer">
          {!isAppShellRoute ? (
            <Link href="/dashboard" className="np-mobile-nav-drawer-cta np-accent-gradient" onClick={onClose}>
              Open Weekly Dashboard
            </Link>
          ) : (
            <Link href="/" className="np-mobile-nav-drawer-secondary" onClick={onClose}>
              ← Back to product overview
            </Link>
          )}

          {isAppShellRoute ? (
            <p className="np-mobile-nav-drawer-footnote">
              Tip: pin Dashboard → Slate → Challenge as your pre-lock ritual. Accountability closes the loop after Sunday.
            </p>
          ) : null}
        </div>
      </aside>
    </>
  );
}
