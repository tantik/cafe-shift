"use client";

import { useI18n } from "@/lib/i18n/use-i18n";
import type { AppLanguage } from "@/lib/i18n/types";

const languageOptions: AppLanguage[] = ["ja", "en", "ru"];

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/90 p-1 shadow-sm">
      <span className="sr-only">{t("language.label")}</span>
      {languageOptions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
            language === option
              ? "bg-emerald-800 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          aria-pressed={language === option}
        >
          {t(`language.${option}`)}
        </button>
      ))}
    </div>
  );
}
