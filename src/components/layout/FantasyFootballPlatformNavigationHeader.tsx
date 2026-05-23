import Link from "next/link";
import { FantasyFootballPlatformApplicationName } from "@/lib/constants/FantasyFootballPlatformConstants";

/**
 * FantasyFootballPlatformNavigationHeader
 *
 * Global top navigation rendered from the root layout on every page.
 * Links route to marketing sections and the three core product surfaces
 * (dashboard, leagues, draft) so first-time visitors can explore without
 * signing in — auth gates will wrap these routes in a later milestone.
 */
export function FantasyFootballPlatformNavigationHeader() {
  const navigationLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/leagues", label: "Leagues" },
    { href: "/draft", label: "Live Draft" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/30 bg-[#0a1628]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 text-lg font-black text-white shadow-lg shadow-emerald-900/40"
          >
            G
          </span>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
            {FantasyFootballPlatformApplicationName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-emerald-100/80 transition-colors hover:text-emerald-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/leagues"
            className="rounded-full border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/10"
          >
            Sign In
          </Link>
          <Link
            href="/leagues"
            className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/50 transition hover:from-emerald-400 hover:to-emerald-500"
          >
            Start a League
          </Link>
        </div>
      </div>
    </header>
  );
}
