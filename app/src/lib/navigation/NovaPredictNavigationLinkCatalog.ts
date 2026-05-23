import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  LayoutDashboard,
  ListOrdered,
  Menu,
  SlidersHorizontal,
  Trophy,
  Upload,
  Users,
} from "lucide-react";

/*
  NovaPredictNavigationLinkCatalog.ts
  -----------------------------------
  Single source of truth for every in-product navigation destination.

  We centralize links here because the old SiteNav + app sidebar duplicated the
  same eight URLs with inconsistent labels ("Admin" vs "Signal Weights") and no
  grouping. Product IA should read as a flow — Play → Trust → Tools — not a flat
  list of engineering routes.

  Consumers:
  - NovaPredictSiteHeader (marketing + compact app chrome)
  - NovaPredictAppSidebarNavigationPanel (desktop app shell)
  - NovaPredictMobileBottomNavigationBar (mobile primary tabs)
  - NovaPredictMobileNavigationDrawer ("More" overflow on small screens)
*/

export type NovaPredictNavigationLinkRecord = {
  href: string;
  label: string;
  shortLabel?: string;
  description: string;
  icon: LucideIcon;
  showInMobileBottomBar?: boolean;
  showNotificationDot?: boolean;
};

export type NovaPredictNavigationGroupRecord = {
  id: string;
  label: string;
  links: NovaPredictNavigationLinkRecord[];
};

export const NOVA_PREDICT_MARKETING_HEADER_LINKS: NovaPredictNavigationLinkRecord[] = [
  {
    href: "/",
    label: "Overview",
    description: "Product story, signal board, and platform metrics.",
    icon: LayoutDashboard,
  },
  {
    href: "/accountability",
    label: "Accountability",
    description: "Public record of model calls — correct, miss, and pending.",
    icon: ClipboardCheck,
  },
  {
    href: "/challenge",
    label: "Challenge",
    description: "Override the model and track where your instincts win.",
    icon: Trophy,
  },
];

export const NOVA_PREDICT_APP_NAVIGATION_GROUPS: NovaPredictNavigationGroupRecord[] = [
  {
    id: "play",
    label: "Play",
    links: [
      {
        href: "/dashboard",
        label: "Dashboard",
        shortLabel: "Home",
        description: "Weekly command center — metrics, alerts, and top signals.",
        icon: LayoutDashboard,
        showInMobileBottomBar: true,
      },
      {
        href: "/slate",
        label: "Pick Slate",
        shortLabel: "Slate",
        description: "Ranked cards for quick agree/override before lock.",
        icon: ListOrdered,
        showInMobileBottomBar: true,
      },
      {
        href: "/challenge",
        label: "Challenge",
        description: "Submit overrides and compare against model + community.",
        icon: Trophy,
        showInMobileBottomBar: true,
        showNotificationDot: true,
      },
    ],
  },
  {
    id: "trust",
    label: "Trust",
    links: [
      {
        href: "/accountability",
        label: "Accountability",
        shortLabel: "Reports",
        description: "Every projection graded with full miss diagnostics.",
        icon: ClipboardCheck,
        showInMobileBottomBar: true,
      },
      {
        href: "/experts",
        label: "Experts",
        description: "Curated analyst signals layered on Nova projections.",
        icon: Users,
      },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    links: [
      {
        href: "/import",
        label: "Import",
        description: "Pull your league roster for personalized slate context.",
        icon: Upload,
      },
      {
        href: "/admin",
        label: "Signal Weights",
        description: "Tune conditioning weights for the weekly model blend.",
        icon: SlidersHorizontal,
      },
    ],
  },
];

/** Flattened app links — handy for active-route checks and search. */
export function ListNovaPredictAppNavigationLinks(): NovaPredictNavigationLinkRecord[] {
  return NOVA_PREDICT_APP_NAVIGATION_GROUPS.flatMap((group) => group.links);
}

/** Primary mobile bottom-bar destinations (max five including "More"). */
export function ListNovaPredictMobileBottomBarLinks(): NovaPredictNavigationLinkRecord[] {
  return ListNovaPredictAppNavigationLinks().filter((link) => link.showInMobileBottomBar);
}

/** Overflow links surfaced inside the mobile drawer. */
export function ListNovaPredictMobileDrawerLinks(): NovaPredictNavigationLinkRecord[] {
  return ListNovaPredictAppNavigationLinks().filter((link) => !link.showInMobileBottomBar);
}

/** Routes under `(app)` that should mount the app shell (sidebar + bottom bar). */
export const NOVA_PREDICT_APP_SHELL_ROUTE_PREFIXES = [
  "/dashboard",
  "/slate",
  "/accountability",
  "/challenge",
  "/experts",
  "/import",
  "/admin",
  "/players",
] as const;

export function ResolveNovaPredictRouteUsesAppShell(pathname: string): boolean {
  return NOVA_PREDICT_APP_SHELL_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Icon used for the mobile overflow tab — kept here so label + glyph stay paired. */
export const NOVA_PREDICT_MOBILE_MORE_NAV_ICON: LucideIcon = Menu;
