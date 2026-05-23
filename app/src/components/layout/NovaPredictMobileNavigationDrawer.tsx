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
import { NOVA_PREDICT_CURRENT_WEEK_LABEL } from "@/lib/copy/NovaPredictPlatformUserFacingCopyCatalog";

type NovaPredictMobileNavigationDrawerProps = {
  open: boolean;
  onClose: () => void;
  isAppShellRoute: boolean;
};

export function NovaPredictMobileNavigationDrawer({ open, onClose, isAppShellRoute }: NovaPredictMobileNavigationDrawerProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        className={`np-mobile-nav-backdrop${open ? " is-visible" : ""}`}
        aria-label="Close menu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />

      <aside
        id="np-mobile-navigation-drawer"
        className={`np-mobile-nav-drawer${open ? " is-open" : ""}`}
        aria-hidden={!open}
        aria-label="Site menu"
      >
        <div className="np-mobile-nav-drawer-header">
          <p className="np-pill np-pill-accent">{isAppShellRoute ? NOVA_PREDICT_CURRENT_WEEK_LABEL : "NovaPredict"}</p>
          <p className="np-mobile-nav-drawer-subtitle">
            {isAppShellRoute
              ? "Everything for this week's slate."
              : "See how NovaPredict turns Vegas lines into weekly fantasy edge."}
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
              Open dashboard
            </Link>
          ) : (
            <Link href="/" className="np-mobile-nav-drawer-secondary" onClick={onClose}>
              About NovaPredict
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
