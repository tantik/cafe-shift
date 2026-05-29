"use client";

import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";
import Link from "next/link";

type QuickAction = {
  key: string;
  href: string;
  titleKey: string;
  descriptionKey: string;
};

export default function ManagerPage() {
  return (
    <AppShell variant="wide">
      <ManagerContent />
    </AppShell>
  );
}

function ManagerContent() {
  const { t } = useI18n();
  // Mock data (deterministic, no external calls)
  const todayLabel = "6月1日（月）";
  const shiftGroups = [
    { title: "1シフト 08:30–13:00", names: ["山田", "佐藤", "田中"] },
    { title: "2シフト 13:00–17:30", names: ["鈴木", "高橋"] },
    { title: "通しシフト 08:30–17:30", names: ["伊藤"] },
  ];
  const summary = { present: 6, off: 2 };
  const attention = [
    { title: t("manager.statusShiftRequests"), subtitle: t("suggestions.statusUnchecked"), count: 8 },
    { title: t("manager.statusUncheckedReports"), subtitle: t("manager.extendedWork"), count: 3 },
    { title: t("manager.statusSuggestions"), subtitle: t("suggestions.statusUnchecked"), count: 1 },
  ];
  const timeSummaryPeriod = "5月1日〜5月31日";
  const timeRows = [
    { name: "山田 花子", planned: "72h", overtime: "2h", total: "74h" },
    { name: "佐藤 健", planned: "68h", sick: "-4.5h", total: "63.5h" },
    { name: "鈴木 愛", planned: "80h", overtime: "1.5h", total: "81.5h" },
  ];

  const quickActions: QuickAction[] = [
    {
      key: "shifts",
      href: "/manager/shifts",
      titleKey: "manager.actions.shifts.title",
      descriptionKey: "manager.actions.shifts.description",
    },
    {
      key: "requests",
      href: "/manager/requests",
      titleKey: "manager.actions.requests.title",
      descriptionKey: "manager.actions.requests.description",
    },
    {
      key: "timeReports",
      href: "/manager/time-reports",
      titleKey: "manager.actions.timeReports.title",
      descriptionKey: "manager.actions.timeReports.description",
    },
    {
      key: "suggestions",
      href: "/manager/suggestions",
      titleKey: "manager.actions.suggestions.title",
      descriptionKey: "manager.actions.suggestions.description",
    },
    {
      key: "employees",
      href: "/manager/employees",
      titleKey: "manager.actions.employees.title",
      descriptionKey: "manager.actions.employees.description",
    },
    {
      key: "recipes",
      href: "/manager/recipes",
      titleKey: "manager.actions.recipes.title",
      descriptionKey: "manager.actions.recipes.description",
    },
    {
      key: "settings",
      href: "/manager/settings",
      titleKey: "manager.actions.settings.title",
      descriptionKey: "manager.actions.settings.description",
    },
  ];

  return (
      <div className="space-y-5 pb-8">
        {/* Header */}
        <header className="rounded-2xl bg-gradient-to-r from-emerald-50 to-amber-50 p-6 shadow-md border border-amber-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{t("manager.title")}</h1>
              <p className="mt-1 text-sm text-slate-600">{t("manager.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-800 text-white px-3 py-1 text-sm font-semibold">{t("manager.managerRole")}</div>
              <div className="text-sm font-medium">{t("manager.managerName")}</div>
            </div>
          </div>
        </header>

        {/* Top two columns: Today overview + Attention (stack on mobile, side-by-side on md) */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Today overview */}
          <section className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">{t("manager.todayTitle")}</div>
              <div className="mt-1 font-semibold text-slate-900">{todayLabel}</div>
            </div>
            <div className="text-sm text-slate-600">
              {t("manager.totalScheduled")}{" "}
              <span className="font-semibold text-slate-800">
                {summary.present}
                {t("manager.peopleSuffix")}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {shiftGroups.map((g) => (
              <div key={g.title} className="flex items-center justify-between rounded-xl bg-amber-50 p-3 border border-amber-100">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{g.title}</div>
                  <div className="text-xs text-slate-600 mt-1">{g.names.join('、')}</div>
                </div>
                <div className="text-xs text-slate-500">
                  {g.names.length}
                  {t("manager.peopleSuffix")}
                </div>
              </div>
            ))}

            <div className="mt-2 flex gap-3">
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {t("manager.presentScheduled")} {summary.present}
                {t("manager.peopleSuffix")}
              </div>
              <div className="rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                {t("manager.off")} {summary.off}
                {t("manager.peopleSuffix")}
              </div>
            </div>
          </div>
          </section>
          {/* Attention card */}
          <section className="rounded-2xl bg-amber-50 p-4 shadow-sm border border-amber-100">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">{t("manager.statusTitle")}</div>
              <div className="text-xs text-slate-500">{t("manager.statusDescription")}</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {attention.map((a) => (
                <div key={a.title} className="rounded-xl bg-white p-3 shadow-sm border border-slate-100 text-center">
                  <div className="text-sm font-medium text-slate-800">{a.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{a.subtitle}</div>
                  <div className="mt-2 text-lg font-semibold text-amber-700">
                    {a.count}
                    {t("manager.itemsSuffix")}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Time summary preview (full width) */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">{t("manager.timeSummaryTitle")}</div>
              <div className="mt-1 font-semibold text-slate-900">{timeSummaryPeriod}</div>
            </div>
            <div className="text-xs text-slate-500">{t("manager.timeSummaryNote")}</div>
          </div>

          <div className="mt-3 space-y-2">
            {timeRows.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-600">
                    {t("manager.planned")} {r.planned}{" "}
                    {r.overtime
                      ? `/ ${t("manager.extendedWork")} ${r.overtime}`
                      : r.sick
                        ? `/ ${t("manager.sickAbsence")} ${r.sick}`
                        : ""}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {t("manager.total")} {r.total}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900">{t("manager.quickActionsTitle")}</h3>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((q) => {
              const card = (
                <div
                  className="relative flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-amber-50 p-4 shadow-sm transition group-hover:border-emerald-400 group-hover:bg-emerald-50"
                >
                  <div>
                    <div className="font-medium text-slate-800">{t(q.titleKey)}</div>
                    <div className="text-xs font-semibold text-emerald-700">
                      {t(q.descriptionKey)} / {t("manager.open")}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">›</div>
                </div>
              );

              return (
                <Link
                  key={q.key}
                  href={q.href}
                  className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  {card}
                </Link>
              );
            })}
          </div>
        </section>

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 shadow-sm">
          <span className="font-semibold text-slate-800">{t("manager.noteTitle")}: </span>
          {t("manager.noteText")}
        </p>
      </div>
  );
}
