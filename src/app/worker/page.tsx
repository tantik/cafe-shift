'use client';

import { useState } from 'react';
import AppShell from '@/components/app-shell';
import Link from 'next/link';

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
  '2026-06-01': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'ST', 'TJ'] },
  '2026-06-02': { type: '2シフト', time: '13:00–17:30', workers: ['SH', 'TK'] },
  '2026-06-03': { type: '通しシフト', time: '08:30–17:30', workers: ['IY'] },
  '2026-06-04': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'SH'] },
  '2026-06-05': { type: '2シフト', time: '13:00–17:30', workers: ['ST', 'TJ', 'TK'] },
  '2026-06-06': { type: '休み', time: '—', workers: [] },
  '2026-06-07': { type: '休暇', time: '—', workers: [] },
  '2026-06-08': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'TJ'] },
  '2026-06-09': { type: '2シフト', time: '13:00–17:30', workers: ['SH', 'TK', 'IY'] },
  '2026-06-10': { type: '通しシフト', time: '08:30–17:30', workers: ['ST'] },
  '2026-06-11': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'SH', 'TJ'] },
  '2026-06-12': { type: '2シフト', time: '13:00–17:30', workers: ['TK', 'IY'] },
  '2026-06-13': { type: '休み', time: '—', workers: [] },
  '2026-06-14': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'ST', 'TK'] },
  '2026-06-15': { type: '2シフト', time: '13:00–17:30', workers: ['SH', 'IY'] },
  '2026-06-16': { type: '通しシフト', time: '08:30–17:30', workers: ['TJ', 'ST'] },
  '2026-06-17': { type: '休み', time: '—', workers: [] },
  '2026-06-18': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'SH'] },
  '2026-06-19': { type: '2シフト', time: '13:00–17:30', workers: ['TK', 'IY'] },
  '2026-06-20': { type: '休暇', time: '—', workers: [] },
  '2026-06-21': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'TJ'] },
  '2026-06-22': { type: '2シフト', time: '13:00–17:30', workers: ['SH', 'ST'] },
  '2026-06-23': { type: '通しシフト', time: '08:30–17:30', workers: ['TK'] },
  '2026-06-24': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'IY'] },
  '2026-06-25': { type: '2シフト', time: '13:00–17:30', workers: ['ST', 'TJ'] },
  '2026-06-26': { type: '休み', time: '—', workers: [] },
  '2026-06-27': { type: '休暇', time: '—', workers: [] },
  '2026-06-28': { type: '1シフト', time: '08:30–13:00', workers: ['YH', 'SH', 'TK'] },
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
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-01');

  const today = new Date('2026-06-01');
  const startDate = new Date('2026-06-01');
  const dates = generateDates(startDate, 56);
  const slides = Array.from({ length: 4 }, (_, index) => dates.slice(index * 14, index * 14 + 14));

  const selectedShift = mockShifts[selectedDate as keyof typeof mockShifts] ?? null;

  return (
    <AppShell>
      <div className="space-y-5 pb-4">
        {/* Header */}
        <section className="rounded-3xl bg-amber-50/90 p-5 shadow-sm shadow-slate-200">
          <div>
            <p className="text-sm font-semibold text-green-800">スタッフ画面</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">今日の予定</h1>
            <p className="mt-2 text-sm text-slate-600">選択した日のシフトとメンバーを確認できます</p>
          </div>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-sm shadow-slate-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white">
              {mockEmployee.initials}
            </div>
            <div>
              <p className="text-xs text-slate-500">従業員</p>
              <p className="text-base font-semibold text-slate-900">{mockEmployee.name}</p>
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

        {/* 8-Week Shift Calendar */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">8週間シフト</h3>
              <p className="text-sm text-slate-500">2週間ずつ横にスクロールして確認できます</p>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">全56日</div>
          </div>

          <div className="mt-4 overflow-x-auto snap-x snap-mandatory pb-3">
            <div className="flex gap-3">
              {slides.map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full flex-none snap-start">
                  <div className="grid grid-cols-7 gap-2">
                    {slide.map((date) => {
                      const dateStr = formatDate(date);
                      const shift = mockShifts[dateStr as keyof typeof mockShifts];
                      const isToday = dateStr === formatDate(today);
                      const isSelected = dateStr === selectedDate;
                      const isTodaySelected = isToday && isSelected;
                      const dayOfWeek = getDayOfWeek(date);
                      const marker = shift ? getShiftMarker(shift.type) : '';

                      const baseBg = shift?.type === '休み' ? 'bg-slate-100' : shift?.type === '休暇' ? 'bg-amber-50' : 'bg-white';
                      const baseBorder = shift?.type === '休み' ? 'border-slate-200' : shift?.type === '休暇' ? 'border-amber-100' : 'border-slate-200';

                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`min-h-[86px] rounded-2xl border p-2 text-left transition ${
                            isTodaySelected
                              ? 'border-green-700 bg-emerald-100 ring-2 ring-amber-300'
                              : isSelected
                                ? 'border-green-700 bg-emerald-100'
                                : isToday
                                  ? `border-amber-400 bg-amber-50`
                                  : `${baseBorder} ${baseBg}`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                              {dayOfWeek}
                            </p>
                            {isToday && <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />}
                          </div>
                          <p className={`mt-1 text-base font-semibold ${isSelected ? 'text-green-900' : 'text-slate-900'}`}>
                            {date.getDate()}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-700">{marker}</p>
                          {shift?.workers.length ? (
                            <p className="mt-2 text-[10px] leading-4 text-slate-600">
                              {shift.workers.slice(0, 2).join(' ')}{shift.workers.length > 2 && ` +${shift.workers.length - 2}`}
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-3 text-center text-sm text-slate-600">
            ← 横にスクロール →
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
          <Link
            href="/overtime"
            className="block rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 text-center text-base font-semibold text-white shadow-sm shadow-slate-200 transition hover:shadow-md"
          >
            残業申請
          </Link>
        </section>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3 text-center">
          <p className="text-xs text-slate-500">言語: 日本語</p>
        </div>
      </div>
    </AppShell>
  );
}
