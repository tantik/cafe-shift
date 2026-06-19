"use client";

import { useI18n } from "@/lib/i18n/use-i18n";
import type { AppLanguage } from "@/lib/i18n/types";

const languageOptions: AppLanguage[] = ["ja", "en"];
const shortLabels: Record<AppLanguage, string> = {
  ja: "JA",
  en: "EN",
};

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="inline-flex shrink-0 items-center gap-0.5 rounded-2xl border border-slate-200 bg-white/90 p-0.5 shadow-sm">
      <span className="sr-only">{t("language.label")}</span>
      {languageOptions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          className={`rounded-xl px-2 py-1.5 text-[11px] font-bold transition ${
            language === option
              ? "bg-emerald-800 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          aria-pressed={language === option}
          aria-label={t(`language.${option}`)}
          title={t(`language.${option}`)}
        >
          {shortLabels[option]}
        </button>
      ))}
    </div>
  );
}
