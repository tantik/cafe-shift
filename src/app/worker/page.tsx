'use client';

import { useState } from 'react';
import AppShell from '@/components/app-shell';

type ViewMode = 'self' | 'all';

// Mock data
const mockEmployee = {
  id: 'emp_001',
  name: '山田 花子',
  initials: 'YH',
};

const mockEmployees = [
  { id: 'emp_001', name: '山田 花子', initials: 'YH' },
  { id: 'emp_002', name: '佐藤 太郎', initials: 'ST' },
  { id: 'emp_003', name: '田中 次郎', initials: 'TJ' },
  { id: 'emp_004', name: '鈴木 花美', initials: 'SH' },
  { id: 'emp_005', name: '高橋 健太', initials: 'TK' },
  { id: 'emp_006', name: '伊藤 由美', initials: 'IY' },
];

const mockShifts = {
  '2025-05-25': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'ST', 'TJ'] },
  '2025-05-26': { type: '2シフト', time: '13:00–17:30', workers: ['SH', 'TK'] },
  '2025-05-27': { type: '通しシフト', time: '08:30–17:30', workers: ['IY'] },
  '2025-05-28': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'SH'] },
  '2025-05-29': { type: '2シフト', time: '13:00–17:30', workers: ['ST', 'TJ', 'TK'] },
  '2025-05-30': { type: '休み', time: '—', workers: [] },
  '2025-05-31': { type: '休暇', time: '—', workers: [] },
  '2025-06-01': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'TJ'] },
  '2025-06-02': { type: '2シフト', time: '13:00–17:30', workers: ['SH', 'TK', 'IY'] },
  '2025-06-03': { type: '通しシフト', time: '08:30–17:30', workers: ['ST'] },
  '2025-06-04': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'SH', 'TJ'] },
  '2025-06-05': { type: '2シフト', time: '13:00–17:30', workers: ['TK', 'IY'] },
  '2025-06-06': { type: '休み', time: '—', workers: [] },
  '2025-06-07': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'ST', 'TK'] },
};

function getShiftMarker(type: string): string {
  switch (type) {
    case '1シフト':
      return '①';
    case '2シフト':
      return '②';
    case '通しシフト':
      return '通';
    case '休み':
      return '休';
    case '休暇':
      return '休暇';
    default:
      return '';
  }
}

function generateDates(startDate: Date, days: number): Date[] {
  const result = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    result.push(date);
  }
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayOfWeek(date: Date): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[date.getDay()];
}

function getShiftColor(type: string): string {
  if (type === '休み') return 'bg-slate-100 border-slate-200';
  if (type === '休暇') return 'bg-amber-50 border-amber-200';
  return 'bg-white border-slate-200';
}

export default function WorkerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('self');
  const [selectedDate, setSelectedDate] = useState<string>('2025-05-25');

  const today = new Date('2025-05-25');
  const startDate = new Date('2025-05-25');
  const dates = generateDates(startDate, 14);

  const todayShift = mockShifts['2025-05-25'];
  const selectedShift = mockShifts[selectedDate as keyof typeof mockShifts];

  return (
    <AppShell>
      <div className="space-y-5 pb-4">
        {/* Header */}
        <section className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm shadow-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900">スタッフ画面</h2>
          <p className="mt-2 text-sm text-slate-600">今日のシフトと今後の予定を確認できます</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-xs font-semibold text-white">
              {mockEmployee.initials}
            </div>
            <span className="text-sm font-medium text-slate-700">{mockEmployee.name}</span>
          </div>
        </section>

        {/* Today's Shift */}
        <section className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">今日のシフト</h3>
          <div className="mt-3 space-y-2">
            <p className="text-sm text-slate-500">5月25日（月）</p>
            <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4">
              <p className="font-semibold text-green-900">{todayShift.type}</p>
              <p className="text-sm text-green-700">{todayShift.time}</p>
            </div>
          </div>

          {/* Workers Summary */}
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">本日のスタッフ</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">①</span>
                <span className="text-sm text-slate-600">山田, 佐藤, 田中</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">②</span>
                <span className="text-sm text-slate-600">鈴木, 高橋</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">通</span>
                <span className="text-sm text-slate-600">伊藤</span>
              </div>
            </div>
          </div>
        </section>

        {/* View Mode Switch */}
        <div className="flex gap-2 rounded-2xl bg-slate-100 p-2">
          <button
            onClick={() => setViewMode('self')}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              viewMode === 'self'
                ? 'bg-white text-green-700 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            自分
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              viewMode === 'all'
                ? 'bg-white text-green-700 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            全体
          </button>
        </div>

        {/* 2-Week Shift Calendar */}
        <section>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">2週間シフト</h3>
          <p className="mb-4 text-sm text-slate-500">今週と来週をまとめて確認できます</p>

          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => {
              const dateStr = formatDate(date);
              const shift = mockShifts[dateStr as keyof typeof mockShifts];
              const isToday = dateStr === formatDate(today);
              const isSelected = dateStr === selectedDate;
              const dayOfWeek = getDayOfWeek(date);
              const marker = shift ? getShiftMarker(shift.type) : '';

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`rounded-2xl border-2 p-3 text-center transition ${
                    isSelected
                      ? 'border-green-700 bg-green-50 shadow-md'
                      : isToday
                        ? `border-amber-400 ${getShiftColor(shift?.type || '')} shadow-sm shadow-slate-200`
                        : `border-slate-200 ${getShiftColor(shift?.type || '')} shadow-sm shadow-slate-200`
                  }`}
                >
                  <p className={`text-xs font-semibold ${isSelected ? 'text-green-700' : 'text-slate-500'}`}>
                    {dayOfWeek}
                  </p>
                  <p className={`mt-1 text-lg font-bold ${isSelected ? 'text-green-900' : 'text-slate-900'}`}>
                    {date.getDate()}
                  </p>
                  {shift && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-semibold text-slate-700">{marker}</p>
                      {shift.workers.length > 0 && (
                        <p className="text-xs text-slate-600">
                          {shift.workers.slice(0, 2).join(' ')}
                          {shift.workers.length > 2 && ` +${shift.workers.length - 2}`}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Day Detail */}
        {selectedShift && (
          <section className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">選択した日の詳細</h3>
            <p className="mt-2 text-sm text-slate-500">
              {new Date(selectedDate).toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
                weekday: 'short',
              })}
            </p>

            {selectedShift.type === '休み' || selectedShift.type === '休暇' ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-600">
                  {selectedShift.type === '休み' ? 'お疲れ様です。' : 'ゆっくり休んでね。'}
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {/* Shift Type Card */}
                <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                  <p className="text-sm text-slate-500">シフト</p>
                  <p className="mt-1 font-semibold text-green-900">{selectedShift.type}</p>
                  <p className="text-sm text-green-700">{selectedShift.time}</p>
                </div>

                {/* Workers List */}
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">本日のメンバー</p>
                  <div className="mt-2 space-y-2">
                    {selectedShift.workers.map((initials) => {
                      const emp = mockEmployees.find((e) => e.initials === initials);
                      return (
                        <div key={initials} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-xs font-semibold text-white">
                            {initials}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{emp?.name || initials}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Quick Actions */}
        <section className="space-y-3">
          <button className="w-full rounded-3xl bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 font-semibold text-white shadow-sm shadow-slate-200 transition hover:shadow-md">
            シフト希望を出す
          </button>
          <button className="w-full rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 font-semibold text-white shadow-sm shadow-slate-200 transition hover:shadow-md">
            残業申請
          </button>
          <button className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 font-semibold text-white shadow-sm shadow-slate-200 transition hover:shadow-md">
            レシピを見る
          </button>
        </section>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3 text-center">
          <p className="text-xs text-slate-500">言語: 日本語</p>
        </div>
      </div>
    </AppShell>
  );
}
