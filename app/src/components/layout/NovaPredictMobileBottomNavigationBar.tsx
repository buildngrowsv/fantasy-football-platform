"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListNovaPredictMobileBottomBarLinks,
  ListNovaPredictMobileDrawerLinks,
  NOVA_PREDICT_MOBILE_MORE_NAV_ICON,
  ResolveNovaPredictRouteUsesAppShell,
} from "@/lib/navigation/NovaPredictNavigationLinkCatalog";
import { ResolveNovaPredictNavigationLinkIsContextuallyActive } from "@/lib/navigation/ResolveNovaPredictNavigationLinkIsActive";

/*
  NovaPredictMobileBottomNavigationBar.tsx
  ----------------------------------------
  Fixed five-tab bar for app routes on viewports ≤900px — mirrors the mobile
  design comps (novapredect_home_mobile.html) where primary workflows are thumb-
  reachable: Dashboard, Slate, Challenge, Accountability, More.

  Mounted from NovaPredictSiteHeader when pathname is an app-shell route so we
  do not duplicate mount logic in every page.
*/

export function NovaPredictMobileBottomNavigationBar() {
  const pathname = usePathname();

  if (!ResolveNovaPredictRouteUsesAppShell(pathname)) {
    return null;
  }

  const primaryLinks = ListNovaPredictMobileBottomBarLinks();
  const overflowLinks = ListNovaPredictMobileDrawerLinks();
  const overflowIsActive = overflowLinks.some((link) => ResolveNovaPredictNavigationLinkIsContextuallyActive(pathname, link.href));
  const MoreIcon = NOVA_PREDICT_MOBILE_MORE_NAV_ICON;

  return (
    <nav className="np-mobile-bottom-nav" aria-label="Primary mobile navigation">
      {primaryLinks.map((link) => {
        const isActive = ResolveNovaPredictNavigationLinkIsContextuallyActive(pathname, link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`np-mobile-bottom-nav-item${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="np-mobile-bottom-nav-icon-wrap">
              <Icon size={20} strokeWidth={1.75} aria-hidden />
              {link.showNotificationDot ? <span className="np-mobile-bottom-nav-dot" aria-hidden /> : null}
            </span>
            <span className="np-mobile-bottom-nav-label">{link.shortLabel ?? link.label}</span>
          </Link>
        );
      })}

      <Link
        href="/experts"
        className={`np-mobile-bottom-nav-item${overflowIsActive ? " is-active" : ""}`}
        aria-label="More"
      >
        <span className="np-mobile-bottom-nav-icon-wrap">
          <MoreIcon size={20} strokeWidth={1.75} aria-hidden />
        </span>
        <span className="np-mobile-bottom-nav-label">More</span>
      </Link>
    </nav>
  );
}
