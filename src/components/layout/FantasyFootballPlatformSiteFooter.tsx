import { FantasyFootballPlatformApplicationName } from "@/lib/constants/FantasyFootballPlatformConstants";

/**
 * FantasyFootballPlatformSiteFooter
 *
 * Footer on all public pages. Keeps legal and support placeholders ready
 * for the "running business" checklist (privacy, terms, contact) without
 * blocking the initial repo launch.
 */
export function FantasyFootballPlatformSiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-emerald-900/30 bg-[#060d18]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            {FantasyFootballPlatformApplicationName}
          </p>
          <p className="mt-1 text-sm text-emerald-200/60">
            Built for commissioners who care about the details.
          </p>
        </div>
        <p className="text-sm text-emerald-200/40">
          © {currentYear} {FantasyFootballPlatformApplicationName}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
