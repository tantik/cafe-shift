"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app-shell";
import { DEMO_START_DATE } from "@/lib/mock-data/core";

type BreakMinutes = 0 | 30 | 60;

type Report = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: BreakMinutes;
  transportCost: number;
  memo: string;
};

const breakOptions: { label: string; value: BreakMinutes }[] = [
  { label: "なし", value: 0 },
  { label: "30分", value: 30 },
  { label: "60分", value: 60 },
];

const initialReports: Report[] = [
  {
    id: "report-1",
    date: "2026-06-01",
    startTime: "08:30",
    endTime: "13:00",
    breakMinutes: 30,
    transportCost: 420,
    memo: "開店準備を対応しました",
  },
];

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return hour * 60 + minute;
}

function formatHours(minutes: number | null) {
  if (minutes === null || minutes < 0) {
    return "未入力";
  }
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

function formatBreak(minutes: BreakMinutes) {
  return minutes === 0 ? "なし" : `${minutes}分`;
}

export default function TimeReportPage() {
  const [date, setDate] = useState(DEMO_START_DATE);
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("13:00");
  const [breakMinutes, setBreakMinutes] = useState<BreakMinutes>(30);
  const [transportCost, setTransportCost] = useState("420");
  const [memo, setMemo] = useState("");
  const [reports, setReports] = useState(initialReports);
  const [nextReportNumber, setNextReportNumber] = useState(2);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const preview = useMemo(() => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const totalMinutes = start !== null && end !== null && end > start ? end - start : null;
    const actualMinutes = totalMinutes !== null ? totalMinutes - breakMinutes : null;
    return { totalMinutes, actualMinutes };
  }, [breakMinutes, endTime, startTime]);

  function handleSubmit() {
    setError("");
    setSuccess("");

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const cost = transportCost.trim() === "" ? 0 : Number(transportCost);

    if (!date || !startTime || !endTime) {
      setError("日付、出勤時間、退勤時間を入力してください");
      return;
    }
    if (start === null || end === null || end <= start) {
      setError("退勤時間は出勤時間より後にしてください");
      return;
    }
    if (Number.isNaN(cost) || cost < 0) {
      setError("交通費は0以上の数字で入力してください");
      return;
    }

    const nextReport: Report = {
      id: `report-${nextReportNumber}`,
      date,
      startTime,
      endTime,
      breakMinutes,
      transportCost: cost,
      memo,
    };
    setReports((current) => [nextReport, ...current]);
    setNextReportNumber((current) => current + 1);
    setSuccess("勤務報告を保存しました（デモ）");
    setMemo("");
  }

  return (
    <AppShell>
      <div className="space-y-4 pb-4">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700">勤務報告</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">勤務報告</h1>
          <p className="mt-1 text-sm text-slate-600">出勤・退勤・休憩・交通費を記録できます</p>
          <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm">
            山田 花子
          </span>
        </header>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-slate-700 shadow-sm">
          <p>この画面では、実際に働いた時間を記録します。</p>
          <p>給与計算ではなく、店長が勤務状況を確認するための報告です。</p>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-semibold text-slate-800">
            日付
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold text-slate-800">
              出勤時間
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              退勤時間
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">休憩時間</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {breakOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBreakMinutes(option.value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    breakMinutes === option.value
                      ? "border-emerald-700 bg-emerald-800 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-semibold text-slate-800">
            交通費
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={transportCost}
                onChange={(event) => setTransportCost(event.target.value)}
                placeholder="例）420"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <span className="text-sm font-semibold text-slate-600">円</span>
            </div>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            メモ
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="例）電車遅延、急な延長対応など"
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>

          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
            <div>
              <p className="text-xs text-slate-500">勤務時間</p>
              <p className="mt-1 font-semibold text-slate-900">{formatHours(preview.totalMinutes)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">休憩</p>
              <p className="mt-1 font-semibold text-slate-900">{formatBreak(breakMinutes)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">実働時間</p>
              <p className="mt-1 font-semibold text-emerald-800">{formatHours(preview.actualMinutes)}</p>
            </div>
          </div>

          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm"
          >
            勤務報告を保存する
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">最近の勤務報告</h2>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {reports.map((report) => {
              const start = timeToMinutes(report.startTime);
              const end = timeToMinutes(report.endTime);
              const actual = start !== null && end !== null ? end - start - report.breakMinutes : null;
              return (
                <div key={report.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{report.date}</p>
                      <p className="text-xs text-slate-600">
                        {report.startTime}–{report.endTime} / 休憩 {formatBreak(report.breakMinutes)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-800">{formatHours(actual)}</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">交通費 {report.transportCost.toLocaleString()}円</p>
                  {report.memo ? <p className="mt-1 text-xs text-slate-500">{report.memo}</p> : null}
                </div>
              );
            })}
          </div>
        </section>

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </p>
      </div>
    </AppShell>
  );
}
