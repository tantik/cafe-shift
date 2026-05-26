"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";

type OvertimeStatus = "unconfirmed" | "confirmed";
type OvertimeFilter = "all" | OvertimeStatus | "this_week";

type OvertimeEntry = {
  id: number;
  employee: string;
  initials: string;
  date: string;
  time: string;
  minutes: number;
  reason: string;
  memo?: string;
  status: OvertimeStatus;
  isThisWeek: boolean;
};

const initialEntries: OvertimeEntry[] = [
  {
    id: 1,
    employee: "山田 花子",
    initials: "YH",
    date: "2026年6月3日（水）",
    time: "17:30–18:30",
    minutes: 60,
    reason: "清掃",
    memo: "閉店後の清掃対応",
    status: "unconfirmed",
    isThisWeek: false,
  },
  {
    id: 2,
    employee: "佐藤 健",
    initials: "SK",
    date: "2026年6月4日（木）",
    time: "13:00–13:45",
    minutes: 45,
    reason: "接客",
    memo: "混雑対応",
    status: "confirmed",
    isThisWeek: false,
  },
  {
    id: 3,
    employee: "鈴木 愛",
    initials: "SA",
    date: "2026年6月5日（金）",
    time: "17:30–19:00",
    minutes: 90,
    reason: "仕込み",
    memo: "翌日の準備",
    status: "unconfirmed",
    isThisWeek: false,
  },
  {
    id: 4,
    employee: "伊藤 翔",
    initials: "IS",
    date: "2026年6月7日（日）",
    time: "13:00–14:00",
    minutes: 60,
    reason: "在庫確認",
    memo: "在庫チェック",
    status: "unconfirmed",
    isThisWeek: true,
  },
  {
    id: 5,
    employee: "高橋 美咲",
    initials: "TM",
    date: "2026年6月8日（月）",
    time: "17:30–18:00",
    minutes: 30,
    reason: "接客",
    memo: "追加注文対応",
    status: "confirmed",
    isThisWeek: true,
  },
  {
    id: 6,
    employee: "中村 蓮",
    initials: "NR",
    date: "2026年6月10日（水）",
    time: "17:30–18:20",
    minutes: 50,
    reason: "清掃",
    memo: "キッチン清掃",
    status: "unconfirmed",
    isThisWeek: true,
  },
  {
    id: 7,
    employee: "小林 杏",
    initials: "KA",
    date: "2026年6月11日（木）",
    time: "13:00–13:30",
    minutes: 30,
    reason: "その他",
    memo: "店長指示",
    status: "confirmed",
    isThisWeek: true,
  },
];

const filters: { id: OvertimeFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "unconfirmed", label: "未確認" },
  { id: "confirmed", label: "確認済み" },
  { id: "this_week", label: "今週" },
];

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}分`;
  }
  if (remainingMinutes === 0) {
    return `${hours}時間`;
  }
  return `${hours}時間${remainingMinutes}分`;
}

export default function ManagerOvertimePage() {
  const [selectedFilter, setSelectedFilter] = useState<OvertimeFilter>("all");
  const [entries, setEntries] = useState<OvertimeEntry[]>(initialEntries);

  const visibleEntries = entries.filter((entry) => {
    if (selectedFilter === "all") {
      return true;
    }
    if (selectedFilter === "this_week") {
      return entry.isThisWeek;
    }
    return entry.status === selectedFilter;
  });
  const thisWeekMinutes = entries
    .filter((entry) => entry.isThisWeek)
    .reduce((total, entry) => total + entry.minutes, 0);
  const totalMinutes = entries.reduce((total, entry) => total + entry.minutes, 0);
  const unconfirmedCount = entries.filter((entry) => entry.status === "unconfirmed").length;
  const confirmedCount = entries.filter((entry) => entry.status === "confirmed").length;

  function confirmEntry(id: number) {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, status: "confirmed" } : entry)),
    );
  }

  return (
    <AppShell variant="wide">
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-3.5 shadow-sm sm:p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-700">勤務記録</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">残業記録</h1>
              <p className="mt-1 text-sm text-slate-600">スタッフが入力した残業時間を確認できます</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-emerald-800 px-3 py-1 text-sm font-semibold text-white sm:self-auto">
              店長 田中
            </span>
          </div>
        </header>

        <section className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 shadow-sm">
          <p className="text-sm text-slate-600">給与計算ではなく、勤務時間の確認用です。</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <p className="mb-1.5 text-xs font-medium text-slate-500">表示フィルター</p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                  selectedFilter === filter.id
                    ? "border-emerald-700 bg-emerald-800 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-xs text-slate-500">今週の残業</p>
            <p className="mt-1 text-lg font-bold text-emerald-800">{formatDuration(thisWeekMinutes)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-xs text-slate-500">未確認</p>
            <p className="mt-1 text-lg font-bold text-amber-800">{unconfirmedCount}件</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-xs text-slate-500">確認済み</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{confirmedCount}件</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-950/5 px-3 py-2.5 shadow-sm">
            <p className="text-xs text-slate-500">合計時間</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatDuration(totalMinutes)}</p>
          </div>
        </section>

        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">入力された残業</h2>
            <p className="text-sm text-slate-500">{visibleEntries.length}件</p>
          </div>

          {visibleEntries.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500 shadow-sm">
              この条件の残業記録はありません。
            </div>
          ) : (
            visibleEntries.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 shadow-sm">
                <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-[11px] font-bold text-white">
                      {entry.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{entry.employee}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {entry.date} / {entry.time}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 pl-11 sm:pl-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-700">{entry.reason}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          entry.status === "unconfirmed"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {entry.status === "unconfirmed" ? "未確認" : "確認済み"}
                      </span>
                    </div>
                    {entry.memo ? (
                      <p className="mt-1 truncate text-xs text-slate-500">メモ: {entry.memo}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-2 pl-11 sm:flex-col sm:items-end sm:pl-0">
                    <span className="text-base font-bold text-emerald-800">{formatDuration(entry.minutes)}</span>
                    {entry.status === "unconfirmed" ? (
                      <button
                        type="button"
                        onClick={() => confirmEntry(entry.id)}
                        className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-800"
                      >
                        確認済みにする
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700">確認済み</span>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="flex flex-col gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">勤務時間集計との関係</h2>
            <p className="mt-1 text-sm text-slate-600">残業時間は勤務時間集計に反映されます。</p>
          </div>
          <Link
            href="/manager/attendance"
            className="inline-flex self-start rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:self-auto"
          >
            勤務時間集計を開く →
          </Link>
        </section>

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </p>
      </div>
    </AppShell>
  );
}
