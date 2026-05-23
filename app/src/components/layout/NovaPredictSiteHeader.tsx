"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import {
  ListNovaPredictAppNavigationLinks,
  NOVA_PREDICT_MARKETING_HEADER_LINKS,
  ResolveNovaPredictRouteUsesAppShell,
} from "@/lib/navigation/NovaPredictNavigationLinkCatalog";
import {
  ResolveNovaPredictNavigationLinkIsActive,
  ResolveNovaPredictNavigationLinkIsContextuallyActive,
} from "@/lib/navigation/ResolveNovaPredictNavigationLinkIsActive";
import { NovaPredictMobileBottomNavigationBar } from "@/components/layout/NovaPredictMobileBottomNavigationBar";
import { NovaPredictMobileNavigationDrawer } from "@/components/layout/NovaPredictMobileNavigationDrawer";
import { NovaPredictWeekContextStatusStrip } from "@/components/layout/NovaPredictWeekContextStatusStrip";

/*
  NovaPredictSiteHeader.tsx
  -------------------------
  Global sticky header mounted from root layout.tsx.

  Prior nav was a flat wrap of eight uppercase pills — unusable on mobile and
  duplicated the app sidebar. This header adapts by route:
  - Marketing (`/`): product story links + primary CTA
  - App shell routes: compact chrome, week badge, drawer trigger — real IA lives
    in sidebar (desktop) and bottom bar (mobile)

  Called on every page; must stay lightweight (client-only for pathname + drawer).
*/

export function NovaPredictSiteHeader() {
  const pathname = usePathname();
  const isAppShellRoute = ResolveNovaPredictRouteUsesAppShell(pathname);
  /*
    Track which pathname opened the drawer so navigation auto-closes the menu
    without a setState-in-effect (eslint react-hooks/set-state-in-effect).
  */
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const mobileMenuOpen = menuOpenPath === pathname;

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const marketingLinks = NOVA_PREDICT_MARKETING_HEADER_LINKS;
  const appQuickLinks = ListNovaPredictAppNavigationLinks().slice(0, 4);

  return (
    <>
      <header className="np-site-header">
        <div className="np-page-shell np-site-header-inner">
          <Link href="/" className="np-site-header-brand" aria-label="NovaPredict home">
            <Image
              src="/assets/brand/novapredict-logo.svg"
              alt="NovaPredict"
              width={140}
              height={28}
              priority
              className="np-site-header-logo"
            />
          </Link>

          {isAppShellRoute ? (
            <nav className="np-site-header-app-nav" aria-label="Quick links">
              {appQuickLinks.map((link) => {
                const isActive = ResolveNovaPredictNavigationLinkIsContextuallyActive(pathname, link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`np-site-header-app-link${isActive ? " is-active" : ""}`}
                    title={link.description}
                  >
                    <Icon size={15} strokeWidth={2} aria-hidden />
                    <span>{link.shortLabel ?? link.label}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <nav className="np-site-header-marketing-nav" aria-label="Explore NovaPredict">
              {marketingLinks.map((link) => {
                const isActive = ResolveNovaPredictNavigationLinkIsActive(pathname, link.href);
                return (
                  <Link key={link.href} href={link.href} className={`np-site-header-marketing-link${isActive ? " is-active" : ""}`}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="np-site-header-actions">
            {isAppShellRoute ? <NovaPredictWeekContextStatusStrip /> : null}

            {!isAppShellRoute ? (
              <Link href="/dashboard" className="np-site-header-cta np-accent-gradient np-btn">
                Open dashboard
              </Link>
            ) : null}

            <button
              type="button"
              className="np-site-header-menu-trigger"
              aria-expanded={mobileMenuOpen}
              aria-controls="np-mobile-navigation-drawer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMenuOpenPath(mobileMenuOpen ? null : pathname)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <NovaPredictMobileNavigationDrawer
        open={mobileMenuOpen}
        onClose={() => setMenuOpenPath(null)}
        isAppShellRoute={isAppShellRoute}
      />

      {isAppShellRoute ? <NovaPredictMobileBottomNavigationBar /> : null}
    </>
  );
}
