/*
  NovaPredictColorSchemeCatalog.ts
  --------------------------------
  Shared constants for light/dark theme preference.

  Used by the blocking script (first paint), the header toggle, and any future
  settings surface. Keeping storage keys in one place avoids drift between SSR
  script and client components.
*/

export type NovaPredictResolvedColorScheme = "light" | "dark";

export type NovaPredictColorSchemePreference = NovaPredictResolvedColorScheme | "system";

export const NOVA_PREDICT_COLOR_SCHEME_STORAGE_KEY = "np-color-scheme";

export const NOVA_PREDICT_COLOR_SCHEME_ATTRIBUTE = "data-theme";

export function ResolveNovaPredictColorSchemeFromSystemPreference(): NovaPredictResolvedColorScheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ResolveNovaPredictColorSchemeFromPreference(
  preference: NovaPredictColorSchemePreference | null | undefined,
): NovaPredictResolvedColorScheme {
  if (preference === "light" || preference === "dark") {
    return preference;
  }

  return ResolveNovaPredictColorSchemeFromSystemPreference();
}

export function ApplyNovaPredictColorSchemeToDocument(resolvedScheme: NovaPredictResolvedColorScheme): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute(NOVA_PREDICT_COLOR_SCHEME_ATTRIBUTE, resolvedScheme);
}

export function ReadNovaPredictColorSchemePreferenceFromStorage(): NovaPredictColorSchemePreference | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(NOVA_PREDICT_COLOR_SCHEME_STORAGE_KEY);

  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return null;
}

export function PersistNovaPredictColorSchemePreference(preference: NovaPredictColorSchemePreference): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NOVA_PREDICT_COLOR_SCHEME_STORAGE_KEY, preference);
}

export function ToggleNovaPredictResolvedColorScheme(
  currentScheme: NovaPredictResolvedColorScheme,
): NovaPredictResolvedColorScheme {
  return currentScheme === "dark" ? "light" : "dark";
}
