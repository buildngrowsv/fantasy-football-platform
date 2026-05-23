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

  Group labels read like a fantasy manager's mental model — not UX framework
  buckets ("Play / Trust / Tools") or engineering route names.
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
    description: "How NovaPredict turns Vegas lines into weekly fantasy edge.",
    icon: LayoutDashboard,
  },
  {
    href: "/accountability",
    label: "Gradebook",
    description: "Every call graded — wins, misses, and what we learned.",
    icon: ClipboardCheck,
  },
  {
    href: "/challenge",
    label: "Challenge",
    description: "Bet your read against the model before lock.",
    icon: Trophy,
  },
];

export const NOVA_PREDICT_APP_NAVIGATION_GROUPS: NovaPredictNavigationGroupRecord[] = [
  {
    id: "this-week",
    label: "This week",
    links: [
      {
        href: "/dashboard",
        label: "Dashboard",
        shortLabel: "Home",
        description: "Week at a glance — alerts, metrics, and top signals.",
        icon: LayoutDashboard,
        showInMobileBottomBar: true,
      },
      {
        href: "/slate",
        label: "Pick slate",
        shortLabel: "Slate",
        description: "Ranked starts and sits — agree or override before lock.",
        icon: ListOrdered,
        showInMobileBottomBar: true,
      },
      {
        href: "/challenge",
        label: "Challenge",
        description: "Put your projection against the model and the field.",
        icon: Trophy,
        showInMobileBottomBar: true,
        showNotificationDot: true,
      },
    ],
  },
  {
    id: "track-record",
    label: "Track record",
    links: [
      {
        href: "/accountability",
        label: "Gradebook",
        shortLabel: "Grades",
        description: "Every projection scored with full miss breakdowns.",
        icon: ClipboardCheck,
        showInMobileBottomBar: true,
      },
      {
        href: "/experts",
        label: "Experts",
        description: "Nova vs. analysts on the same slates and scoring rules.",
        icon: Users,
      },
    ],
  },
  {
    id: "your-league",
    label: "Your league",
    links: [
      {
        href: "/import",
        label: "Import league",
        description: "Sync Sleeper, ESPN, or Yahoo for roster-aware picks.",
        icon: Upload,
      },
      {
        href: "/admin",
        label: "Signal weights",
        description: "Adjust how market signals feed the weekly blend.",
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
