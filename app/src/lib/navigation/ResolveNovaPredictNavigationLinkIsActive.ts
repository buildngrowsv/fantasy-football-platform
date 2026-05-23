/*
  ResolveNovaPredictNavigationLinkIsActive.ts
  -------------------------------------------
  Shared active-state logic for header, sidebar, and bottom navigation.

  Player detail pages live under /players/[id] but users arrive from Dashboard or
  Slate — we treat player routes as part of the "Play" context without falsely
  highlighting every play link at once.
*/

export function ResolveNovaPredictNavigationLinkIsActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  if (pathname === href) {
    return true;
  }

  if (pathname.startsWith(`${href}/`)) {
    return true;
  }

  return false;
}

/** When viewing a player card, highlight the slate entry point as contextual parent. */
export function ResolveNovaPredictNavigationLinkIsContextuallyActive(pathname: string, href: string): boolean {
  if (ResolveNovaPredictNavigationLinkIsActive(pathname, href)) {
    return true;
  }

  if (href === "/slate" && pathname.startsWith("/players/")) {
    return true;
  }

  return false;
}
