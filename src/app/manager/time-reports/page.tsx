"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app-shell";

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
    status: "reviewed",
  },
];

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "unreviewed", label: "未確認" },
  { id: "reviewed", label: "確認済み" },
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

function formatBreak(minutes: number) {
  return minutes === 0 ? "なし" : `${minutes}分`;
}

function statusLabel(status: ReportStatus) {
  return status === "reviewed" ? "確認済み" : "未確認";
}

export default function ManagerTimeReportsPage() {
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState<Filter>("all");

  const visibleReports = filter === "all" ? reports : reports.filter((report) => report.status === filter);
  const summary = useMemo(
    () => ({
      count: reports.length,
      totalHours: formatHours(reports.reduce((sum, report) => sum + actualMinutes(report), 0)),
      transport: reports.reduce((sum, report) => sum + report.transportCost, 0),
      unreviewed: reports.filter((report) => report.status === "unreviewed").length,
    }),
    [reports],
  );

  function markReviewed(id: string) {
    setReports((current) =>
      current.map((report) => (report.id === id ? { ...report, status: "reviewed" } : report)),
    );
  }

  return (
    <AppShell variant="wide">
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700">勤務報告</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">勤務報告</h1>
              <p className="mt-1 text-sm text-slate-600">スタッフの出勤・退勤・休憩・交通費を確認できます</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white sm:self-auto">
              店長 田中
            </span>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "報告件数", value: `${summary.count}件` },
            { label: "実働時間合計", value: summary.totalHours },
            { label: "交通費合計", value: `${summary.transport.toLocaleString()}円` },
            { label: "未確認", value: `${summary.unreviewed}件` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
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
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
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
                    実働 {formatHours(actualMinutes(report))}
                  </span>
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                    {statusLabel(report.status)}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <p>休憩 {formatBreak(report.breakMinutes)}</p>
                <p>交通費 {report.transportCost.toLocaleString()}円</p>
                <p className="truncate">メモ {report.memo || "なし"}</p>
              </div>
              <div className="mt-3 text-right">
                {report.status === "unreviewed" ? (
                  <button
                    type="button"
                    onClick={() => markReviewed(report.id)}
                    className="rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white"
                  >
                    確認済みにする
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-emerald-700">確認済み</span>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-slate-700 shadow-sm">
          交通費は申告内容の確認用です。精算・給与計算はMVPでは行いません。
        </section>

        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </p>
      </div>
    </AppShell>
  );
}
