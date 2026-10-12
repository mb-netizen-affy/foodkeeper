"use client";

// Thème clair / sombre / auto (suit le téléphone). Mémorisé sur l'appareil.

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { THEME_KEY } from "./themeScript";

export type ThemeChoice = "light" | "dark" | "system";

const KEY = THEME_KEY;
const EVENT = "fk-theme-change";
const META_COLORS = { light: "#f3ece1", dark: "#1c130d" };

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "system" ? v : "light";
  } catch {
    return "light";
  }
}

function systemIsDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(choice: ThemeChoice) {
  const resolved = choice === "dark" || (choice === "system" && systemIsDark()) ? "dark" : "light";
  document.documentElement.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLORS[resolved]);
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Le choix de thème actuel + une fonction pour le changer. */
export function useTheme() {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "light" as ThemeChoice);

  // En mode « auto », suit les changements du téléphone en direct
  useEffect(() => {
    apply(choice);
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  const setChoice = useCallback((next: ThemeChoice) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* navigation privée : le thème s'applique quand même pour la session */
    }
    apply(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const isDark = choice === "dark" || (choice === "system" && typeof window !== "undefined" && systemIsDark());

  return { choice, setChoice, isDark };
}