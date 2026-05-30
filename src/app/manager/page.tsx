"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";
import Link from "next/link";

type QuickAction = {
  key: string;
  href: string;
  titleKey: string;
  descriptionKey: string;
};

type OverviewShiftKind = "full" | "short" | "off" | "none";

type OverviewShift = {
  time: string;
  hours: number;
  kind: OverviewShiftKind;
};

type OverviewRow = {
  name: string;
  shifts: OverviewShift[];
};

type ActualMonthlyTotal = {
  workedDays: number;
  workedHours: number;
  note: "ok" | "lower" | "overtime" | "missing";
};

const noShift: OverviewShift = { time: "", hours: 0, kind: "none" };
const offShift: OverviewShift = { time: "", hours: 0, kind: "off" };
const morningShift: OverviewShift = { time: "8:30-13:00", hours: 4.5, kind: "short" };
const afternoonShift: OverviewShift = { time: "13:00-17:00", hours: 4, kind: "short" };
const afternoonLongShift: OverviewShift = { time: "13:00-17:30", hours: 4.5, kind: "short" };
const fullShift: OverviewShift = { time: "8:30-17:00", hours: 7.5, kind: "full" };

const shiftOverviewWeekdays = ["月", "火", "水", "木", "金", "土", "日"];
const shiftOverviewDays = Array.from({ length: 28 }, (_, index) => ({
  key: `2026-06-${String(index + 1).padStart(2, "0")}`,
  date: `6/${index + 1}`,
  weekday: shiftOverviewWeekdays[index % 7],
  isWeekend: index % 7 >= 5,
  isToday: index === 0,
}));

const shiftOverviewWeeks = Array.from({ length: 4 }, (_, index) => {
  const weekDays = shiftOverviewDays.slice(index * 7, index * 7 + 7);
  return {
    key: `week-${index + 1}`,
    labelKey: `manager.shiftOverview.week${index + 1}`,
    range: `${weekDays[0].date}(${weekDays[0].weekday})〜${weekDays[6].date}(${weekDays[6].weekday})`,
    days: weekDays,
    startIndex: index * 7,
  };
});

function repeatPattern(pattern: OverviewShift[]) {
  return Array.from({ length: 28 }, (_, index) => pattern[index % pattern.length]);
}

function applyShiftOverrides(shifts: OverviewShift[], overrides: Record<number, OverviewShift>) {
  return shifts.map((shift, index) => overrides[index] ?? shift);
}

const shiftOverviewRows: OverviewRow[] = [
  {
    name: "山田 花子",
    shifts: applyShiftOverrides(
      repeatPattern([morningShift, noShift, fullShift, noShift, afternoonShift, offShift, offShift]),
      { 8: morningShift, 11: offShift, 16: afternoonLongShift },
    ),
  },
  {
    name: "佐藤 健",
    shifts: applyShiftOverrides(
      repeatPattern([noShift, afternoonLongShift, noShift, morningShift, offShift, fullShift, noShift]),
      { 10: fullShift, 12: noShift, 21: morningShift },
    ),
  },
  {
    name: "鈴木 愛",
    shifts: applyShiftOverrides(
      repeatPattern([afternoonLongShift, fullShift, noShift, noShift, morningShift, offShift, offShift]),
      { 15: noShift, 18: fullShift, 24: afternoonShift },
    ),
  },
  {
    name: "伊藤 翔",
    shifts: applyShiftOverrides(
      repeatPattern([fullShift, offShift, afternoonLongShift, noShift, noShift, morningShift, offShift]),
      { 14: noShift, 17: morningShift, 24: fullShift },
    ),
  },
  {
    name: "高橋 美咲",
    shifts: applyShiftOverrides(
      repeatPattern([offShift, noShift, morningShift, afternoonLongShift, noShift, offShift, fullShift]),
      { 9: afternoonShift, 13: noShift, 20: morningShift },
    ),
  },
  {
    name: "田中 優",
    shifts: applyShiftOverrides(
      repeatPattern([morningShift, afternoonLongShift, offShift, fullShift, noShift, noShift, offShift]),
      { 16: morningShift, 19: afternoonLongShift, 25: fullShift },
    ),
  },
  {
    name: "中村 蓮",
    shifts: applyShiftOverrides(
      repeatPattern([noShift, fullShift, morningShift, offShift, afternoonLongShift, noShift, offShift]),
      { 14: afternoonShift, 19: fullShift, 26: morningShift },
    ),
  },
  {
    name: "小林 杏",
    shifts: applyShiftOverrides(
      repeatPattern([afternoonLongShift, noShift, offShift, morningShift, fullShift, offShift, noShift]),
      { 15: morningShift, 21: fullShift, 25: noShift },
    ),
  },
];

const demoActualMonthlyTotals: Record<string, ActualMonthlyTotal> = {
  "山田 花子": { workedDays: 11, workedHours: 63.5, note: "lower" },
  "佐藤 健": { workedDays: 12, workedHours: 67, note: "ok" },
  "鈴木 愛": { workedDays: 13, workedHours: 75, note: "overtime" },
  "伊藤 翔": { workedDays: 12, workedHours: 66, note: "ok" },
  "高橋 美咲": { workedDays: 10, workedHours: 57, note: "lower" },
  "田中 優": { workedDays: 12, workedHours: 66, note: "ok" },
  "中村 蓮": { workedDays: 13, workedHours: 74.5, note: "overtime" },
  "小林 杏": { workedDays: 0, workedHours: 0, note: "missing" },
};

function shiftCellClass(kind: OverviewShiftKind) {
  if (kind === "full") {
    return "border-emerald-100 bg-emerald-50 text-emerald-900";
  }
  if (kind === "short") {
    return "border-amber-100 bg-amber-50 text-amber-900";
  }
  if (kind === "off") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }
  return "border-transparent bg-transparent text-slate-300";
}

function formatOverviewHours(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function overviewTotal(shifts: OverviewShift[]) {
  return shifts.reduce(
    (total, shift) => ({
      days: shift.hours > 0 ? total.days + 1 : total.days,
      hours: total.hours + shift.hours,
    }),
    { days: 0, hours: 0 },
  );
}

function formatOverviewTotal(total: { days: number; hours: number }, t: (key: string) => string) {
  return `${total.days}${t("manager.shiftOverview.days")} / ${formatOverviewHours(total.hours)}${t("manager.shiftOverview.hours")}`;
}

function actualTotalClass(note: ActualMonthlyTotal["note"]) {
  if (note === "ok") {
    return "border-emerald-100 bg-emerald-50 text-emerald-800";
  }
  if (note === "lower") {
    return "border-amber-100 bg-amber-50 text-amber-800";
  }
  if (note === "overtime") {
    return "border-sky-100 bg-sky-50 text-sky-800";
  }
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function actualNoteLabel(note: ActualMonthlyTotal["note"], t: (key: string) => string) {
  if (note === "ok") {
    return t("manager.shiftOverview.actualOk");
  }
  if (note === "lower") {
    return t("manager.shiftOverview.actualLower");
  }
  if (note === "overtime") {
    return t("manager.shiftOverview.actualOvertime");
  }
  return t("manager.shiftOverview.actualMissing");
}

export default function ManagerPage() {
  return (
    <AppShell variant="wide">
      <ManagerContent />
    </AppShell>
  );
}

function ManagerContent() {
  const { t } = useI18n();
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
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
  const selectedWeek = shiftOverviewWeeks[selectedWeekIndex];
  const monthTotal = overviewTotal(shiftOverviewRows.flatMap((row) => row.shifts));
  const pendingRequests = 8;

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

        {/* Monthly shift overview */}
        <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t("manager.shiftOverview.title")}</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">{t("manager.shiftOverview.subtitle")}</p>
            </div>
            <Link
              href="/manager/shifts"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
              {t("manager.shiftOverview.openEditor")}
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t("manager.shiftOverview.period"), value: "2026/6/1–6/28" },
                { label: t("manager.shiftOverview.staffCount"), value: `${shiftOverviewRows.length}${t("manager.peopleSuffix")}` },
                { label: t("manager.shiftOverview.totalWorkdays"), value: `${monthTotal.days}${t("manager.shiftOverview.days")}` },
                { label: t("manager.shiftOverview.totalHours"), value: `${formatOverviewHours(monthTotal.hours)}${t("manager.shiftOverview.hours")}` },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
                <p className="text-xs text-slate-500">{t("manager.shiftOverview.pendingRequests")}</p>
                <p className="mt-1 text-lg font-bold text-amber-800">
                  {pendingRequests}
                  {t("manager.itemsSuffix")}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-slate-50">
              <div className="border-b border-slate-200 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{t("manager.shiftOverview.weeklyView")}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{selectedWeek.range}</p>
                    <p className="mt-0.5 text-xs font-medium text-emerald-700">{t("manager.shiftOverview.selectedWeekTotalHint")}</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-0.5">
                    {shiftOverviewWeeks.map((week, index) => (
                      <button
                        key={week.key}
                        type="button"
                        onClick={() => setSelectedWeekIndex(index)}
                        className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          selectedWeekIndex === index
                            ? "border-emerald-700 bg-emerald-800 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                        }`}
                      >
                        <span className="block">{t("manager.shiftOverview.weekLabel")} {index + 1}</span>
                        <span className="mt-0.5 block font-medium opacity-80">{week.range}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[980px] border-separate border-spacing-0 text-left text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-20 w-36 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                        {t("manager.shiftOverview.employee")}
                      </th>
                      {selectedWeek.days.map((day) => (
                        <th
                          key={day.key}
                          className={`w-[76px] border-b border-r border-slate-200 px-2 py-2 text-center ${
                            day.isToday
                              ? "bg-emerald-50"
                              : day.isWeekend
                                ? "bg-amber-50/70"
                                : "bg-white"
                          }`}
                        >
                          <span className="block text-xs font-semibold text-slate-900">{day.date}</span>
                          <span className="mt-0.5 block text-[11px] text-slate-500">{day.weekday}</span>
                        </th>
                      ))}
                      <th className="w-28 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-right text-xs font-semibold text-slate-500">
                        {t("manager.shiftOverview.selectedWeekTotal")}
                      </th>
                      <th className="w-32 border-b border-r border-slate-200 bg-emerald-50 px-3 py-2 text-right text-xs font-semibold text-emerald-800">
                        {t("manager.shiftOverview.monthlyPlanned")}
                      </th>
                      <th className="w-36 border-b border-slate-200 bg-amber-50 px-3 py-2 text-right text-xs font-semibold text-amber-800">
                        {t("manager.shiftOverview.monthlyActual")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftOverviewRows.map((row) => {
                      const weekShifts = row.shifts.slice(selectedWeek.startIndex, selectedWeek.startIndex + 7);
                      const weeklyTotal = overviewTotal(weekShifts);
                      const plannedTotal = overviewTotal(row.shifts);
                      const actualTotal = demoActualMonthlyTotals[row.name];
                      return (
                        <tr key={`${selectedWeek.key}-${row.name}`} className="group">
                          <th className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 group-hover:bg-amber-50">
                            {row.name}
                          </th>
                          {weekShifts.map((shift, index) => (
                            <td key={`${selectedWeek.key}-${row.name}-${selectedWeek.days[index].key}`} className="border-r border-t border-slate-100 bg-white px-1.5 py-2 text-center group-hover:bg-amber-50/40">
                              <span
                                className={`inline-flex min-h-8 w-full items-center justify-center rounded-lg border px-1.5 py-1 text-[11px] font-semibold leading-tight ${shiftCellClass(shift.kind)}`}
                                title={shift.kind === "none" ? t("manager.shiftOverview.noShift") : shift.kind === "off" ? t("manager.shiftOverview.off") : shift.time}
                              >
                                {shift.kind === "none"
                                  ? "—"
                                  : shift.kind === "off"
                                    ? t("manager.shiftOverview.off")
                                    : shift.time}
                              </span>
                            </td>
                          ))}
                          <td className="border-r border-t border-slate-100 bg-white px-3 py-2 text-right text-xs font-semibold text-slate-800 group-hover:bg-amber-50">
                            {formatOverviewTotal(weeklyTotal, t)}
                          </td>
                          <td className="border-r border-t border-slate-100 bg-white px-3 py-2 text-right text-xs font-semibold text-emerald-800 group-hover:bg-amber-50">
                            <span className="block text-[11px] text-slate-500">{t("manager.shiftOverview.plannedShort")}</span>
                            <span>{formatOverviewTotal(plannedTotal, t)}</span>
                          </td>
                          <td className="border-t border-slate-100 bg-white px-3 py-2 text-right text-xs font-semibold group-hover:bg-amber-50">
                            {actualTotal && actualTotal.note !== "missing" ? (
                              <span className={`inline-flex flex-col items-end rounded-lg border px-2 py-1 ${actualTotalClass(actualTotal.note)}`}>
                                <span className="text-[11px] font-medium">{actualNoteLabel(actualTotal.note, t)}</span>
                                <span>{formatOverviewTotal({ days: actualTotal.workedDays, hours: actualTotal.workedHours }, t)}</span>
                              </span>
                            ) : (
                              <span className={`inline-flex flex-col items-end rounded-lg border px-2 py-1 ${actualTotalClass("missing")}`}>
                                <span className="text-[11px] font-medium">{t("manager.shiftOverview.notReported")}</span>
                                <span>{t("manager.shiftOverview.actualMissing")}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <p className="mt-3 text-xs text-slate-500">{t("manager.shiftOverview.sampleNote")}</p>
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
