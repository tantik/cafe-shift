"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";
import { DEMO_START_DATE, shiftTypes as coreShiftTypes } from "@/lib/mock-data/core";
import type { ShiftCode } from "@/types/domain";

type ViewMode = "self" | "all";

type Employee = {
  id: string;
  name: string;
  initials: string;
};

type Assignment = {
  employeeId: string;
  shift: ShiftCode;
};

type CalendarDay = {
  key: string;
  month: number;
  day: number;
  weekday: string;
};

const selfEmployeeId = "yamada";
const mockToday = DEMO_START_DATE;
const initialSelectedDate = DEMO_START_DATE;

const employees: Employee[] = [
  { id: "yamada", name: "山田 花子", initials: "YH" },
  { id: "sato", name: "佐藤 健", initials: "SK" },
  { id: "suzuki", name: "鈴木 愛", initials: "SA" },
  { id: "ito", name: "伊藤 翔", initials: "IS" },
  { id: "takahashi", name: "高橋 美咲", initials: "TM" },
  { id: "tanaka", name: "田中 優", initials: "TY" },
  { id: "nakamura", name: "中村 蓮", initials: "NR" },
  { id: "kobayashi", name: "小林 杏", initials: "KA" },
];

const shiftTypes = coreShiftTypes.map((shift) => ({
  code: shift.code,
  label: shift.label,
  marker: shift.shortLabel,
  time: shift.startTime && shift.endTime ? `${shift.startTime}–${shift.endTime}` : "",
})) satisfies { code: ShiftCode; label: string; marker: string; time: string }[];

const weekdays = ["月", "火", "水", "木", "金", "土", "日"];

const days: CalendarDay[] = Array.from({ length: 56 }, (_, index) => {
  const isJune = index < 30;
  const month = isJune ? 6 : 7;
  const day = isJune ? index + 1 : index - 29;
  return {
    key: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    month,
    day,
    weekday: weekdays[index % weekdays.length],
  };
});

const shiftPattern: ShiftCode[] = ["shift_1", "shift_2", "full_day", "off", "shift_1", "shift_2", "vacation"];

function createAssignments() {
  return days.reduce<Record<string, Assignment[]>>((calendar, day, dayIndex) => {
    calendar[day.key] = employees.flatMap((employee, employeeIndex) => {
      if (employee.id === selfEmployeeId && dayIndex % 13 === 11) {
        return [];
      }

      let shift = shiftPattern[(dayIndex + employeeIndex * 2) % shiftPattern.length];
      if ((dayIndex === 9 && employee.id === "ito") || (dayIndex === 18 && employee.id === selfEmployeeId)) {
        shift = "sick";
      }
      return [{ employeeId: employee.id, shift }];
    });
    return calendar;
  }, {});
}

const assignments = createAssignments();

function getShiftType(code: ShiftCode) {
  return shiftTypes.find((shift) => shift.code === code) ?? shiftTypes[0];
}

function formatDate(day: CalendarDay) {
  return `2026年${day.month}月${day.day}日（${day.weekday}）`;
}

function formatGroupSummary(dailyAssignments: Assignment[], shift: ShiftCode) {
  const initials = dailyAssignments
    .filter((assignment) => assignment.shift === shift)
    .map((assignment) => employees.find((employee) => employee.id === assignment.employeeId)?.initials)
    .filter((initial): initial is string => Boolean(initial));

  if (initials.length === 0) {
    return "—";
  }
  return `${initials[0]}${initials.length > 1 ? ` +${initials.length - 1}` : ""}`;
}

export default function ShiftsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("self");
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);

  const selectedDay = days.find((day) => day.key === selectedDate) ?? days[0];
  const selectedAssignments = assignments[selectedDay.key] ?? [];
  const selectedSelfAssignment = selectedAssignments.find((assignment) => assignment.employeeId === selfEmployeeId);
  const selectedSelfShift = selectedSelfAssignment ? getShiftType(selectedSelfAssignment.shift) : null;

  return (
    <AppShell>
      <div className="space-y-4 pb-4">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700">勤務予定</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">シフトカレンダー</h1>
              <p className="mt-1 text-sm text-slate-600">自分のシフトと全体の予定を確認できます</p>
            </div>
            <span className="inline-flex self-start items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-900 text-[11px] font-bold text-white">YH</span>
              山田 花子
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "self" as const, label: "自分" },
              { id: "all" as const, label: "全体" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  viewMode === mode.id
                    ? "border-emerald-700 bg-emerald-800 text-white"
                    : "border-transparent bg-slate-50 text-slate-600"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-900">2週間シフト</h2>
              <p className="text-xs text-slate-500">横にスライドして次の予定を確認</p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">56日分</span>
          </div>

          <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 4 }, (_, index) => days.slice(index * 14, index * 14 + 14)).map((period, index) => (
              <div key={index} className="grid min-w-full snap-start grid-cols-7 gap-1.5">
                {period.map((day) => {
                  const dailyAssignments = assignments[day.key] ?? [];
                  const selfAssignment = dailyAssignments.find((assignment) => assignment.employeeId === selfEmployeeId);
                  const selfShift = selfAssignment ? getShiftType(selfAssignment.shift) : null;
                  const isToday = day.key === mockToday;
                  const isSelected = day.key === selectedDate;

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDate(day.key)}
                      className={`min-h-[106px] rounded-xl border p-1.5 text-left transition ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 shadow-sm"
                          : isToday
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-100 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-0.5">
                        <span className="text-[10px] text-slate-500">{day.weekday}</span>
                        {isToday ? <span className="text-[9px] font-semibold text-emerald-700">今日</span> : null}
                      </div>
                      <span className="block text-sm font-bold text-slate-900">{day.day}</span>

                      {viewMode === "self" ? (
                        <span
                          className={`mt-3 block truncate text-xs font-semibold ${
                            selfShift?.code === "sick" ? "text-rose-700" : "text-emerald-800"
                          }`}
                        >
                          {selfShift?.marker ?? "予定なし"}
                        </span>
                      ) : (
                        <span className="mt-1 block text-[9px] leading-4 text-slate-600">
                          <span className="block truncate">① {formatGroupSummary(dailyAssignments, "shift_1")}</span>
                          <span className="block truncate">② {formatGroupSummary(dailyAssignments, "shift_2")}</span>
                          <span className="block truncate">通 {formatGroupSummary(dailyAssignments, "full_day")}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-xs text-slate-500">← 横にスライド →</p>
        </section>

        {viewMode === "self" ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">自分のシフト</h2>
            <p className="mt-1 text-sm text-slate-500">{formatDate(selectedDay)}</p>
            {selectedSelfShift ? (
              <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900 text-xs font-bold text-white">
                    YH
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedSelfShift.label}</p>
                    {selectedSelfShift.time ? <p className="text-sm text-emerald-800">{selectedSelfShift.time}</p> : null}
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {selectedSelfShift.code === "off"
                    ? "本日はお休みです。"
                    : selectedSelfShift.code === "vacation"
                      ? "休暇の予定です。"
                      : selectedSelfShift.code === "sick"
                        ? "病欠として登録されています。"
                        : "この時間帯で勤務予定です。"}
                </p>
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">予定はありません</p>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">選択した日のシフト</h2>
            <p className="mt-1 text-sm text-slate-500">{formatDate(selectedDay)}</p>
            <div className="mt-3 space-y-2">
              {shiftTypes.map((shift) => {
                const members = selectedAssignments.filter((assignment) => assignment.shift === shift.code);
                return (
                  <div key={shift.code} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {shift.label} {shift.time}
                      </p>
                      <span className="text-xs text-slate-500">{members.length}名</span>
                    </div>
                    {members.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-400">該当なし</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {members.map((assignment) => {
                          const employee = employees.find((item) => item.id === assignment.employeeId);
                          return employee ? (
                            <div key={employee.id} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-900 text-[10px] font-bold text-white">
                                {employee.initials}
                              </span>
                              <span className="text-xs font-medium text-slate-700">{employee.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="grid grid-cols-2 gap-2">
          <Link
            href="/requests"
            className="rounded-xl border border-emerald-200 bg-white px-3 py-3 text-center text-sm font-semibold text-emerald-800 shadow-sm"
          >
            シフト希望を出す
          </Link>
          <Link
            href="/overtime"
            className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-center text-sm font-semibold text-amber-800 shadow-sm"
          >
            残業申請
          </Link>
        </section>

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際のシフトは後でSupabaseに接続します。
        </p>
      </div>
    </AppShell>
  );
}
