"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { AppLanguage } from "@/lib/i18n/types";

const STORAGE_KEY = "cafe-shift-language";
const STORAGE_EVENT = "cafe-shift-language-change";
const defaultLanguage: AppLanguage = "ja";

type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isAppLanguage(value: string | null): value is AppLanguage {
  return value === "ja" || value === "en" || value === "ru";
}

function getStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }
  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return isAppLanguage(storedLanguage) ? storedLanguage : defaultLanguage;
}

function subscribeToLanguageChange(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribeToLanguageChange, getStoredLanguage, () => defaultLanguage);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        window.localStorage.setItem(STORAGE_KEY, nextLanguage);
        window.dispatchEvent(new Event(STORAGE_EVENT));
      },
      t: (key) => dictionaries[language][key] ?? dictionaries[defaultLanguage][key] ?? key,
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
