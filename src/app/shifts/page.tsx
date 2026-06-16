"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type BreakMinutes = "0" | "30" | "60";

const selfEmployeeId = "ly";
const baseWeekStart = DEMO_START_DATE;
const defaultReportDate = addDays(baseWeekStart, 14);
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
    shift_1: "border-sky-200 bg-sky-50 text-sky-800",
    shift_2: "border-orange-200 bg-orange-50 text-orange-800",
    shift_3: "border-yellow-200 bg-yellow-50 text-yellow-800",
    full_day: "border-emerald-200 bg-emerald-50 text-emerald-800",
    vacation: "border-pink-100 bg-pink-50/70 text-pink-700",
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
  const [reportName, setReportName] = useState(selfEmployeeId);
  const [reportDate, setReportDate] = useState(defaultReportDate);
  const [reportStartTime, setReportStartTime] = useState("08:30");
  const [reportEndTime, setReportEndTime] = useState("13:00");
  const [reportBreakMinutes, setReportBreakMinutes] = useState<BreakMinutes>("30");
  const [reportTransportation, setReportTransportation] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const weekStart = addDays(baseWeekStart, weekOffset * 7);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const assignments = useMemo(() => createAssignments(weekDays), [weekDays]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const clientDateKey = getClientDateKey();
      setTodayKey(clientDateKey);
      setReportDate(clientDateKey);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function submitReport() {
    setReportError("");
    setReportSuccess("");

    if (
      !reportName ||
      !reportDate ||
      !reportStartTime ||
      !reportEndTime ||
      !reportBreakMinutes ||
      reportTransportation.trim() === ""
    ) {
      setReportError(t("shifts.dailyReportRequiredError"));
      return;
    }

    const transportationCost = Number(reportTransportation);
    if (Number.isNaN(transportationCost) || transportationCost < 0) {
      setReportError(t("shifts.dailyReportRequiredError"));
      return;
    }

    setReportSuccess(t("shifts.dailyReportSuccessDemo"));
    setReportMessage("");
  }

  function handleSwipeStart(clientX: number, clientY: number) {
    swipeStartRef.current = { x: clientX, y: clientY };
  }

  function handleSwipeEnd(clientX: number, clientY: number) {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) {
      return;
    }

    const deltaX = clientX - start.x;
    const deltaY = clientY - start.y;
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) {
      return;
    }

    setWeekOffset((current) => current + (deltaX < 0 ? 1 : -1));
  }

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

      <div
        onPointerDown={(event) => handleSwipeStart(event.clientX, event.clientY)}
        onPointerUp={(event) => handleSwipeEnd(event.clientX, event.clientY)}
        onPointerCancel={() => {
          swipeStartRef.current = null;
        }}
        className="touch-pan-y"
      >
        <WeekTable weekNumber={weekOffset + 1} weekDays={weekDays} assignments={assignments} todayKey={todayKey} t={t} />
      </div>

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

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-950">{t("shifts.dailyReportTitle")}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{t("shifts.dailyReportSubtitle")}</p>
        </div>

        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block min-w-0 text-xs font-semibold text-slate-700">
              {t("shifts.reportName")}
              <select
                value={reportName}
                onChange={(event) => setReportName(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900"
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block min-w-0 text-xs font-semibold text-slate-700">
              {t("shifts.reportDate")}
              <input
                type="date"
                value={reportDate}
                onChange={(event) => setReportDate(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-900"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block min-w-0 text-xs font-semibold text-slate-700">
              {t("shifts.reportStartTime")}
              <span className="ml-1 text-[10px] font-medium text-slate-400">{t("shifts.reportOneMinuteOk")}</span>
              <input
                type="time"
                step="60"
                value={reportStartTime}
                onChange={(event) => setReportStartTime(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-900"
              />
            </label>

            <label className="block min-w-0 text-xs font-semibold text-slate-700">
              {t("shifts.reportEndTime")}
              <span className="ml-1 text-[10px] font-medium text-slate-400">{t("shifts.reportOneMinuteOk")}</span>
              <input
                type="time"
                step="60"
                value={reportEndTime}
                onChange={(event) => setReportEndTime(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-900"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700">{t("shifts.reportBreakTime")}</p>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {(["0", "30", "60"] as BreakMinutes[]).map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setReportBreakMinutes(minutes)}
                    className={`h-9 rounded-lg border text-xs font-bold ${
                      reportBreakMinutes === minutes
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {minutes}
                    {t("shifts.reportMinutes")}
                  </button>
                ))}
              </div>
            </div>

            <label className="block min-w-0 text-xs font-semibold text-slate-700">
              {t("shifts.reportTransportation")}
              <div className="mt-1 flex h-9 items-center rounded-lg border border-slate-200 bg-white px-2">
                <input
                  type="number"
                  min="0"
                  value={reportTransportation}
                  onChange={(event) => setReportTransportation(event.target.value)}
                  placeholder={t("shifts.reportTransportationPlaceholder")}
                  className="min-w-0 flex-1 text-sm text-slate-900 outline-none"
                />
                <span className="text-xs font-semibold text-slate-500">円</span>
              </div>
            </label>
          </div>

          <label className="block text-xs font-semibold text-slate-700">
            {t("shifts.reportMessage")}
            <textarea
              value={reportMessage}
              onChange={(event) => setReportMessage(event.target.value)}
              placeholder={t("shifts.reportMessagePlaceholder")}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900"
            />
          </label>

          {reportError ? <p className="rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-semibold text-rose-700">{reportError}</p> : null}
          {reportSuccess ? (
            <p className="rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700">{reportSuccess}</p>
          ) : null}

          <button
            type="button"
            onClick={submitReport}
            className="h-10 w-full rounded-lg bg-emerald-800 text-sm font-bold text-white shadow-sm"
          >
            {t("shifts.reportSubmit")}
          </button>
        </div>
      </section>

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
