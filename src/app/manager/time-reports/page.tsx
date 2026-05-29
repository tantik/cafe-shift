"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";

type ReportStatus = "unreviewed" | "reviewed";
type Filter = "all" | ReportStatus;

type TimeReport = {
  id: string;
  employeeName: string;
  initials: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  transportCost: number;
  memo: string;
  hasExtendedWork: boolean;
  extendedWorkReason: string;
  status: ReportStatus;
};

const initialReports: TimeReport[] = [
  {
    id: "time-report-1",
    employeeName: "山田 花子",
    initials: "YH",
    date: "2026-06-01",
    startTime: "08:30",
    endTime: "13:00",
    breakMinutes: 30,
    transportCost: 420,
    memo: "開店準備を対応",
    hasExtendedWork: false,
    extendedWorkReason: "",
    status: "unreviewed",
  },
  {
    id: "time-report-2",
    employeeName: "佐藤 健",
    initials: "SK",
    date: "2026-06-01",
    startTime: "13:00",
    endTime: "17:30",
    breakMinutes: 0,
    transportCost: 0,
    memo: "",
    hasExtendedWork: true,
    extendedWorkReason: "急な来客対応",
    status: "reviewed",
  },
  {
    id: "time-report-3",
    employeeName: "鈴木 愛",
    initials: "SA",
    date: "2026-06-02",
    startTime: "08:30",
    endTime: "17:30",
    breakMinutes: 60,
    transportCost: 520,
    memo: "仕込みを多めに対応",
    hasExtendedWork: true,
    extendedWorkReason: "片付け延長",
    status: "unreviewed",
  },
  {
    id: "time-report-4",
    employeeName: "伊藤 翔",
    initials: "IS",
    date: "2026-06-03",
    startTime: "08:30",
    endTime: "13:00",
    breakMinutes: 30,
    transportCost: 360,
    memo: "電車遅延あり",
    hasExtendedWork: false,
    extendedWorkReason: "",
    status: "reviewed",
  },
];

const filters: { id: Filter; labelKey: string }[] = [
  { id: "all", labelKey: "managerTimeReports.filters.all" },
  { id: "unreviewed", labelKey: "managerTimeReports.filters.unreviewed" },
  { id: "reviewed", labelKey: "managerTimeReports.filters.reviewed" },
];

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function actualMinutes(report: TimeReport) {
  return timeToMinutes(report.endTime) - timeToMinutes(report.startTime) - report.breakMinutes;
}

function formatHours(minutes: number) {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

function formatBreak(minutes: number, noneLabel: string) {
  return minutes === 0 ? noneLabel : `${minutes}分`;
}

function statusLabel(status: ReportStatus, t: (key: string) => string) {
  return status === "reviewed"
    ? t("managerTimeReports.status.reviewed")
    : t("managerTimeReports.status.unreviewed");
}

export default function ManagerTimeReportsPage() {
  return (
    <AppShell variant="wide">
      <ManagerTimeReportsContent />
    </AppShell>
  );
}

function ManagerTimeReportsContent() {
  const { t } = useI18n();
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState<Filter>("all");

  const visibleReports = filter === "all" ? reports : reports.filter((report) => report.status === filter);
  const summary = useMemo(
    () => ({
      count: reports.length,
      totalHours: formatHours(reports.reduce((sum, report) => sum + actualMinutes(report), 0)),
      breakHours: formatHours(reports.reduce((sum, report) => sum + report.breakMinutes, 0)),
      transport: reports.reduce((sum, report) => sum + report.transportCost, 0),
      unreviewed: reports.filter((report) => report.status === "unreviewed").length,
      extendedWork: reports.filter((report) => report.hasExtendedWork).length,
    }),
    [reports],
  );

  function markReviewed(id: string) {
    setReports((current) =>
      current.map((report) => (report.id === id ? { ...report, status: "reviewed" } : report)),
    );
  }

  return (
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700">{t("managerTimeReports.title")}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("managerTimeReports.title")}</h1>
              <p className="mt-1 text-sm text-slate-600">{t("managerTimeReports.subtitle")}</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white sm:self-auto">
              {t("managerTimeReports.managerChip")}
            </span>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t("managerTimeReports.summary.reportCount"), value: `${summary.count}件` },
            { label: t("managerTimeReports.summary.unreviewed"), value: `${summary.unreviewed}件` },
            { label: t("managerTimeReports.summary.extendedWork"), value: `${summary.extendedWork}件` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">{t("managerTimeReports.summaryTitle")}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("managerTimeReports.note.text")}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: t("managerTimeReports.summary.totalActualHours"), value: summary.totalHours },
              { label: t("managerTimeReports.summary.totalBreakHours"), value: summary.breakHours },
              { label: t("managerTimeReports.summary.totalTransportCost"), value: `${summary.transport.toLocaleString()}円` },
              { label: t("managerTimeReports.summary.unreviewed"), value: `${summary.unreviewed}件` },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-amber-100 bg-white px-3 py-2.5 shadow-sm">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  filter === item.id ? "bg-emerald-800 text-white" : "bg-slate-50 text-slate-700"
                }`}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">{t("managerTimeReports.reportListTitle")}</h2>
          {visibleReports.map((report) => (
            <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-xs font-bold text-white">
                    {report.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{report.employeeName}</p>
                    <p className="text-xs text-slate-500">
                      {report.date} / {report.startTime}–{report.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                    {t("managerTimeReports.fields.actualHours")} {formatHours(actualMinutes(report))}
                  </span>
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                    {statusLabel(report.status, t)}
                  </span>
                  {report.hasExtendedWork ? (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                      {t("managerTimeReports.fields.extendedWork")}
                    </span>
                  ) : null}
                  {report.hasExtendedWork && report.status === "unreviewed" ? (
                    <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                      {t("managerTimeReports.status.needsCheck")}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <p>
                  {t("managerTimeReports.fields.break")} {formatBreak(report.breakMinutes, t("managerTimeReports.status.none"))}
                </p>
                <p>
                  {t("managerTimeReports.fields.transportCost")} {report.transportCost.toLocaleString()}円
                </p>
                <p className="truncate">
                  {t("managerTimeReports.fields.memo")} {report.memo || t("managerTimeReports.status.none")}
                </p>
              </div>
              {report.hasExtendedWork ? (
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-slate-700">
                  <p className="font-semibold text-amber-900">{t("managerTimeReports.fields.extendedWork")}</p>
                  <p className="mt-1">
                    {t("managerTimeReports.fields.extendedWorkReason")}:{" "}
                    {report.extendedWorkReason || t("managerTimeReports.status.notEntered")}
                  </p>
                </div>
              ) : null}
              <div className="mt-3 text-right">
                {report.status === "unreviewed" ? (
                  <button
                    type="button"
                    onClick={() => markReviewed(report.id)}
                    className="rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white"
                  >
                    {t("managerTimeReports.actions.markReviewed")}
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-emerald-700">{t("managerTimeReports.status.reviewed")}</span>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-slate-700 shadow-sm">
          <p className="font-semibold text-slate-900">{t("managerTimeReports.note.title")}</p>
          <p className="mt-1">{t("managerTimeReports.note.text")}</p>
        </section>

        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {t("managerTimeReports.demoNote")}
        </p>
      </div>
  );
}
