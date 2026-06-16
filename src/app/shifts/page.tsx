"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";
import { DEMO_START_DATE, employees as coreEmployees, shiftTypes as coreShiftTypes } from "@/lib/mock-data/core";
import type { ShiftCode } from "@/types/domain";

type Employee = {
  id: string;
  name: string;
  initials: string;
};

type Assignment = {
  employeeId: string;
  shift: WorkerShiftCode;
};

type CalendarDay = {
  key: string;
  month: number;
  day: number;
  weekday: string;
};

type WeekGroup = {
  label: string;
  days: CalendarDay[];
};

type WorkerShiftCode = Exclude<ShiftCode, "sick">;

const selfEmployeeId = "yamada";
const basePeriodStart = DEMO_START_DATE;
const weekdays = ["月", "火", "水", "木", "金", "土", "日"];

const coreEmployeeById = Object.fromEntries(coreEmployees.map((employee) => [employee.id, employee]));

const employees: Employee[] = [
  { id: "yamada", name: coreEmployeeById.yamada?.name ?? "山田 花子", initials: coreEmployeeById.yamada?.avatarLabel ?? "YH" },
  { id: "sato", name: coreEmployeeById.sato?.name ?? "佐藤 健", initials: coreEmployeeById.sato?.avatarLabel ?? "SK" },
  { id: "suzuki", name: coreEmployeeById.suzuki?.name ?? "鈴木 愛", initials: coreEmployeeById.suzuki?.avatarLabel ?? "SA" },
  { id: "ito", name: coreEmployeeById.ito?.name ?? "伊藤 翔", initials: coreEmployeeById.ito?.avatarLabel ?? "IS" },
  { id: "takahashi", name: coreEmployeeById.takahashi?.name ?? "高橋 美咲", initials: coreEmployeeById.takahashi?.avatarLabel ?? "TM" },
  { id: "tanaka", name: coreEmployeeById.tanaka?.name ?? "田中 優", initials: coreEmployeeById.tanaka?.avatarLabel ?? "TY" },
  { id: "nakamura", name: "中村 蓮", initials: "NR" },
  { id: "kobayashi", name: "小林 杏", initials: "KA" },
  { id: "aoki", name: "青木 悠", initials: "AY" },
  { id: "kato", name: "加藤 凛", initials: "KR" },
  { id: "watanabe", name: "渡辺 陽", initials: "WY" },
  { id: "yoshida", name: "吉田 葵", initials: "YA" },
  { id: "yamamoto", name: "山本 海", initials: "YK" },
  { id: "matsumoto", name: "松本 澪", initials: "MM" },
  { id: "inoue", name: "井上 空", initials: "IS" },
  { id: "hayashi", name: "林 結衣", initials: "HY" },
];

const shiftTypes = coreShiftTypes.map((shift) => ({
  code: shift.code,
  label: shift.label,
  marker: shift.code === "shift_1" ? "1" : shift.code === "shift_2" ? "2" : shift.shortLabel,
  time: shift.startTime && shift.endTime ? `${shift.startTime}〜${shift.endTime}` : "",
  hours: shift.hours,
})) satisfies { code: ShiftCode; label: string; marker: string; time: string; hours: number }[];

const shiftPattern: WorkerShiftCode[] = [
  "shift_1",
  "shift_2",
  "off",
  "shift_1",
  "shift_2",
  "full_day",
  "off",
  "shift_1",
  "vacation",
  "shift_2",
  "off",
  "shift_1",
  "full_day",
  "off",
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
  const weekday = weekdays[(date.getUTCDay() + 6) % 7];
  return {
    key: dateKey,
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday,
  };
}

function getTwoWeekPeriod(startDate: string) {
  return Array.from({ length: 14 }, (_, index) => createCalendarDay(addDays(startDate, index)));
}

function groupDaysIntoWeeks(days: CalendarDay[]): WeekGroup[] {
  return [
    { label: "W1", days: days.slice(0, 7) },
    { label: "W2", days: days.slice(7, 14) },
  ];
}

function createAssignments(days: CalendarDay[]) {
  return days.reduce<Record<string, Assignment[]>>((calendar, day, dayIndex) => {
    const workingLimit = dayIndex % 7 === 5 ? 8 : dayIndex % 7 === 6 ? 4 : 6;
    let workingCount = 0;

    calendar[day.key] = employees.map((employee, employeeIndex) => {
      let shift = shiftPattern[(dayIndex + employeeIndex * 3) % shiftPattern.length];

      if (employee.id === selfEmployeeId && dayIndex % 9 === 2) {
        shift = "full_day";
      }

      const isWorkingShift = shift === "shift_1" || shift === "shift_2" || shift === "full_day";
      if (isWorkingShift) {
        workingCount += shift === "full_day" ? 2 : 1;
      }
      if (workingCount > workingLimit && employee.id !== selfEmployeeId) {
        shift = employeeIndex % 4 === 0 ? "vacation" : "off";
      }

      return { employeeId: employee.id, shift };
    });

    return calendar;
  }, {});
}

function getShiftType(code: ShiftCode) {
  return shiftTypes.find((shift) => shift.code === code) ?? shiftTypes[0];
}

function getEmployeeShiftForDate(assignments: Record<string, Assignment[]>, employeeId: string, date: string) {
  return assignments[date]?.find((assignment) => assignment.employeeId === employeeId) ?? null;
}

function getShiftCellMeta(shiftCode: WorkerShiftCode) {
  const shift = getShiftType(shiftCode);
  const styles: Record<WorkerShiftCode, string> = {
    shift_1: "border-emerald-200 bg-emerald-50 text-emerald-800",
    shift_2: "border-amber-200 bg-amber-50 text-amber-800",
    full_day: "border-sky-200 bg-sky-50 text-sky-800",
    off: "border-slate-200 bg-slate-50 text-slate-500",
    vacation: "border-rose-100 bg-rose-50/70 text-rose-700",
  };
  return { ...shift, className: styles[shiftCode] };
}

function calculateWeeklyTotal(assignments: Record<string, Assignment[]>, employeeId: string, weekDays: CalendarDay[]) {
  return weekDays.reduce((total, day) => {
    const assignment = getEmployeeShiftForDate(assignments, employeeId, day.key);
    return total + (assignment ? getShiftType(assignment.shift).hours : 0);
  }, 0);
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

function countWorkingPeople(assignments: Record<string, Assignment[]>, day: CalendarDay, shiftCodes: WorkerShiftCode[]) {
  return (assignments[day.key] ?? []).filter((assignment) => shiftCodes.includes(assignment.shift)).length;
}

function formatPeriod(days: CalendarDay[]) {
  return `${formatDayLabel(days[0])}〜${formatDayLabel(days[days.length - 1])}`;
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
  const [periodOffset, setPeriodOffset] = useState(0);

  const periodStart = addDays(basePeriodStart, periodOffset * 14);
  const periodDays = useMemo(() => getTwoWeekPeriod(periodStart), [periodStart]);
  const weekGroups = useMemo(() => groupDaysIntoWeeks(periodDays), [periodDays]);
  const assignments = useMemo(() => createAssignments(periodDays), [periodDays]);

  return (
    <div className="space-y-3 pb-4">
      <div className="space-y-2">
        <p className="text-sm font-bold tracking-[0.14em] text-emerald-800">{t("shifts.twoWeekSchedule")}</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPeriodOffset((current) => current - 1)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm"
          >
            {t("shifts.previousTwoWeeks")}
          </button>
          <span className="min-w-[86px] text-center text-sm font-bold text-slate-950">{formatPeriod(periodDays)}</span>
          <button
            type="button"
            onClick={() => setPeriodOffset((current) => current + 1)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm"
          >
            {t("shifts.nextTwoWeeks")}
          </button>
        </div>
      </div>

      <section className="space-y-4">
        {weekGroups.map((week) => (
          <WeekTable key={week.label} week={week} assignments={assignments} t={t} />
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">{t("shifts.legend")}</h2>
        <div className="mt-2 grid grid-cols-1 gap-1.5 text-[11px] min-[380px]:grid-cols-2">
          {(["shift_1", "shift_2", "full_day", "off", "vacation"] as WorkerShiftCode[]).map((code) => {
            const meta = getShiftCellMeta(code);
            return (
              <div key={code} className="flex items-center gap-2">
                <span className={`inline-flex min-w-9 justify-center rounded-md border px-1.5 py-0.5 font-bold ${meta.className}`}>
                  {meta.marker}
                </span>
                <span className="text-slate-600">
                  {meta.label}
                  {meta.time ? ` / ${meta.time}` : ""}
                </span>
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
  week,
  assignments,
  t,
}: {
  week: WeekGroup;
  assignments: Record<string, Assignment[]>;
  t: (key: string) => string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-2 py-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-950">
            {week.label} <span className="text-xs font-semibold text-slate-600">{formatWeekRange(week.days)}</span>
          </h2>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {employees.length}
            {t("shifts.peopleCountSuffix")}
          </span>
        </div>
      </div>

      <div>
        <div className="w-full">
          <div className="grid grid-cols-[58px_repeat(7,minmax(0,1fr))_34px] border-b border-slate-200 bg-white text-center text-[9px] font-semibold text-slate-500 min-[380px]:grid-cols-[66px_repeat(7,minmax(0,1fr))_40px]">
            <div className="border-r border-slate-200 bg-white px-1 py-1.5 text-left">{t("shifts.employee")}</div>
            {week.days.map((day) => (
              <div key={day.key} className="border-r border-slate-100 px-0.5 py-1.5">
                <span className="block font-bold leading-none text-slate-900">{day.day}</span>
                <span className="mt-0.5 block leading-none">{day.weekday}</span>
              </div>
            ))}
            <div className="px-0.5 py-1.5 leading-tight">{t("shifts.weeklyTotal")}</div>
          </div>

          {employees.map((employee) => {
            const isSelf = employee.id === selfEmployeeId;
            const weeklyTotal = calculateWeeklyTotal(assignments, employee.id, week.days);
            return (
              <div
                key={employee.id}
                className={`grid grid-cols-[58px_repeat(7,minmax(0,1fr))_34px] border-b border-slate-100 text-center text-[10px] last:border-b-0 min-[380px]:grid-cols-[66px_repeat(7,minmax(0,1fr))_40px] ${
                  isSelf ? "bg-emerald-50/55" : "bg-white"
                }`}
              >
                <div
                  className={`flex h-8 min-w-0 items-center border-r border-slate-200 px-1 text-left ${
                    isSelf ? "border-l-4 border-l-emerald-600 bg-emerald-50" : "bg-white"
                  }`}
                >
                  <div className="min-w-0 leading-none">
                    <div className="flex min-w-0 items-center gap-0.5">
                      <span className="truncate text-[10px] font-bold text-slate-900">{employee.name}</span>
                      {isSelf ? (
                        <span className="shrink-0 rounded-full bg-emerald-700 px-1 py-0.5 text-[8px] font-bold text-white">{t("shifts.you")}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {week.days.map((day) => {
                  const assignment = getEmployeeShiftForDate(assignments, employee.id, day.key);
                  if (!assignment) {
                    return <div key={day.key} className="flex h-8 items-center justify-center border-r border-slate-100 bg-white" />;
                  }
                  const meta = getShiftCellMeta(assignment.shift);
                  return (
                    <div key={day.key} className="flex h-8 items-center justify-center border-r border-slate-100 px-0.5 py-0.5">
                      <span className={`inline-flex h-6 w-full items-center justify-center rounded border px-0.5 font-bold leading-none ${meta.className}`}>
                        {meta.marker}
                      </span>
                    </div>
                  );
                })}

                <div className="flex h-8 items-center justify-center px-0.5 text-[9px] font-bold text-slate-900">{formatHours(weeklyTotal)}</div>
              </div>
            );
          })}

          <div className="grid grid-cols-[58px_repeat(7,minmax(0,1fr))_34px] bg-slate-50 text-center text-[8px] font-semibold text-slate-600 min-[380px]:grid-cols-[66px_repeat(7,minmax(0,1fr))_40px]">
            <div className="border-r border-slate-200 bg-slate-50 px-1 py-1.5 text-left">{t("shifts.staffing")}</div>
            {week.days.map((day) => (
              <div key={day.key} className="space-y-0.5 border-r border-slate-100 px-0.5 py-1">
                <span className="block text-emerald-700">
                  A{countWorkingPeople(assignments, day, ["shift_1", "full_day"])}
                </span>
                <span className="block text-amber-700">
                  P{countWorkingPeople(assignments, day, ["shift_2", "full_day"])}
                </span>
              </div>
            ))}
            <div className="px-0.5 py-1 text-slate-400">-</div>
          </div>
        </div>
      </div>
    </article>
  );
}
