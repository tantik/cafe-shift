"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";
import { currentDemoEmployee } from "@/lib/demo-employees";
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

type AttendanceStatus = "notStarted" | "working" | "onBreak" | "finished";

type BreakSession = {
  start: string;
  end?: string;
};

type AttendanceRecord = {
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  clockInAt?: string;
  clockOutAt?: string;
  breakSessions: BreakSession[];
  activeBreakStartedAt?: string;
};

type AttendanceCorrectionRequest = {
  id: string;
  employeeName: string;
  date: string;
  requestedStartTime: string;
  requestedEndTime: string;
  requestedBreakMinutes: number;
  message: string;
  createdAt: string;
  status: "pending";
};

type CorrectionDraft = {
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
  message: string;
};

const selfEmployeeId = currentDemoEmployee.id;
const baseWeekStart = DEMO_START_DATE;
const defaultReportDate = addDays(baseWeekStart, 14);
const weekdays = ["月", "火", "水", "木", "金", "土", "日"];
const attendanceStorageKeyPrefix = "cafe-shift-attendance";
const correctionRequestsStorageKeyPrefix = "cafe-shift-attendance-correction-requests";
const transportationStorageKeyPrefix = "cafe-shift-transportation";
const breakMinuteOptions = ["0", "30", "45", "60", "90"];

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

function diffDays(fromDateKey: string, toDateKey: string) {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((parseDateKey(toDateKey).getTime() - parseDateKey(fromDateKey).getTime()) / dayMs);
}

function getWeekOffsetForDate(dateKey: string) {
  return Math.floor(diffDays(baseWeekStart, dateKey) / 7);
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
    return { marker: "祝日", label: "休み", time: "", hours: 0, isWorkday: false, className: "border-slate-200 bg-slate-100 text-slate-600" };
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

function getCurrentIso() {
  return new Date().toISOString();
}

function formatTime(dateString?: string) {
  if (!dateString) {
    return "-";
  }
  const date = new Date(dateString);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "-";
  }
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  if (hours === 0) {
    return `${restMinutes}分`;
  }
  return `${hours}時間${String(restMinutes).padStart(2, "0")}分`;
}

function calculateBreakMinutes(breakSessions: BreakSession[]) {
  return breakSessions.reduce((total, session) => {
    if (!session.end) {
      return total;
    }
    return total + Math.max(0, Math.round((new Date(session.end).getTime() - new Date(session.start).getTime()) / 60000));
  }, 0);
}

function calculateActualMinutes(clockInAt: string | undefined, clockOutAt: string | undefined, breakMinutes: number) {
  if (!clockInAt || !clockOutAt) {
    return 0;
  }
  return Math.max(0, Math.round((new Date(clockOutAt).getTime() - new Date(clockInAt).getTime()) / 60000) - breakMinutes);
}

function createEmptyAttendanceRecord(date: string): AttendanceRecord {
  return {
    employeeName: currentDemoEmployee.name,
    date,
    status: "notStarted",
    breakSessions: [],
  };
}

function getAttendanceStorageKey(employeeName: string, date: string) {
  return `${attendanceStorageKeyPrefix}:${employeeName}:${date}`;
}

function getCorrectionRequestsStorageKey(employeeName: string) {
  return `${correctionRequestsStorageKeyPrefix}:${employeeName}`;
}

function getTransportationStorageKey(employeeName: string) {
  return `${transportationStorageKeyPrefix}:${employeeName}`;
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
  const [reportDate, setReportDate] = useState(defaultReportDate);
  const [reportTransportation, setReportTransportation] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [correctionDraft, setCorrectionDraft] = useState<CorrectionDraft>({
    date: "",
    startTime: "",
    endTime: "",
    breakMinutes: "0",
    message: "",
  });
  const [correctionSuccess, setCorrectionSuccess] = useState("");
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const weekStart = addDays(baseWeekStart, weekOffset * 7);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const assignments = useMemo(() => createAssignments(weekDays), [weekDays]);
  const todayWeekStart = todayKey ? addDays(baseWeekStart, getWeekOffsetForDate(todayKey) * 7) : weekStart;
  const todayAssignments = useMemo(() => createAssignments(getWeekDays(todayWeekStart)), [todayWeekStart]);
  const todayShiftCode = todayKey ? getEmployeeShiftForDate(todayAssignments, selfEmployeeId, todayKey) : "no_shift";
  const todayShiftMeta = getShiftCellMeta(todayShiftCode);
  const attendanceBreakMinutes = attendanceRecord ? calculateBreakMinutes(attendanceRecord.breakSessions) : 0;
  const attendanceActualMinutes = attendanceRecord
    ? calculateActualMinutes(attendanceRecord.clockInAt, attendanceRecord.clockOutAt, attendanceBreakMinutes)
    : 0;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const clientDateKey = getClientDateKey();
      setTodayKey(clientDateKey);
      setReportDate(clientDateKey);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!todayKey) {
      return;
    }
    const timer = window.setTimeout(() => {
      const storageKey = getAttendanceStorageKey(currentDemoEmployee.name, todayKey);
      const storedRecord = window.localStorage.getItem(storageKey);
      if (!storedRecord) {
        setAttendanceRecord(createEmptyAttendanceRecord(todayKey));
        return;
      }
      try {
        setAttendanceRecord(JSON.parse(storedRecord) as AttendanceRecord);
      } catch {
        setAttendanceRecord(createEmptyAttendanceRecord(todayKey));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [todayKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedTransportation = window.localStorage.getItem(getTransportationStorageKey(currentDemoEmployee.name));
      if (storedTransportation !== null) {
        setReportTransportation(storedTransportation);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateReportTransportation(value: string) {
    setReportTransportation(value);
    window.localStorage.setItem(getTransportationStorageKey(currentDemoEmployee.name), value);
  }

  function saveAttendanceRecord(nextRecord: AttendanceRecord) {
    setAttendanceRecord(nextRecord);
    window.localStorage.setItem(getAttendanceStorageKey(nextRecord.employeeName, nextRecord.date), JSON.stringify(nextRecord));
  }

  function clockIn() {
    if (!todayKey) {
      return;
    }
    saveAttendanceRecord({
      ...(attendanceRecord ?? createEmptyAttendanceRecord(todayKey)),
      employeeName: currentDemoEmployee.name,
      date: todayKey,
      status: "working",
      clockInAt: getCurrentIso(),
    });
  }

  function startBreak() {
    if (!attendanceRecord) {
      return;
    }
    const now = getCurrentIso();
    saveAttendanceRecord({
      ...attendanceRecord,
      status: "onBreak",
      activeBreakStartedAt: now,
      breakSessions: [...attendanceRecord.breakSessions, { start: now }],
    });
  }

  function endBreak() {
    if (!attendanceRecord) {
      return;
    }
    const now = getCurrentIso();
    const breakSessions = attendanceRecord.breakSessions.map((session, index, sessions) =>
      index === sessions.length - 1 && !session.end ? { ...session, end: now } : session,
    );
    saveAttendanceRecord({
      ...attendanceRecord,
      status: "working",
      activeBreakStartedAt: undefined,
      breakSessions,
    });
  }

  function clockOut() {
    if (!attendanceRecord || !todayKey) {
      return;
    }
    const nextRecord = {
      ...attendanceRecord,
      status: "finished" as const,
      clockOutAt: getCurrentIso(),
    };
    saveAttendanceRecord(nextRecord);
    setReportDate(todayKey);
  }

  function openCorrectionModal() {
    setCorrectionSuccess("");
    setCorrectionDraft({
      date: todayKey ?? getClientDateKey(),
      startTime: attendanceRecord?.clockInAt ? formatTime(attendanceRecord.clockInAt) : "",
      endTime: attendanceRecord?.clockOutAt ? formatTime(attendanceRecord.clockOutAt) : "",
      breakMinutes: String(attendanceBreakMinutes),
      message: "",
    });
    setIsCorrectionOpen(true);
  }

  function submitCorrectionRequest() {
    const request: AttendanceCorrectionRequest = {
      id: `${Date.now()}`,
      employeeName: currentDemoEmployee.name,
      date: correctionDraft.date,
      requestedStartTime: correctionDraft.startTime,
      requestedEndTime: correctionDraft.endTime,
      requestedBreakMinutes: Number(correctionDraft.breakMinutes || 0),
      message: correctionDraft.message,
      createdAt: getCurrentIso(),
      status: "pending",
    };
    const storageKey = getCorrectionRequestsStorageKey(currentDemoEmployee.name);
    const storedRequests = window.localStorage.getItem(storageKey);
    let requests: AttendanceCorrectionRequest[] = [];
    if (storedRequests) {
      try {
        requests = JSON.parse(storedRequests) as AttendanceCorrectionRequest[];
      } catch {
        requests = [];
      }
    }
    window.localStorage.setItem(storageKey, JSON.stringify([request, ...requests]));
    setCorrectionSuccess("修正依頼を送信しました");
    window.setTimeout(() => {
      setIsCorrectionOpen(false);
    }, 700);
  }

  function submitReport() {
    setReportError("");
    setReportSuccess("");

    if (!reportDate || reportTransportation.trim() === "") {
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

  function goToToday() {
    if (todayKey) {
      setWeekOffset(getWeekOffsetForDate(todayKey));
    }
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
        <div className="flex flex-wrap items-end justify-between gap-1.5">
          <p className="text-sm font-bold tracking-[0.14em] text-emerald-800">{t("shifts.weeklyShift")}</p>
          <p className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600 shadow-sm">
            {t("shifts.currentStaff")}: <span className="text-slate-950">{currentDemoEmployee.name}</span>
          </p>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_1fr] items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWeekOffset((current) => current - 1)}
            className="min-w-0 rounded-lg border border-slate-200 bg-white px-1.5 py-2 text-[10px] font-semibold text-slate-700 shadow-sm min-[380px]:px-2 min-[380px]:text-[11px]"
          >
            {t("shifts.previousWeek")}
          </button>
          <span className="min-w-[72px] text-center text-xs font-bold text-slate-950 min-[380px]:min-w-[86px] min-[380px]:text-sm">{formatPeriod(weekDays)}</span>
          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-[10px] font-bold text-emerald-800 shadow-sm min-[380px]:text-[11px]"
          >
            {t("shifts.today")}
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((current) => current + 1)}
            className="min-w-0 rounded-lg border border-slate-200 bg-white px-1.5 py-2 text-[10px] font-semibold text-slate-700 shadow-sm min-[380px]:px-2 min-[380px]:text-[11px]"
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

      <section className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
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
        href="/requests"
        className="block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-center text-sm font-bold text-emerald-900 shadow-sm"
      >
        {t("shifts.nextMonthShiftRequestButton")}
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-950">本日の勤務</h2>
            <p className="mt-0.5 text-xs font-bold text-slate-500">スタッフ: {currentDemoEmployee.name}</p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800">
            {attendanceRecord?.status === "working"
              ? "勤務中"
              : attendanceRecord?.status === "onBreak"
                ? "休憩中"
                : attendanceRecord?.status === "finished"
                  ? "退勤済み"
                  : "未出勤"}
          </span>
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          予定:{" "}
          {todayKey ? (
            <span className="text-slate-950">
              {todayShiftMeta.marker}
              {todayShiftMeta.time ? ` / ${todayShiftMeta.time}` : ""}
            </span>
          ) : (
            <span className="text-slate-500">今日のシフトを確認してください</span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={clockIn}
            disabled={attendanceRecord?.status !== "notStarted"}
            className="h-11 rounded-lg bg-emerald-800 text-sm font-bold text-white shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            出勤
          </button>
          <button
            type="button"
            onClick={startBreak}
            disabled={attendanceRecord?.status !== "working"}
            className="h-11 rounded-lg border border-amber-200 bg-amber-50 text-sm font-bold text-amber-900 shadow-sm disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            休憩開始
          </button>
          <button
            type="button"
            onClick={endBreak}
            disabled={attendanceRecord?.status !== "onBreak"}
            className="h-11 rounded-lg border border-sky-200 bg-sky-50 text-sm font-bold text-sky-900 shadow-sm disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            休憩終了
          </button>
          <button
            type="button"
            onClick={clockOut}
            disabled={attendanceRecord?.status !== "working"}
            className="h-11 rounded-lg bg-slate-900 text-sm font-bold text-white shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            退勤
          </button>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 px-2 py-2">
            <dt className="text-xs font-bold text-slate-500">出勤</dt>
            <dd className="mt-0.5 font-bold text-slate-950">{formatTime(attendanceRecord?.clockInAt)}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-2 py-2">
            <dt className="text-xs font-bold text-slate-500">休憩</dt>
            <dd className="mt-0.5 font-bold text-slate-950">{attendanceBreakMinutes > 0 ? `${attendanceBreakMinutes}分` : "-"}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-2 py-2">
            <dt className="text-xs font-bold text-slate-500">退勤</dt>
            <dd className="mt-0.5 font-bold text-slate-950">{formatTime(attendanceRecord?.clockOutAt)}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-2 py-2">
            <dt className="text-xs font-bold text-slate-500">実働</dt>
            <dd className="mt-0.5 font-bold text-slate-950">{attendanceActualMinutes > 0 ? formatDuration(attendanceActualMinutes) : "-"}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={openCorrectionModal}
          className="mt-3 h-10 w-full rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm"
        >
          勤務時間の修正依頼
        </button>
        {correctionSuccess ? <p className="mt-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-bold text-emerald-700">{correctionSuccess}</p> : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-950">{t("shifts.dailyReportTitle")}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{t("shifts.dailyReportSubtitle")}</p>
        </div>

        <div className="mt-3 space-y-2">
          <div className="space-y-2">
            <label className="block min-w-0 text-xs font-semibold text-slate-700">
              {t("shifts.reportName")}
              <input
                value={currentDemoEmployee.name}
                readOnly
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm font-semibold text-slate-700"
              />
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

          <div className="space-y-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <p className="text-xs font-bold text-slate-700">勤務記録</p>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-[11px] font-bold text-slate-500">出勤</dt>
                  <dd className="font-bold text-slate-950">{formatTime(attendanceRecord?.clockInAt)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold text-slate-500">休憩</dt>
                  <dd className="font-bold text-slate-950">{attendanceBreakMinutes > 0 ? `${attendanceBreakMinutes}分` : "-"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold text-slate-500">退勤</dt>
                  <dd className="font-bold text-slate-950">{formatTime(attendanceRecord?.clockOutAt)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold text-slate-500">実働</dt>
                  <dd className="font-bold text-slate-950">{attendanceActualMinutes > 0 ? formatDuration(attendanceActualMinutes) : "-"}</dd>
                </div>
              </dl>
              {attendanceRecord?.status !== "finished" ? (
                <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] font-semibold text-amber-800">
                  退勤後に勤務記録が自動で反映されます
                </p>
              ) : null}
            </div>

            <label className="block min-w-0 text-xs font-semibold text-slate-700">
              {t("shifts.reportTransportation")}
              <div className="mt-1 flex h-9 items-center rounded-lg border border-slate-200 bg-white px-2">
                <input
                  type="number"
                  min="0"
                  value={reportTransportation}
                  onChange={(event) => updateReportTransportation(event.target.value)}
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

      {isCorrectionOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center" onClick={() => setIsCorrectionOpen(false)}>
          <section
            className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-950">勤務時間の修正依頼</h2>
            <div className="mt-4 grid gap-3">
              <label className="block text-xs font-bold text-slate-700">
                勤務日
                <input
                  type="date"
                  value={correctionDraft.date}
                  onChange={(event) => setCorrectionDraft((current) => ({ ...current, date: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-900"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block min-w-0 text-xs font-bold text-slate-700">
                  実際の出勤時間
                  <input
                    type="time"
                    value={correctionDraft.startTime}
                    onChange={(event) => setCorrectionDraft((current) => ({ ...current, startTime: event.target.value }))}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-900"
                  />
                </label>
                <label className="block min-w-0 text-xs font-bold text-slate-700">
                  実際の退勤時間
                  <input
                    type="time"
                    value={correctionDraft.endTime}
                    onChange={(event) => setCorrectionDraft((current) => ({ ...current, endTime: event.target.value }))}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm text-slate-900"
                  />
                </label>
              </div>
              <label className="block text-xs font-bold text-slate-700">
                休憩時間
                <select
                  value={correctionDraft.breakMinutes}
                  onChange={(event) => setCorrectionDraft((current) => ({ ...current, breakMinutes: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900"
                >
                  {breakMinuteOptions.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes}分
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-700">
                理由・メッセージ
                <textarea
                  value={correctionDraft.message}
                  onChange={(event) => setCorrectionDraft((current) => ({ ...current, message: event.target.value }))}
                  placeholder="例：退勤ボタンを押し忘れました。実際は17:30まで勤務しました。"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
            {correctionSuccess ? <p className="mt-3 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-bold text-emerald-700">{correctionSuccess}</p> : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsCorrectionOpen(false)}
                className="h-10 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={submitCorrectionRequest}
                className="h-10 rounded-lg bg-emerald-800 text-sm font-bold text-white"
              >
                送信する
              </button>
            </div>
          </section>
        </div>
      ) : null}
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
