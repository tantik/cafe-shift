'use client';

import { useMemo, useState } from 'react';
import AppShell from '@/components/app-shell';

const initialRequests = [
  {
    id: 'vacation_001',
    startDate: '2026-06-10',
    endDate: '2026-06-14',
    comment: '家族旅行のため',
  },
  {
    id: 'vacation_002',
    startDate: '2026-07-05',
    endDate: '2026-07-07',
    comment: '帰省のため',
  },
];

function calculateDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const diff = end.getTime() - start.getTime();
  if (diff < 0) {
    return null;
  }
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export default function VacationsPage() {
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-03');
  const [comment, setComment] = useState('');
  const [requests, setRequests] = useState(initialRequests);
  const [nextRequestId, setNextRequestId] = useState(3);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const days = useMemo(() => calculateDays(startDate, endDate), [startDate, endDate]);

  const handleSubmit = () => {
    setError('');
    setSuccess('');

    if (!startDate || !endDate) {
      setError('開始日と終了日を入力してください。');
      return;
    }

    if (calculateDays(startDate, endDate) === null) {
      setError('終了日は開始日以降の日付にしてください。');
      return;
    }

    const newRequest = {
      id: `vacation_${String(nextRequestId).padStart(3, '0')}`,
      startDate,
      endDate,
      comment,
    };

    setRequests((prev) => [newRequest, ...prev]);
    setNextRequestId((current) => current + 1);
    setSuccess('休暇希望を追加しました（デモ）');
    setComment('');
  };

  const handleDelete = (id: string) => {
    setRequests((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-4">
        <section className="rounded-[2rem] bg-amber-50/90 p-5 shadow-sm shadow-slate-200">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-800">休暇希望</p>
            <h1 className="text-3xl font-semibold text-slate-900">休暇希望</h1>
            <p className="text-sm leading-6 text-slate-600">
              年間の休暇希望を事前に入力できます
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
            この画面では、休暇の希望日を入力できます。
            最終的な調整は管理者が行います。
          </p>
        </section>

        <section className="space-y-5 rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">開始日</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">終了日</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">コメント</label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              placeholder="例）家族旅行のため、帰省のため"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="rounded-[2rem] bg-emerald-50 p-4 shadow-sm shadow-slate-200">
            <p className="text-sm font-medium text-slate-700">日数プレビュー</p>
            <p className="mt-2 text-2xl font-semibold text-green-900">
              {days ? `${days}日` : '未入力'}
            </p>
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
            休暇希望を追加する
          </button>
        </section>

        <section className="space-y-4 rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">登録した休暇希望</p>
              <p className="text-xs text-slate-500">希望した休暇情報を一覧で確認できます</p>
            </div>
          </div>

          <div className="space-y-3 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-3 shadow-inner shadow-slate-100 max-h-[360px] overflow-y-auto">
            {requests.length === 0 ? (
              <div className="rounded-[1.75rem] bg-white p-5 text-center text-sm text-slate-500">
                まだ休暇希望が登録されていません
              </div>
            ) : (
              requests.map((request) => {
                const duration = calculateDays(request.startDate, request.endDate);
                return (
                  <div key={request.id} className="rounded-[1.75rem] bg-white p-4 shadow-sm shadow-slate-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-slate-500">開始</p>
                          <p className="font-medium text-slate-900">{request.startDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">終了</p>
                          <p className="font-medium text-slate-900">{request.endDate}</p>
                        </div>
                      </div>
                      <div className="rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900">
                        {duration ? `${duration}日` : '日数不明'}
                      </div>
                    </div>
                    <div className="mt-4 rounded-[1.5rem] bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="text-xs text-slate-500">コメント</p>
                      <p className="mt-1 text-slate-900">{request.comment || 'なし'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(request.id)}
                      className="mt-4 w-full rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      削除
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-[2rem] bg-amber-50/80 p-5 text-sm text-slate-600 shadow-sm shadow-slate-200">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </section>
      </div>
    </AppShell>
  );
}
