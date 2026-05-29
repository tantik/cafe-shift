"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";
import { DEMO_START_DATE, employees as coreEmployees, shiftTypes as coreShiftTypes } from "@/lib/mock-data/core";
import type { ShiftCode } from "@/types/domain";

type ViewMode = "self" | "all";
type BreakMinutes = 0 | 30 | 60;

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

type WorkReport = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: BreakMinutes;
  transportCost: number;
  memo: string;
  hasOvertime: boolean;
  overtimeReason: string;
};

const selfEmployeeId = "yamada";
const mockToday = DEMO_START_DATE;
const initialSelectedDate = DEMO_START_DATE;

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
];

const shiftTypes = coreShiftTypes.map((shift) => ({
  code: shift.code,
  label: shift.label,
  marker: shift.shortLabel,
  time: shift.startTime && shift.endTime ? `${shift.startTime}–${shift.endTime}` : "",
})) satisfies { code: ShiftCode; label: string; marker: string; time: string }[];

const breakOptions: { labelKey: string; value: BreakMinutes }[] = [
  { labelKey: "shifts.report.breakNone", value: 0 },
  { labelKey: "shifts.report.break30", value: 30 },
  { labelKey: "shifts.report.break60", value: 60 },
];

const initialReports: WorkReport[] = [
  {
    id: "work-report-001",
    date: DEMO_START_DATE,
    startTime: "08:30",
    endTime: "13:00",
    breakMinutes: 30,
    transportCost: 420,
    memo: "開店準備を対応しました",
    hasOvertime: false,
    overtimeReason: "",
  },
];

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

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return hour * 60 + minute;
}

function formatHours(minutes: number | null, notEnteredLabel: string) {
  if (minutes === null || minutes < 0) {
    return notEnteredLabel;
  }
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

function formatBreak(minutes: BreakMinutes, t: (key: string) => string) {
  if (minutes === 0) {
    return t("shifts.report.breakNone");
  }
  if (minutes === 30) {
    return t("shifts.report.break30");
  }
  return t("shifts.report.break60");
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
  return (
    <AppShell>
      <ShiftsContent />
    </AppShell>
  );
}

function ShiftsContent() {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>("self");
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("13:00");
  const [breakMinutes, setBreakMinutes] = useState<BreakMinutes>(30);
  const [transportCost, setTransportCost] = useState("420");
  const [memo, setMemo] = useState("");
  const [hasOvertime, setHasOvertime] = useState(false);
  const [overtimeReason, setOvertimeReason] = useState("");
  const [reports, setReports] = useState(initialReports);
  const [nextReportNumber, setNextReportNumber] = useState(2);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  const selectedDay = days.find((day) => day.key === selectedDate) ?? days[0];
  const selectedAssignments = assignments[selectedDay.key] ?? [];
  const selectedSelfAssignment = selectedAssignments.find((assignment) => assignment.employeeId === selfEmployeeId);
  const selectedSelfShift = selectedSelfAssignment ? getShiftType(selectedSelfAssignment.shift) : null;
  const workPreview = useMemo(() => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const totalMinutes = start !== null && end !== null && end > start ? end - start : null;
    const actualMinutes = totalMinutes !== null ? totalMinutes - breakMinutes : null;
    return { totalMinutes, actualMinutes };
  }, [breakMinutes, endTime, startTime]);

  function formatReportDate(date: string) {
    const day = days.find((item) => item.key === date);
    return day ? formatDate(day) : date;
  }

  function saveWorkReport() {
    setReportError("");
    setReportSuccess("");

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const cost = transportCost.trim() === "" ? 0 : Number(transportCost);

    if (!startTime || !endTime) {
      setReportError(!startTime ? t("shifts.report.validationStartRequired") : t("shifts.report.validationEndRequired"));
      return;
    }
    if (start === null || end === null || end <= start) {
      setReportError(t("shifts.report.validationEndAfterStart"));
      return;
    }
    if (Number.isNaN(cost) || cost < 0) {
      setReportError(t("shifts.report.validationTransportNonNegative"));
      return;
    }
    if (hasOvertime && !overtimeReason.trim()) {
      setReportError(t("shifts.report.validationReasonRequired"));
      return;
    }

    const nextReport: WorkReport = {
      id: `work-report-${String(nextReportNumber).padStart(3, "0")}`,
      date: selectedDay.key,
      startTime,
      endTime,
      breakMinutes,
      transportCost: cost,
      memo,
      hasOvertime,
      overtimeReason: hasOvertime ? overtimeReason.trim() : "",
    };

    setReports((current) => [nextReport, ...current]);
    setNextReportNumber((current) => current + 1);
    setReportSuccess(t("shifts.report.success"));
    setMemo("");
    setOvertimeReason("");
  }

  return (
    <div className="space-y-4 pb-4">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700">{t("shifts.twoWeekSchedule")}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("shifts.title")}</h1>
              <p className="mt-1 text-sm text-slate-600">{t("shifts.subtitle")}</p>
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
              { id: "self" as const, label: t("shifts.selfView") },
              { id: "all" as const, label: t("shifts.allView") },
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
              <h2 className="font-semibold text-slate-900">{t("shifts.twoWeekSchedule")}</h2>
              <p className="text-xs text-slate-500">{t("shifts.slideHint")}</p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{t("shifts.daysCount")}</span>
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
                        {isToday ? <span className="text-[9px] font-semibold text-emerald-700">{t("shifts.today")}</span> : null}
                      </div>
                      <span className="block text-sm font-bold text-slate-900">{day.day}</span>

                      {viewMode === "self" ? (
                        <span
                          className={`mt-3 block truncate text-xs font-semibold ${
                            selfShift?.code === "sick" ? "text-rose-700" : "text-emerald-800"
                          }`}
                        >
                          {selfShift?.marker ?? t("shifts.noShift")}
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
          <p className="mt-1 text-center text-xs text-slate-500">← {t("shifts.slideHint")} →</p>
        </section>

        {viewMode === "self" ? (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-900">{t("shifts.myShift")}</h2>
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
                      ? t("shifts.status.off")
                      : selectedSelfShift.code === "vacation"
                        ? t("shifts.status.vacation")
                        : selectedSelfShift.code === "sick"
                          ? t("shifts.status.sick")
                          : t("shifts.status.working")}
                  </p>
                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{t("shifts.noShift")}</p>
              )}
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <h2 className="font-semibold text-slate-900">{t("shifts.report.title")}</h2>
                <p className="mt-1 text-sm text-slate-500">{t("shifts.report.subtitle")}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold text-slate-800">
                  {t("shifts.report.startTime")}
                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-800">
                  {t("shifts.report.endTime")}
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">{t("shifts.report.break")}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {breakOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBreakMinutes(option.value)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        breakMinutes === option.value
                          ? "border-emerald-700 bg-emerald-800 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {t(option.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-semibold text-slate-800">
                {t("shifts.report.transportCost")}
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={transportCost}
                    onChange={(event) => setTransportCost(event.target.value)}
                    placeholder="例）420"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                  <span className="text-sm font-semibold text-slate-600">円</span>
                </div>
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                {t("shifts.report.memo")}
                <textarea
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  placeholder={t("shifts.report.memoPlaceholder")}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>

              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                <div>
                  <p className="text-xs text-slate-500">{t("shifts.report.workTime")}</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatHours(workPreview.totalMinutes, t("shifts.report.notEntered"))}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t("shifts.report.break")}</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatBreak(breakMinutes, t)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t("shifts.report.actualWorkTime")}</p>
                  <p className="mt-1 font-semibold text-emerald-800">{formatHours(workPreview.actualMinutes, t("shifts.report.notEntered"))}</p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{t("shifts.report.longerThanPlanned")}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { label: t("shifts.report.yes"), value: true },
                    { label: t("shifts.report.no"), value: false },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setHasOvertime(option.value)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        hasOvertime === option.value
                          ? "border-amber-600 bg-amber-100 text-amber-900"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {hasOvertime ? (
                  <label className="mt-3 block text-sm font-semibold text-slate-800">
                    {t("shifts.report.reason")}
                    <textarea
                      value={overtimeReason}
                      onChange={(event) => setOvertimeReason(event.target.value)}
                      placeholder={t("shifts.report.reasonPlaceholder")}
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    />
                  </label>
                ) : null}
              </div>

              {reportError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{reportError}</p> : null}
              {reportSuccess ? (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{reportSuccess}</p>
              ) : null}

              <button
                type="button"
                onClick={saveWorkReport}
                className="w-full rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm"
              >
                {t("shifts.report.save")}
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-900">{t("shifts.report.recentTitle")}</h2>
              <div className="mt-3 space-y-2">
                {reports.map((report) => {
                  const start = timeToMinutes(report.startTime);
                  const end = timeToMinutes(report.endTime);
                  const actualMinutes = start !== null && end !== null ? end - start - report.breakMinutes : null;
                  return (
                    <article key={report.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{formatReportDate(report.date)}</p>
                          <p className="text-xs text-slate-600">
                            {report.startTime}–{report.endTime} / {t("shifts.report.break")} {formatBreak(report.breakMinutes, t)}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                          {t("shifts.report.actualWorkTime")} {formatHours(actualMinutes, t("shifts.report.notEntered"))}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span>
                          {t("shifts.report.transportCost")} {report.transportCost.toLocaleString("ja-JP")}円
                        </span>
                        <span>
                          {t("shifts.report.longerThanPlannedShort")}:{" "}
                          {report.hasOvertime ? t("shifts.report.yes") : t("shifts.report.no")}
                        </span>
                      </div>
                      {report.overtimeReason ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {t("shifts.report.reason")}: {report.overtimeReason}
                        </p>
                      ) : null}
                      {report.memo ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {t("shifts.report.memo")}: {report.memo}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">{t("shifts.everyoneShift")}</h2>
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
                      <span className="text-xs text-slate-500">
                        {members.length}
                        {t("shifts.peopleCountSuffix")}
                      </span>
                    </div>
                    {members.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-400">{t("shifts.noMembers")}</p>
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

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          {t("shifts.demoNote")}
        </p>
      </div>
  );
}
