"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app-shell";
import Link from "next/link";

// Stable mock today for demo (deterministic across server/client)
const MOCK_TODAY = '2026-06-01';

type RequestOption = "1シフト" | "2シフト" | "通しシフト" | "休み希望";

function generateDates(start: Date, count: number) {
  const arr: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    arr.push(d);
  }
  return arr;
}

function formatKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}
function jpWeekday(date: Date) {
  const wk = ["日", "月", "火", "水", "木", "金", "土"];
  return wk[date.getDay()];
}

export default function RequestsPage() {
  // target month start (mock)
  const monthStart = useMemo(() => new Date(2026, 5, 1), []); // June 2026 (month index 5)
  const dates = useMemo(() => generateDates(monthStart, 14), [monthStart]);
  // use stable mock today key to avoid server/client mismatch
  const todayKey = MOCK_TODAY;

  // requests stored as map dateKey -> RequestOption | null
  const [requests, setRequests] = useState<Record<string, RequestOption | null>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [activeDateKey, setActiveDateKey] = useState<string | null>(null);
  const [tempSelection, setTempSelection] = useState<RequestOption | null>("休み希望");

  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function openForDate(date: Date) {
    const key = formatKey(date);
    setActiveDateKey(key);
    // default highlight 休み希望 if no existing request
    const existing = requests[key] ?? null;
    setTempSelection(existing ?? "休み希望");
    setModalOpen(true);
  }

  function confirmSelection() {
    if (!activeDateKey) return;
    setRequests((prev) => ({ ...prev, [activeDateKey]: tempSelection }));
    setModalOpen(false);
  }

  function clearSelection() {
    if (!activeDateKey) return;
    setRequests((prev) => {
      const next = { ...prev };
      delete next[activeDateKey];
      return next;
    });
    setModalOpen(false);
  }

  function submitAll() {
    // mock submit
    setNotice("希望を保存しました（デモ）");
    setTimeout(() => setNotice(null), 3000);
  }

  const selectedList = Object.entries(requests)
    .filter(([, v]) => v)
    .map(([k, v]) => ({ dateKey: k, label: v as string }))
    .sort((a, b) => (a.dateKey > b.dateKey ? 1 : -1));

  return (
    <AppShell>
      <div className="space-y-5 pb-6">
        {/* Header */}
        <header className="rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">シフト希望</h1>
          <p className="mt-1 text-sm text-slate-600">来月働ける日とシフトを選んでください</p>
          <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 shadow-sm">
            <div className="h-8 w-8 flex-none rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-semibold">YH</div>
            <div className="text-sm font-medium">山田 花子</div>
          </div>
        </header>

        {/* Vacation secondary action */}
        <section className="rounded-2xl bg-amber-50 p-4 shadow-sm border border-amber-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">休暇希望</p>
              <p className="mt-1 text-sm text-slate-600">年間の休暇希望を入力できます</p>
            </div>
            <Link
              href="/vacations"
              className="rounded-3xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-green-200"
            >
              休暇希望を入力する
            </Link>
          </div>
        </section>

        {/* Month Card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">対象月</div>
              <div className="mt-1 font-semibold text-slate-900">2026年6月</div>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">未提出</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">希望を送信した後、管理者が最終シフトを作成します。</p>
        </div>

        {/* Calendar (14 days) */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900">6月の希望（14日分）</h2>
          <p className="text-sm text-slate-500 mt-1">日付をタップして希望を選んでください</p>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {dates.map((d) => {
              const key = formatKey(d);
              const req = requests[key] ?? null;
              const isRequested = !!req;
              const isToday = key === todayKey;
              return (
                <button
                  key={key}
                  onClick={() => openForDate(d)}
                  className={`rounded-xl p-3 text-left shadow-sm transition ${
                    isToday
                      ? 'border-2 border-amber-400 bg-amber-50'
                      : isRequested
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-white border border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-slate-800">{d.getDate()}日</div>
                        {isToday && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                            今日
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{jpWeekday(d)}</div>
                    </div>
                    <div className="text-xs text-slate-600">{req ?? '未選択'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected requests summary */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900">選択した希望</h3>
          <div className="mt-3">
            {selectedList.length === 0 ? (
              <p className="text-sm text-slate-500">まだ希望が選択されていません</p>
            ) : (
              <div className="max-h-[240px] overflow-y-auto pr-2">
                <ul className="space-y-2">
                  {selectedList.map((s) => (
                    <li key={s.dateKey} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{s.dateKey.replace(/^(\d+)-(\d+)-(\d+)$/, '$2月$3日')}</div>
                        <div className="text-xs text-slate-600">{s.label}</div>
                      </div>
                      <div className="text-xs text-slate-500">編集</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Comment box */}
        <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
          <label className="text-sm font-medium text-slate-800">コメント（任意）</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="連絡事項があれば入力してください"
            className="mt-2 w-full resize-none rounded-lg border border-slate-100 p-3 text-sm"
            rows={3}
          />
        </div>

        {/* Submit button */}
        <div className="space-y-2">
          <button
            onClick={submitAll}
            className="w-full rounded-3xl bg-gradient-to-r from-green-700 to-green-800 px-4 py-3 text-white font-semibold shadow-md"
          >
            希望を送信する
          </button>
          {notice && <div className="text-center text-sm text-emerald-600">{notice}</div>}
        </div>

        <p className="text-xs text-slate-500">この画面はデモです。実際の保存は後でSupabaseに接続します。</p>

        {/* Modal / Bottom sheet */}
        {modalOpen && activeDateKey && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
            <div className="relative w-full max-w-[430px] rounded-t-2xl bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{activeDateKey.replace(/^(\d+)-(\d+)-(\d+)$/, '$2月$3日')}</div>
                  <div className="text-xs text-slate-500">この日の希望を選んでください</div>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-sm text-slate-500">閉じる</button>
              </div>

              <div className="mt-4 space-y-3">
                {(["1シフト", "2シフト", "通しシフト", "休み希望"] as RequestOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setTempSelection(opt)}
                    className={`w-full rounded-xl px-4 py-3 text-left ${
                      tempSelection === opt ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800">{opt}</div>
                        <div className="text-xs text-slate-500">{opt === '1シフト' ? '08:30–13:00' : opt === '2シフト' ? '13:00–17:30' : opt === '通しシフト' ? '08:30–17:30' : '休みを希望する'}</div>
                      </div>
                      {tempSelection === opt && <div className="text-green-700 font-semibold">選択</div>}
                    </div>
                  </button>
                ))}

                <div className="flex gap-2">
                  <button onClick={clearSelection} className="flex-1 rounded-xl bg-slate-100 px-4 py-3">選択をクリア</button>
                  <button
                    onClick={confirmSelection}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold"
                  >
                    {requests[activeDateKey] ? '変更する' : '確定する'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
