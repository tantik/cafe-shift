"use client";

import AppShell from "@/components/app-shell";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/use-i18n";

const cards = [
  { titleKey: "home.workerCardTitle", href: "/shifts" },
  { title: "シフト希望", href: "/requests" },
  { title: "勤務報告（シフト画面）", href: "/shifts" },
  { title: "レシピ確認", href: "/recipes" },
  { titleKey: "home.managerCardTitle", href: "/manager" },
];

export default function Home() {
  return (
    <AppShell>
      <HomeContent />
    </AppShell>
  );
}

function HomeContent() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
        <p className="text-sm text-slate-500">{t("app.subtitle")}</p>
        <h2 className="mt-4 text-3xl font-semibold">{t("home.title")}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {t("home.subtitle")}
        </p>
      </section>

      <div className="grid gap-3">
        {cards.map((card) => (
          <Link
            key={card.title ?? card.titleKey}
            href={card.href}
            className="rounded-[1.75rem] bg-white p-5 text-left shadow-sm shadow-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-lg font-semibold">{card.titleKey ? t(card.titleKey) : card.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
