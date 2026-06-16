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
  shift: ShiftCode;
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
  marker: shift.shortLabel,
  time: shift.startTime && shift.endTime ? `${shift.startTime}-${shift.endTime}` : "",
  hours: shift.hours,
})) satisfies { code: ShiftCode; label: string; marker: string; time: string; hours: number }[];

const shiftPattern: ShiftCode[] = [
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
      if ((employee.id === "ito" && dayIndex === 4) || (employee.id === "kato" && dayIndex === 10)) {
        shift = "sick";
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

function getShiftCellMeta(shiftCode: ShiftCode) {
  const shift = getShiftType(shiftCode);
  const styles: Record<ShiftCode, string> = {
    shift_1: "border-emerald-200 bg-emerald-50 text-emerald-800",
    shift_2: "border-amber-200 bg-amber-50 text-amber-800",
    full_day: "border-sky-200 bg-sky-50 text-sky-800",
    off: "border-slate-200 bg-slate-50 text-slate-500",
    vacation: "border-pink-200 bg-pink-50 text-pink-700",
    sick: "border-rose-200 bg-rose-50 text-rose-700",
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
  return `${formatDayLabel(firstDay)}(${firstDay.weekday})-${formatDayLabel(lastDay)}(${lastDay.weekday})`;
}

function countWorkingPeople(assignments: Record<string, Assignment[]>, day: CalendarDay, shiftCodes: ShiftCode[]) {
  return (assignments[day.key] ?? []).filter((assignment) => shiftCodes.includes(assignment.shift)).length;
}

function formatPeriod(days: CalendarDay[]) {
  return `${formatDayLabel(days[0])}-${formatDayLabel(days[days.length - 1])}`;
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

  const workingAssignments = periodDays.flatMap((day) =>
    (assignments[day.key] ?? []).filter((assignment) => ["shift_1", "shift_2", "full_day"].includes(assignment.shift)),
  );
  const pendingRequests = employees.filter((_, index) => (index + periodOffset) % 5 === 0).length;
  const nextSelfShift = periodDays
    .map((day) => ({ day, assignment: getEmployeeShiftForDate(assignments, selfEmployeeId, day.key) }))
    .find(({ assignment }) => assignment && ["shift_1", "shift_2", "full_day"].includes(assignment.shift));

  return (
    <div className="space-y-4 pb-4">
      <header className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700">{t("shifts.twoWeekSchedule")}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">{t("shifts.title")}</h1>
              <p className="mt-1 text-sm text-slate-600">{t("shifts.subtitle")}</p>
            </div>
            <Link
              href="#archive-placeholder"
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {t("shifts.archive")}
            </Link>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl bg-slate-50 p-2">
            <button
              type="button"
              onClick={() => setPeriodOffset((current) => current - 1)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 shadow-sm"
            >
              {t("shifts.previousTwoWeeks")}
            </button>
            <span className="text-center text-sm font-bold text-slate-900">{formatPeriod(periodDays)}</span>
            <button
              type="button"
              onClick={() => setPeriodOffset((current) => current + 1)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 shadow-sm"
            >
              {t("shifts.nextTwoWeeks")}
            </button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <SummaryItem label={t("shifts.summary.workingPeople")} value={`${workingAssignments.length}${t("shifts.peopleCountSuffix")}`} />
        <SummaryItem label={t("shifts.summary.pendingRequests")} value={`${pendingRequests}${t("shifts.itemsCountSuffix")}`} />
        <SummaryItem
          label={t("shifts.summary.myNextShift")}
          value={
            nextSelfShift?.assignment
              ? `${formatDayLabel(nextSelfShift.day)} ${getShiftCellMeta(nextSelfShift.assignment.shift).marker}`
              : t("shifts.noShift")
          }
        />
      </section>

      <section className="space-y-4">
        {weekGroups.map((week) => (
          <WeekTable key={week.label} week={week} assignments={assignments} t={t} />
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">{t("shifts.legend")}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          {(["shift_1", "shift_2", "full_day", "off", "vacation", "sick"] as ShiftCode[]).map((code) => {
            const meta = getShiftCellMeta(code);
            return (
              <div key={code} className="flex items-center gap-2">
                <span className={`inline-flex min-w-10 justify-center rounded-md border px-2 py-1 font-bold ${meta.className}`}>
                  {meta.marker}
                </span>
                <span className="text-slate-600">{meta.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        {[
          { href: "/requests", label: t("shifts.shiftRequest") },
          { href: "/suggestions", label: t("shifts.suggestions") },
          { href: "/recipes", label: t("shifts.recipes") },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border border-emerald-200 bg-white px-3 py-3 text-center text-sm font-semibold text-emerald-800 shadow-sm"
          >
            {action.label}
          </Link>
        ))}
      </section>

      <p id="archive-placeholder" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
        {t("shifts.archivePlaceholder")}
      </p>

      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
        {t("shifts.demoNote")}
      </p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[11px] font-semibold leading-4 text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-950">{value}</p>
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
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-950">
            {week.label} <span className="text-sm font-semibold text-slate-600">{formatWeekRange(week.days)}</span>
          </h2>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            {employees.length}
            {t("shifts.peopleCountSuffix")}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[116px_repeat(7,minmax(82px,1fr))_72px] border-b border-slate-200 bg-white text-center text-xs font-semibold text-slate-500">
            <div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-2 py-2 text-left">{t("shifts.employee")}</div>
            {week.days.map((day) => (
              <div key={day.key} className="border-r border-slate-100 px-1 py-2">
                <span className="block font-bold text-slate-900">{formatDayLabel(day)}</span>
                <span className="block text-[11px]">{day.weekday}</span>
              </div>
            ))}
            <div className="px-1 py-2">{t("shifts.weeklyTotal")}</div>
          </div>

          {employees.map((employee) => {
            const isSelf = employee.id === selfEmployeeId;
            const weeklyTotal = calculateWeeklyTotal(assignments, employee.id, week.days);
            return (
              <div
                key={employee.id}
                className={`grid grid-cols-[116px_repeat(7,minmax(82px,1fr))_72px] border-b border-slate-100 text-center text-xs last:border-b-0 ${
                  isSelf ? "bg-emerald-50/55" : "bg-white"
                }`}
              >
                <div
                  className={`sticky left-0 z-10 flex min-h-14 items-center border-r border-slate-200 px-2 text-left ${
                    isSelf ? "border-l-4 border-l-emerald-600 bg-emerald-50" : "bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[12px] font-bold text-slate-900">{employee.name}</span>
                      {isSelf ? (
                        <span className="rounded-full bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold text-white">{t("shifts.you")}</span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-slate-500">{employee.initials}</span>
                  </div>
                </div>

                {week.days.map((day) => {
                  const assignment = getEmployeeShiftForDate(assignments, employee.id, day.key);
                  if (!assignment) {
                    return <div key={day.key} className="flex min-h-14 items-center justify-center border-r border-slate-100 bg-white" />;
                  }
                  const meta = getShiftCellMeta(assignment.shift);
                  return (
                    <div key={day.key} className="flex min-h-14 items-center justify-center border-r border-slate-100 px-1 py-1.5">
                      <span className={`inline-flex w-full flex-col rounded-lg border px-1.5 py-1 font-bold leading-tight ${meta.className}`}>
                        <span>{meta.marker}</span>
                        {meta.time ? <span className="hidden pt-0.5 text-[9px] font-semibold sm:block">{meta.time}</span> : null}
                      </span>
                    </div>
                  );
                })}

                <div className="flex min-h-14 items-center justify-center px-1 font-bold text-slate-900">{formatHours(weeklyTotal)}</div>
              </div>
            );
          })}

          <div className="grid grid-cols-[116px_repeat(7,minmax(82px,1fr))_72px] bg-slate-50 text-center text-[11px] font-semibold text-slate-600">
            <div className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-2 py-2 text-left">{t("shifts.staffing")}</div>
            {week.days.map((day) => (
              <div key={day.key} className="space-y-1 border-r border-slate-100 px-1 py-2">
                <span className="block text-emerald-700">
                  AM {countWorkingPeople(assignments, day, ["shift_1", "full_day"])}
                  {t("shifts.peopleCountSuffix")}
                </span>
                <span className="block text-amber-700">
                  PM {countWorkingPeople(assignments, day, ["shift_2", "full_day"])}
                  {t("shifts.peopleCountSuffix")}
                </span>
              </div>
            ))}
            <div className="px-1 py-2 text-slate-400">-</div>
          </div>
        </div>
      </div>
    </article>
  );
}
