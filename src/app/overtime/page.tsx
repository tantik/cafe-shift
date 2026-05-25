'use client';

import { useMemo, useState } from 'react';
import AppShell from '@/components/app-shell';

const reasonOptions = ['清掃', '接客', '仕込み', '在庫確認', 'その他'];

const initialEntries = [
  {
    id: 'overtime_001',
    date: '2025-05-24',
    startTime: '17:30',
    endTime: '19:00',
    reason: '清掃',
    memo: '閉店後の床掃除',
  },
  {
    id: 'overtime_002',
    date: '2025-05-23',
    startTime: '18:00',
    endTime: '19:30',
    reason: '接客',
    memo: 'イベント対応',
  },
];

function calculateOvertime(startTime: string, endTime: string) {
  if (!startTime || !endTime) {
    return null;
  }

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return null;
  }

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const diff = endMinutes - startMinutes;

  if (diff <= 0) {
    return null;
  }

  const hours = diff / 60;
  return hours;
}

function formatHours(hours: number) {
  if (hours % 1 === 0) {
    return `${hours.toFixed(0)}時間`;
  }
  return `${hours.toFixed(1)}時間`;
}

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export default function OvertimePage() {
  const [date, setDate] = useState('2025-05-25');
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('19:00');
  const [reason, setReason] = useState('清掃');
  const [memo, setMemo] = useState('');
  const [entries, setEntries] = useState(initialEntries);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const overtimeHours = useMemo(() => calculateOvertime(startTime, endTime), [startTime, endTime]);
  const overtimeLabel = overtimeHours ? formatHours(overtimeHours) : '未入力';

  const handleSubmit = () => {
    setError('');
    setSuccess('');

    if (!date || !startTime || !endTime || !reason) {
      setError('日付・開始時間・終了時間・理由をすべて入力してください。');
      return;
    }

    if (!overtimeHours) {
      setError('開始時間と終了時間を正しく入力してください。');
      return;
    }

    const newEntry = {
      id: `overtime_${Date.now()}`,
      date,
      startTime,
      endTime,
      reason,
      memo,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setSuccess('残業を保存しました（デモ）');
    setError('');
    setMemo('');
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-4">
        <section className="rounded-[2rem] bg-amber-50/90 p-5 shadow-sm shadow-slate-200">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-800">残業申請</p>
            <h1 className="text-3xl font-semibold text-slate-900">残業申請</h1>
            <p className="text-sm leading-6 text-slate-600">
              予定より長く働いた時間を記録できます
            </p>
          </div>
          <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-sm shadow-slate-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white">
              H
            </div>
            <div>
              <p className="text-sm text-slate-500">従業員</p>
              <p className="text-base font-semibold text-slate-900">山田 花子</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <p className="text-sm leading-6 text-slate-600">
            この画面では、予定より長く働いた時間を記録します。
            給与計算ではなく、勤務時間の確認用です。
          </p>
        </section>

        <section className="space-y-4 rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">日付</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">開始時間</label>
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">終了時間</label>
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">理由</p>
            <div className="flex flex-wrap gap-2">
              {reasonOptions.map((option) => {
                const selected = option === reason;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setReason(option)}
                    className={`rounded-3xl px-4 py-3 text-sm font-medium transition ${selected ? 'bg-green-700 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">メモ</label>
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              rows={4}
              placeholder="作業内容やお知らせを書いてください"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="rounded-[2rem] bg-emerald-50 p-4 shadow-sm shadow-slate-200">
            <p className="text-sm font-medium text-slate-700">計算プレビュー</p>
            <p className="mt-2 text-2xl font-semibold text-green-900">残業時間</p>
            <p className="mt-1 text-lg text-slate-700">{overtimeLabel}</p>
          </div>

          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {success}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-3xl bg-green-700 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-green-200 transition hover:bg-green-800"
          >
            残業を記録する
          </button>
        </section>

        <section className="space-y-4 rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">最近の残業記録</p>
              <p className="text-xs text-slate-500">最新の記録を確認できます</p>
            </div>
          </div>

          <div className="space-y-3 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-3 shadow-inner shadow-slate-100 max-h-[360px] overflow-y-auto">
            {entries.map((entry) => {
              const hours = calculateOvertime(entry.startTime, entry.endTime);
              return (
                <div key={entry.id} className="rounded-[1.75rem] bg-white p-4 shadow-sm shadow-slate-200">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{formatDateLabel(entry.date)}</p>
                      <p className="text-sm text-slate-500">{entry.startTime}〜{entry.endTime}</p>
                    </div>
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                      {hours ? formatHours(hours) : '未入力'}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="text-xs text-slate-500">理由</p>
                      <p className="mt-1 font-medium text-slate-900">{entry.reason}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="text-xs text-slate-500">メモ</p>
                      <p className="mt-1 min-h-[1.5rem] text-slate-900">{entry.memo || 'なし'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] bg-amber-50/80 p-5 text-sm text-slate-600 shadow-sm shadow-slate-200">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </section>
      </div>
    </AppShell>
  );
}
