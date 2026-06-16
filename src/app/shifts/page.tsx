"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";
import { DEMO_START_DATE, shiftTypes as coreShiftTypes } from "@/lib/mock-data/core";
import type { ShiftCode } from "@/types/domain";

type Employee = {
  id: string;
  name: string;
};

type CalendarDay = {
  key: string;
  month: number;
  day: number;
  weekday: string;
  weekdayIndex: number;
};

type WorkerWorkShiftCode = "shift_1" | "shift_2" | "shift_3" | "full_day" | "vacation";
type WorkerShiftCode = WorkerWorkShiftCode | "store_closed" | "no_shift";

type Assignment = {
  employeeId: string;
  shift: WorkerShiftCode;
};

const selfEmployeeId = "ly";
const baseWeekStart = DEMO_START_DATE;
const weekdays = ["月", "火", "水", "木", "金", "土", "日"];

const employees: Employee[] = [
  { id: "manabu", name: "まなぶ" },
  { id: "ly", name: "LY" },
  { id: "yuko", name: "ゆうこ" },
  { id: "seira", name: "せいら" },
  { id: "asako", name: "あさこ" },
  { id: "my-ha", name: "My Ha" },
  { id: "hyori", name: "Hyori" },
  { id: "bui", name: "Bui" },
  { id: "olha", name: "Olha" },
  { id: "grace", name: "Grace" },
  { id: "cons", name: "Cons" },
  { id: "bao", name: "Bao" },
  { id: "gyu", name: "GYU" },
  { id: "estany", name: "Estany" },
  { id: "maria", name: "Maria" },
];

const shiftPattern: WorkerShiftCode[] = [
  "shift_1",
  "shift_2",
  "no_shift",
  "full_day",
  "vacation",
  "shift_1",
  "no_shift",
  "shift_2",
  "no_shift",
];

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function addDays(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatDateKey(date);
}

function createCalendarDay(dateKey: string): CalendarDay {
  const date = parseDateKey(dateKey);
  const weekdayIndex = (date.getUTCDay() + 6) % 7;
  return {
    key: dateKey,
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday: weekdays[weekdayIndex],
    weekdayIndex,
  };
}

function getWeekDays(startDate: string) {
  return Array.from({ length: 7 }, (_, index) => createCalendarDay(addDays(startDate, index)));
}

function createAssignments(days: CalendarDay[]) {
  return days.reduce<Record<string, Assignment[]>>((calendar, day, dayIndex) => {
    calendar[day.key] = employees.map((employee, employeeIndex) => {
      if (employee.id === "cons") {
        return {
          employeeId: employee.id,
          shift: day.weekdayIndex === 5 || day.weekdayIndex === 6 ? "no_shift" : "shift_3",
        };
      }

      const isStoreClosed = day.weekdayIndex === 6 && employeeIndex % 5 === 0;
      const shift = isStoreClosed ? "store_closed" : shiftPattern[(employeeIndex + dayIndex * 2) % shiftPattern.length];
      return { employeeId: employee.id, shift };
    });
    return calendar;
  }, {});
}

function getEmployeeShiftForDate(assignments: Record<string, Assignment[]>, employeeId: string, date: string) {
  return assignments[date]?.find((assignment) => assignment.employeeId === employeeId)?.shift ?? "no_shift";
}

function getCoreShift(code: ShiftCode) {
  return coreShiftTypes.find((shift) => shift.code === code);
}

function getShiftCellMeta(shiftCode: WorkerShiftCode) {
  if (shiftCode === "store_closed") {
    return { marker: "休", label: "休み", time: "", hours: 0, isWorkday: false, className: "border-slate-200 bg-slate-100 text-slate-600" };
  }
  if (shiftCode === "no_shift") {
    return { marker: "-", label: "-", time: "", hours: 0, isWorkday: false, className: "border-slate-100 bg-white text-slate-400" };
  }

  const shift = getCoreShift(shiftCode);
  const markerByCode: Record<WorkerWorkShiftCode, string> = {
    shift_1: "1",
    shift_2: "2",
    shift_3: "3",
    full_day: "通",
    vacation: "休暇",
  };
  const styles: Record<WorkerWorkShiftCode, string> = {
    shift_1: "border-emerald-200 bg-emerald-50 text-emerald-800",
    shift_2: "border-rose-200 bg-rose-50 text-rose-700",
    shift_3: "border-yellow-200 bg-yellow-50 text-yellow-800",
    full_day: "border-teal-200 bg-teal-50 text-teal-800",
    vacation: "border-stone-200 bg-stone-50 text-stone-600",
  };

  return {
    marker: markerByCode[shiftCode],
    label: shift?.label ?? markerByCode[shiftCode],
    time: shift?.startTime && shift.endTime ? `${shift.startTime}〜${shift.endTime}` : "",
    hours: shift?.hours ?? 0,
    isWorkday: Boolean(shift?.isWorkingShift),
    className: styles[shiftCode],
  };
}

function calculateWeeklyTotal(assignments: Record<string, Assignment[]>, employeeId: string, weekDays: CalendarDay[]) {
  return weekDays.reduce((total, day) => total + getShiftCellMeta(getEmployeeShiftForDate(assignments, employeeId, day.key)).hours, 0);
}

function formatHours(hours: number) {
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

function formatDayLabel(day: CalendarDay) {
  return `${day.month}/${day.day}`;
}

function formatWeekRange(days: CalendarDay[]) {
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  return `${formatDayLabel(firstDay)}(${firstDay.weekday})〜${formatDayLabel(lastDay)}(${lastDay.weekday})`;
}

function formatPeriod(days: CalendarDay[]) {
  return `${formatDayLabel(days[0])}〜${formatDayLabel(days[days.length - 1])}`;
}

function getClientDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ShiftsPage() {
  return (
    <AppShell>
      <ShiftsContent />
    </AppShell>
  );
}

function ShiftsContent() {
  const { t } = useI18n();
  const [weekOffset, setWeekOffset] = useState(2);
  const [todayKey, setTodayKey] = useState<string | null>(null);

  const weekStart = addDays(baseWeekStart, weekOffset * 7);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const assignments = useMemo(() => createAssignments(weekDays), [weekDays]);

  useEffect(() => {
    const timer = window.setTimeout(() => setTodayKey(getClientDateKey()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-3 pb-4">
      <div className="space-y-2">
        <p className="text-sm font-bold tracking-[0.14em] text-emerald-800">{t("shifts.weeklyShift")}</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWeekOffset((current) => current - 1)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm"
          >
            {t("shifts.previousWeek")}
          </button>
          <span className="min-w-[86px] text-center text-sm font-bold text-slate-950">{formatPeriod(weekDays)}</span>
          <button
            type="button"
            onClick={() => setWeekOffset((current) => current + 1)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm"
          >
            {t("shifts.nextWeek")}
          </button>
        </div>
      </div>

      <WeekTable weekNumber={weekOffset + 1} weekDays={weekDays} assignments={assignments} todayKey={todayKey} t={t} />

      <section className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <h2 className="text-xs font-bold text-slate-900">{t("shifts.legend")}</h2>
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
          {(["shift_1", "shift_2", "shift_3", "full_day", "store_closed", "vacation"] as WorkerShiftCode[]).map((code) => {
            const meta = getShiftCellMeta(code);
            return (
              <div key={code} className="flex min-w-0 items-center gap-1.5">
                <span className={`inline-flex min-w-8 justify-center rounded border px-1 py-0.5 font-bold leading-none ${meta.className}`}>
                  {meta.marker}
                </span>
                <span className="truncate text-slate-600">{meta.time || meta.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <Link
        href="#"
        aria-disabled="true"
        className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-800 shadow-sm"
      >
        {t("shifts.archive")}
        <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">{t("shifts.comingSoon")}</span>
      </Link>
    </div>
  );
}

function WeekTable({
  weekNumber,
  weekDays,
  assignments,
  todayKey,
  t,
}: {
  weekNumber: number;
  weekDays: CalendarDay[];
  assignments: Record<string, Assignment[]>;
  todayKey: string | null;
  t: (key: string) => string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <h2 className="text-sm font-bold text-slate-950">
          W{weekNumber} <span className="text-xs font-semibold text-slate-600">{formatWeekRange(weekDays)}</span>
        </h2>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-[54px_repeat(7,minmax(0,1fr))_42px] border-b border-slate-200 bg-white text-center text-[9px] font-semibold text-slate-500 min-[380px]:grid-cols-[62px_repeat(7,minmax(0,1fr))_48px]">
          <div className="flex min-h-7 items-center border-r border-slate-200 px-1 text-left">{t("shifts.employee")}</div>
          {weekDays.map((day) => (
            <div
              key={day.key}
              className={`border-r border-slate-100 px-0.5 py-1 ${
                day.key === todayKey
                  ? "bg-emerald-50 ring-1 ring-inset ring-emerald-300"
                  : ""
              } ${
                day.weekdayIndex === 5 ? "bg-sky-50/70" : day.weekdayIndex === 6 ? "bg-rose-50/60" : ""
              }`}
            >
              <span className="block font-bold leading-none text-slate-900">{day.day}</span>
              <span className="mt-0.5 block leading-none">{day.weekday}</span>
            </div>
          ))}
          <div className="flex min-h-7 items-center justify-center px-0.5 leading-tight">{t("shifts.weeklyTotal")}</div>
        </div>

        {employees.map((employee) => {
          const isSelf = employee.id === selfEmployeeId;
          const weeklyTotalHours = calculateWeeklyTotal(assignments, employee.id, weekDays);
          return (
            <div
              key={employee.id}
              className={`grid grid-cols-[54px_repeat(7,minmax(0,1fr))_42px] border-b border-slate-100 text-center text-[10px] last:border-b-0 min-[380px]:grid-cols-[62px_repeat(7,minmax(0,1fr))_48px] ${
                isSelf ? "bg-emerald-50/60" : "bg-white"
              }`}
            >
              <div
                className={`flex h-6 min-w-0 items-center border-r border-slate-200 px-1 text-left ${
                  isSelf ? "border-l-4 border-l-emerald-600 bg-emerald-50" : "bg-white"
                }`}
              >
                <span className="min-w-0 truncate text-[10px] font-bold leading-none text-slate-900">{employee.name}</span>
                {isSelf ? <span className="ml-0.5 shrink-0 rounded-full bg-emerald-700 px-1 py-0.5 text-[8px] font-bold text-white">{t("shifts.you")}</span> : null}
              </div>

              {weekDays.map((day) => {
                const meta = getShiftCellMeta(getEmployeeShiftForDate(assignments, employee.id, day.key));
                return (
                  <div
                    key={day.key}
                    className={`flex h-6 items-center justify-center border-r border-slate-100 px-0.5 ${
                      day.key === todayKey
                        ? "bg-emerald-50/70 ring-1 ring-inset ring-emerald-200"
                        : ""
                    } ${
                      day.weekdayIndex === 5 ? "bg-sky-50/50" : day.weekdayIndex === 6 ? "bg-rose-50/40" : ""
                    }`}
                  >
                    <span className={`flex h-5 w-full items-center justify-center border text-[10px] font-bold leading-none ${meta.className}`}>
                      {meta.marker}
                    </span>
                  </div>
                );
              })}

              <div className="flex h-6 items-center justify-center px-0.5 text-[9px] font-bold leading-none text-slate-900">
                {weeklyTotalHours === 0 ? "-" : formatHours(weeklyTotalHours)}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
