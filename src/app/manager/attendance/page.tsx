"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app-shell";

const periods = [
  { label: "1日", range: "2026年5月1日〜2026年5月31日" },
  { label: "16日", range: "2026年5月16日〜2026年6月15日" },
  { label: "21日", range: "2026年5月21日〜2026年6月20日" },
];

const employees = [
  { name: "山田 花子", scheduled: 72, absence: 0, overtime: 2 },
  { name: "佐藤 健", scheduled: 68, absence: 4.5, overtime: 0 },
  { name: "鈴木 愛", scheduled: 80, absence: 0, overtime: 1.5 },
  { name: "伊藤 翔", scheduled: 54, absence: 9, overtime: 3 },
  { name: "高橋 美咲", scheduled: 63, absence: 0, overtime: 0.5 },
];

function formatHours(value: number) {
  return `${value % 1 === 0 ? value : value.toFixed(1)}h`;
}

function initials(name: string) {
  const parts = name.split(" ");
  return parts.map((part) => part[0]).join("");
}

export default function AttendancePage() {
  const [selected, setSelected] = useState(periods[0].label);

  const totals = useMemo(() => {
    const scheduled = employees.reduce((sum, item) => sum + item.scheduled, 0);
    const absence = employees.reduce((sum, item) => sum + item.absence, 0);
    const overtime = employees.reduce((sum, item) => sum + item.overtime, 0);
    const total = scheduled - absence + overtime;
    return {
      scheduled,
      absence,
      overtime,
      total,
    };
  }, []);

  const selectedPeriod = periods.find((period) => period.label === selected) ?? periods[0];

  return (
    <AppShell variant="wide">
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100/70 bg-emerald-950/5 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700/80">勤務時間集計</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">勤務時間集計</h1>
              <p className="mt-1 text-sm text-slate-600">シフト・欠勤・残業をまとめて確認できます</p>
            </div>
            <div className="inline-flex items-center self-start rounded-full bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white sm:self-auto">
              店長 田中
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-amber-100/70 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">集計期間</p>
              <p className="mt-1 text-sm text-slate-600">計算の開始日を選択してください</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <button
                  key={period.label}
                  onClick={() => setSelected(period.label)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    selected === period.label
                      ? "border-amber-600 bg-amber-100 text-amber-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 shadow-sm">
            <p className="text-xs text-slate-500">選択中の期間</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{selectedPeriod.range}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">総予定時間</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatHours(totals.scheduled)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">総残業時間</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">{formatHours(totals.overtime)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">欠勤控除</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">-{formatHours(totals.absence)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-950/5 p-3 shadow-sm">
            <p className="text-xs text-slate-500">集計後合計</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatHours(totals.total)}</p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-lg font-semibold text-slate-900">従業員別勤務時間</p>
              <p className="mt-1 text-sm text-slate-500">各従業員の予定・欠勤・残業を確認できます</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">給与計算ではなく、勤務時間の確認用です。</p>
          </div>

          <div className="space-y-3">
            {employees.map((employee) => {
              const total = employee.scheduled - employee.absence + employee.overtime;
              return (
                <div key={employee.name} className="rounded-2xl border border-amber-100 bg-amber-50/80 p-3 shadow-sm sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-sm font-bold text-white">
                      {initials(employee.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{employee.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                        {employee.absence > 0 ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">病欠・欠勤あり</span> : null}
                        {employee.overtime > 0 ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">残業あり</span> : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                      <p className="text-xs text-slate-500">予定時間</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatHours(employee.scheduled)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                      <p className="text-xs text-slate-500">欠勤控除</p>
                      <p className="mt-1 font-semibold text-amber-800">-{formatHours(employee.absence)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center">
                      <p className="text-xs text-slate-500">残業時間</p>
                      <p className="mt-1 font-semibold text-emerald-800">{formatHours(employee.overtime)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-950/5 p-2.5 text-center">
                      <p className="text-xs text-slate-500">集計後合計</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatHours(total)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <p className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際のデータは後でSupabaseに接続します。
        </p>
      </div>
    </AppShell>
  );
}
