"use client";

/*
  NovaPredictColorSchemeToggleButton.tsx
  --------------------------------------
  Header control to switch between light and dark mode.

  Persists an explicit light/dark choice (not "system") so returning visitors keep
  their pick. Listens for OS theme changes only when no explicit preference exists.
*/

import { Moon, Sun } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";
import {
  ApplyNovaPredictColorSchemeToDocument,
  NOVA_PREDICT_COLOR_SCHEME_ATTRIBUTE,
  PersistNovaPredictColorSchemePreference,
  ReadNovaPredictColorSchemePreferenceFromStorage,
  ResolveNovaPredictColorSchemeFromSystemPreference,
  ToggleNovaPredictResolvedColorScheme,
  type NovaPredictResolvedColorScheme,
} from "@/lib/theme/NovaPredictColorSchemeCatalog";

const novaPredictThemeStoreRevision = { current: 0 };
const novaPredictThemeStoreListeners = new Set<() => void>();

function ReadNovaPredictColorSchemeFromDocument(): NovaPredictResolvedColorScheme {
  const attributeValue = document.documentElement.getAttribute(NOVA_PREDICT_COLOR_SCHEME_ATTRIBUTE);
  return attributeValue === "light" ? "light" : "dark";
}

function NotifyNovaPredictThemeStoreSubscribers() {
  novaPredictThemeStoreRevision.current += 1;
  novaPredictThemeStoreListeners.forEach((listener) => listener());
}

function SubscribeToNovaPredictThemeStore(onStoreChange: () => void) {
  novaPredictThemeStoreListeners.add(onStoreChange);

  const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

  function handleSystemThemeChange() {
    const storedPreference = ReadNovaPredictColorSchemePreferenceFromStorage();
    if (storedPreference === "light" || storedPreference === "dark") {
      return;
    }

    const nextScheme = ResolveNovaPredictColorSchemeFromSystemPreference();
    ApplyNovaPredictColorSchemeToDocument(nextScheme);
    NotifyNovaPredictThemeStoreSubscribers();
  }

  mediaQuery.addEventListener("change", handleSystemThemeChange);

  return () => {
    novaPredictThemeStoreListeners.delete(onStoreChange);
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
  };
}

function ReadNovaPredictThemeStoreSnapshot(): NovaPredictResolvedColorScheme {
  void novaPredictThemeStoreRevision.current;
  return ReadNovaPredictColorSchemeFromDocument();
}

function ReadNovaPredictThemeStoreServerSnapshot(): NovaPredictResolvedColorScheme {
  return "dark";
}

function SubscribeToNovaPredictClientMount(onStoreChange: () => void) {
  void onStoreChange;
  return () => {};
}

export function NovaPredictColorSchemeToggleButton() {
  const mountedOnClient = useSyncExternalStore(
    SubscribeToNovaPredictClientMount,
    () => true,
    () => false,
  );

  const resolvedScheme = useSyncExternalStore(
    SubscribeToNovaPredictThemeStore,
    ReadNovaPredictThemeStoreSnapshot,
    ReadNovaPredictThemeStoreServerSnapshot,
  );

  const handleToggle = useCallback(() => {
    const nextScheme = ToggleNovaPredictResolvedColorScheme(resolvedScheme);
    ApplyNovaPredictColorSchemeToDocument(nextScheme);
    PersistNovaPredictColorSchemePreference(nextScheme);
    NotifyNovaPredictThemeStoreSubscribers();
  }, [resolvedScheme]);

  const isDark = resolvedScheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className="np-site-header-theme-toggle"
      aria-label={label}
      title={label}
      onClick={handleToggle}
      suppressHydrationWarning
    >
      {!mountedOnClient ? (
        <Sun size={18} aria-hidden />
      ) : isDark ? (
        <Sun size={18} aria-hidden />
      ) : (
        <Moon size={18} aria-hidden />
      )}
    </button>
  );
}
