"use client";

import { useEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import AppShell from "@/components/app-shell";
import { demoEmployees } from "@/lib/demo-employees";
import { useI18n } from "@/lib/i18n/use-i18n";

type ShiftCode = "shift_1" | "shift_2" | "shift_3" | "full_day" | "store_closed" | "vacation" | "none";

type Day = {
  key: string;
  date: string;
  month: number;
  weekday: string;
};

type WorkReport = {
  employeeId: string;
  workDate: string;
  startedAt: string;
  endedAt: string;
  breakMinutes: number;
  transportationCost: number;
  message?: string;
};

type SelectedCell = {
  employeeId: string;
  dayKey: string;
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
  status: "pending" | "approved";
};

const todayKey = "2026-06-19";
const monthlyReportMonth = "2026-06";
const correctionRequestsStorageKeyPrefix = "cafe-shift-attendance-correction-requests";

const employees = demoEmployees;

const weekdays = ["月", "火", "水", "木", "金", "土", "日"];
const weekStarts = [1, 8, 15, 22, 29];

const weeks = weekStarts.map((startDay, weekIndex) => {
  const days: Day[] = Array.from({ length: 7 }, (_, index) => {
    const day = startDay + index;
    const month = day > 30 ? 7 : 6;
    const date = day > 30 ? day - 30 : day;
    return {
      key: `2026-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`,
      date: `${month}/${date}`,
      month,
      weekday: weekdays[index],
    };
  });

  return {
    key: `week-${weekIndex + 1}`,
    range: `${days[0].date}(${days[0].weekday})〜${days[6].date}(${days[6].weekday})`,
    days,
  };
});

const shiftMeta: Record<ShiftCode, { label: string; time: string; hours: number; className: string }> = {
  shift_1: { label: "1", time: "08:30〜13:00", hours: 4.5, className: "border-sky-200 bg-sky-50 text-sky-800" },
  shift_2: { label: "2", time: "13:00〜17:30", hours: 4.5, className: "border-orange-200 bg-orange-50 text-orange-800" },
  shift_3: { label: "3", time: "08:30〜10:00", hours: 1.5, className: "border-yellow-200 bg-yellow-50 text-yellow-800" },
  full_day: { label: "通", time: "08:30〜17:30", hours: 9, className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  store_closed: { label: "祝日", time: "", hours: 0, className: "border-slate-200 bg-slate-100 text-slate-600" },
  vacation: { label: "休暇", time: "", hours: 0, className: "border-violet-200 bg-violet-50 text-violet-700" },
  none: { label: "-", time: "", hours: 0, className: "border-slate-100 bg-white text-slate-400" },
};

const editableShiftCodes: ShiftCode[] = ["shift_1", "shift_2", "shift_3", "full_day", "store_closed", "vacation", "none"];

const reports: WorkReport[] = [
  {
    employeeId: "manabu",
    workDate: "2026-06-16",
    startedAt: "08:15",
    endedAt: "18:39",
    breakMinutes: 30,
    transportationCost: 500,
    message: "片付けに時間がかかった。",
  },
  {
    employeeId: "ly",
    workDate: "2026-06-16",
    startedAt: "13:00",
    endedAt: "17:34",
    breakMinutes: 0,
    transportationCost: 420,
    message: "通常通り。",
  },
  {
    employeeId: "yuko",
    workDate: "2026-06-17",
    startedAt: "08:31",
    endedAt: "13:02",
    breakMinutes: 0,
    transportationCost: 500,
  },
  {
    employeeId: "grace",
    workDate: "2026-06-18",
    startedAt: "08:25",
    endedAt: "17:42",
    breakMinutes: 60,
    transportationCost: 620,
    message: "ランチ後の補充を対応。",
  },
  {
    employeeId: "bao",
    workDate: "2026-06-18",
    startedAt: "08:30",
    endedAt: "10:05",
    breakMinutes: 0,
    transportationCost: 300,
  },
];

function buildInitialSchedule() {
  const pattern: ShiftCode[] = ["shift_1", "shift_2", "full_day", "none", "vacation", "store_closed", "shift_1", "full_day", "shift_2", "none"];
  return Object.fromEntries(
    employees.map((employee, employeeIndex) => [
      employee.id,
      Object.fromEntries(
        weeks.flatMap((week, weekIndex) =>
          week.days.map((day, dayIndex) => {
            if (employee.id === "cons") {
              return [day.key, dayIndex < 5 ? "shift_3" : "none"];
            }
            const shift = pattern[(employeeIndex * 3 + weekIndex * 4 + dayIndex * 2) % pattern.length];
            return [day.key, shift];
          }),
        ),
      ),
    ]),
  ) as Record<string, Record<string, ShiftCode>>;
}

function reportKey(employeeId: string, dayKey: string) {
  return `${employeeId}:${dayKey}`;
}

function getCorrectionRequestsStorageKey(employeeName: string) {
  return `${correctionRequestsStorageKeyPrefix}:${employeeName}`;
}

function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function reportHours(report: WorkReport) {
  return Math.max(0, (minutesFromTime(report.endedAt) - minutesFromTime(report.startedAt) - report.breakMinutes) / 60);
}

function formatHours(hours: number) {
  if (hours === 0) {
    return "-";
  }
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

function csvValue(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

// Demo auto-generation. Production should consider staffing rules, max hours, vacations, fairness, and required headcount.
function buildDraftFromRequests(current: Record<string, Record<string, ShiftCode>>, excludedEmployeeIds: string[] = []) {
  const next = structuredClone(current);
  const draftPattern: ShiftCode[] = ["shift_1", "shift_2", "none", "full_day", "vacation", "store_closed", "shift_1", "full_day", "shift_2"];
  for (const [employeeIndex, employee] of employees.entries()) {
    if (excludedEmployeeIds.includes(employee.id)) {
      continue;
    }
    for (const [weekIndex, week] of weeks.entries()) {
      for (const [dayIndex, day] of week.days.entries()) {
        next[employee.id][day.key] =
          employee.id === "cons"
            ? dayIndex < 5
              ? "shift_3"
              : "none"
            : draftPattern[(employeeIndex * 2 + weekIndex * 3 + dayIndex) % draftPattern.length];
      }
    }
  }
  return next;
}

const missingRequestEmployeeIds = ["cons", "maria"];

const demoCorrectionRequests: AttendanceCorrectionRequest[] = [
  {
    id: "demo-correction-cons-2026-06-18",
    employeeName: "Cons",
    date: "2026-06-18",
    requestedStartTime: "08:30",
    requestedEndTime: "10:05",
    requestedBreakMinutes: 0,
    message: "退勤打刻を忘れたため、勤務時間の確認をお願いします。",
    createdAt: "2026-06-18T10:20:00+09:00",
    status: "pending",
  },
];

export default function ManagerPage() {
  return (
    <AppShell variant="wide" showMobileNav={false}>
      <ManagerContent />
    </AppShell>
  );
}

function ManagerContent() {
  const { t } = useI18n();
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(2);
  const [schedule, setSchedule] = useState(buildInitialSchedule);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [draftShift, setDraftShift] = useState<ShiftCode>("none");
  const [success, setSuccess] = useState("");
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [approvedCorrectionReports, setApprovedCorrectionReports] = useState<Record<string, WorkReport>>({});
  const [isDraftGenerated, setIsDraftGenerated] = useState(false);
  const [isMissingRequestsOpen, setIsMissingRequestsOpen] = useState(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const wheelLockRef = useRef(false);
  const selectedWeek = weeks[selectedWeekIndex];
  const currentWeekIndex = weeks.findIndex((week) => week.days.some((day) => day.key === todayKey));
  const reportByCell = useMemo(() => {
    const entries = reports.map((report) => [reportKey(report.employeeId, report.workDate), report] as const);
    for (const [key, report] of Object.entries(approvedCorrectionReports)) {
      entries.push([key, report]);
    }
    return Object.fromEntries(entries) as Record<string, WorkReport>;
  }, [approvedCorrectionReports]);
  const monthlyReports = useMemo(
    () => Object.values(reportByCell).filter((report) => report.workDate.startsWith(monthlyReportMonth)),
    [reportByCell],
  );
  const pendingCorrections = correctionRequests.filter((request) => request.status === "pending");

  const selectedEmployee = selectedCell ? employees.find((employee) => employee.id === selectedCell.employeeId) : undefined;
  const selectedDay = selectedCell ? selectedWeek.days.find((day) => day.key === selectedCell.dayKey) : undefined;
  const selectedReport = selectedCell ? reportByCell[reportKey(selectedCell.employeeId, selectedCell.dayKey)] : undefined;
  const selectedCorrection =
    selectedCell && selectedEmployee
      ? pendingCorrections.find((request) => request.employeeName === selectedEmployee.name && request.date === selectedCell.dayKey)
      : undefined;
  const selectedIsPast = selectedCell ? selectedCell.dayKey < todayKey : false;
  const selectedIsReportOnly = selectedIsPast || Boolean(selectedReport) || Boolean(selectedCorrection);
  const missingRequestEmployees = employees.filter((employee) => missingRequestEmployeeIds.includes(employee.id));
  const selectedEditableShiftCodes =
    selectedEmployee?.id === "cons" ? editableShiftCodes : editableShiftCodes.filter((code) => code !== "shift_3");

  const weekRows = useMemo(
    () =>
      employees.map((employee) => {
        const weekShifts = selectedWeek.days.map((day) => schedule[employee.id][day.key] ?? "none");
        const planned = weekShifts.reduce((total, shift) => total + shiftMeta[shift].hours, 0);
        const actual = monthlyReports
          .filter((report) => report.employeeId === employee.id && report.workDate.startsWith("2026-06"))
          .reduce((total, report) => total + reportHours(report), 0);
        return { employee, weekShifts, planned, actual };
      }),
    [monthlyReports, schedule, selectedWeek],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextRequests: AttendanceCorrectionRequest[] = [];
      // Demo only. In production correction requests will be stored in database.
      for (const employee of employees) {
        const storedRequests = window.localStorage.getItem(getCorrectionRequestsStorageKey(employee.name));
        if (!storedRequests) {
          continue;
        }
        try {
          const parsed = JSON.parse(storedRequests) as AttendanceCorrectionRequest[];
          nextRequests.push(...parsed);
        } catch {
          // Ignore malformed demo localStorage data.
        }
      }
      setCorrectionRequests(nextRequests.length > 0 ? nextRequests : demoCorrectionRequests);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function openCell(employeeId: string, dayKey: string) {
    setSelectedCell({ employeeId, dayKey });
    setDraftShift(schedule[employeeId][dayKey] ?? "none");
  }

  function saveCell() {
    if (!selectedCell) {
      return;
    }
    setSchedule((current) => ({
      ...current,
      [selectedCell.employeeId]: {
        ...current[selectedCell.employeeId],
        [selectedCell.dayKey]: draftShift,
      },
    }));
    setSelectedCell(null);
  }

  function approveCorrectionRequest(request: AttendanceCorrectionRequest) {
    const employee = employees.find((currentEmployee) => currentEmployee.name === request.employeeName);
    if (!employee) {
      return;
    }
    const storageKey = getCorrectionRequestsStorageKey(request.employeeName);
    const nextRequests = correctionRequests.map((currentRequest) =>
      currentRequest.id === request.id ? { ...currentRequest, status: "approved" as const } : currentRequest,
    );
    setCorrectionRequests(nextRequests);
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(nextRequests.filter((currentRequest) => currentRequest.employeeName === request.employeeName)),
    );
    setApprovedCorrectionReports((current) => ({
      ...current,
      [reportKey(employee.id, request.date)]: {
        employeeId: employee.id,
        workDate: request.date,
        startedAt: request.requestedStartTime,
        endedAt: request.requestedEndTime,
        breakMinutes: request.requestedBreakMinutes,
        transportationCost: selectedReport?.transportationCost ?? 0,
        message: request.message,
      },
    }));
    setSuccess("修正依頼を承認しました");
  }

  function downloadMonthlyReportCsv() {
    const header = ["名前", "勤務時間", "交通費", "時給", "給与", "合計"];
    const rows = employees.map((employee) => {
      const employeeReports = monthlyReports.filter((report) => report.employeeId === employee.id);
      const hours = employeeReports.reduce((total, report) => total + reportHours(report), 0);
      const transportation = employeeReports.reduce((total, report) => total + report.transportationCost, 0);
      const salary = Math.round(hours * employee.hourlyWage);
      const total = salary + transportation;
      return [
        employee.name,
        Number.isInteger(hours) ? String(hours) : hours.toFixed(1),
        transportation,
        employee.hourlyWage,
        salary,
        total,
      ];
    });
    const csv = `\uFEFF${[header, ...rows].map((row) => row.map(csvValue).join(",")).join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cafe-shift-monthly-report-${monthlyReportMonth}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  function applyDraft(excludedEmployeeIds: string[] = []) {
    setSchedule((current) => buildDraftFromRequests(current, excludedEmployeeIds));
    setSelectedWeekIndex(4);
    setIsDraftGenerated(true);
    setSuccess(t("manager.generatedDraftSuccess"));
    setIsMissingRequestsOpen(false);
  }

  function handleDraftAction() {
    if (isDraftGenerated) {
      setIsDraftGenerated(false);
      setSuccess(t("manager.calendarConfirmed"));
      return;
    }

    if (missingRequestEmployees.length > 0) {
      setIsMissingRequestsOpen(true);
      return;
    }

    applyDraft();
  }

  function changeWeek(direction: -1 | 1) {
    setSelectedWeekIndex((current) => Math.min(weeks.length - 1, Math.max(0, current + direction)));
  }

  function goToToday() {
    if (currentWeekIndex >= 0) {
      setSelectedWeekIndex(currentWeekIndex);
    }
  }

  function handleCalendarWheel(event: WheelEvent<HTMLDivElement>) {
    const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.shiftKey ? event.deltaY : 0;
    if (Math.abs(horizontalDelta) < 24 || wheelLockRef.current) {
      return;
    }
    event.preventDefault();
    wheelLockRef.current = true;
    changeWeek(horizontalDelta > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 450);
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
    changeWeek(deltaX < 0 ? 1 : -1);
  }

  return (
    <div className="space-y-3 pb-2">
      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-[1fr_auto_auto_1fr] items-center gap-1.5">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
              disabled={selectedWeekIndex === 0}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm disabled:cursor-default disabled:opacity-40"
            >
              {t("manager.previousWeek")}
            </button>
            <span className="min-w-[116px] text-center text-xs font-bold text-slate-950">{selectedWeek.range}</span>
            <button
              type="button"
              onClick={goToToday}
              className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-[11px] font-bold text-emerald-800 shadow-sm"
            >
              {t("manager.today")}
            </button>
            <button
              type="button"
              onClick={() => changeWeek(1)}
              disabled={selectedWeekIndex === weeks.length - 1}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm disabled:cursor-default disabled:opacity-40"
            >
              {t("manager.nextWeek")}
            </button>
          </div>
          <button
            type="button"
            onClick={handleDraftAction}
            className="rounded-lg bg-emerald-800 px-3 py-2 text-sm font-bold text-white shadow-sm"
          >
            {isDraftGenerated ? t("manager.confirmNextMonthCalendar") : t("manager.generateFromRequests")}
          </button>
        </div>
        {isDraftGenerated ? <p className="mt-2 inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">{t("manager.shiftDraft")}</p> : null}
        {success ? <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{success}</p> : null}
        {pendingCorrections.length > 0 ? (
          <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-900">
            <p className="font-bold">勤務時間の修正依頼があります</p>
            <p className="mt-0.5 text-xs font-semibold">{pendingCorrections.length}件の修正依頼があります。確認してください。</p>
          </div>
        ) : null}

        <div
          className="mt-3 touch-pan-y"
          onWheel={handleCalendarWheel}
          onPointerDown={(event) => handleSwipeStart(event.clientX, event.clientY)}
          onPointerUp={(event) => handleSwipeEnd(event.clientX, event.clientY)}
          onPointerCancel={() => {
            swipeStartRef.current = null;
          }}
        >
          <table className="w-full table-fixed border-separate border-spacing-0 text-center text-[10px]">
            <thead>
              <tr>
                <th className="w-[18%] border-b border-r border-slate-200 bg-slate-50 px-1 py-1.5 text-left text-[10px] font-bold text-slate-600 sm:text-[11px]">
                  {t("manager.shiftOverview.employee")}
                </th>
                {selectedWeek.days.map((day, index) => {
                  const isMonthStart = index > 0 && day.month !== selectedWeek.days[index - 1].month;
                  const isToday = day.key === todayKey;
                  return (
                  <th
                    key={day.key}
                    className={`border-b border-r border-slate-200 px-0.5 py-1 text-[9px] font-bold sm:text-[10px] ${
                      isToday ? "bg-emerald-500 text-white ring-2 ring-emerald-700 ring-inset" : "bg-white text-slate-600"
                    } ${isMonthStart ? "border-l-4 border-l-rose-500 bg-rose-50" : ""}`}
                  >
                    <span className="block">{day.date}</span>
                    <span className="block text-[9px]">{day.weekday}</span>
                  </th>
                  );
                })}
                <th className="w-[9%] border-b border-r border-slate-200 bg-slate-50 px-0.5 py-1 text-[9px] font-bold text-slate-600 sm:text-[10px]">
                  {t("manager.weekPlanned")}
                </th>
                <th className="w-[9%] border-b border-l-2 border-slate-300 bg-slate-50 px-0.5 py-1 text-[9px] font-bold text-slate-600 sm:text-[10px]">
                  {t("manager.actualMonthly")}
                </th>
              </tr>
            </thead>
            <tbody>
              {weekRows.map((row) => (
                <tr key={`${selectedWeek.key}-${row.employee.id}`}>
                  <th className="truncate border-b border-r border-slate-100 bg-white px-1 py-1.5 text-left text-[10px] font-bold text-slate-800 sm:text-[11px]">
                    {row.employee.name}
                  </th>
                  {row.weekShifts.map((shift, index) => {
                    const day = selectedWeek.days[index];
                    const meta = shiftMeta[shift];
                    const hasReport = Boolean(reportByCell[reportKey(row.employee.id, day.key)]);
                    const hasPendingCorrection = pendingCorrections.some(
                      (request) => request.employeeName === row.employee.name && request.date === day.key,
                    );
                    return (
                      <td
                        key={`${row.employee.id}-${day.key}`}
                        className={`border-b border-r border-slate-100 bg-white px-0.5 py-1 ${
                          index > 0 && day.month !== selectedWeek.days[index - 1].month ? "border-l-4 border-l-rose-500 bg-rose-50/40" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => openCell(row.employee.id, day.key)}
                          className={`relative inline-flex h-7 w-full min-w-0 items-center justify-center rounded-md border px-0.5 text-[10px] font-bold ${meta.className} ${
                            hasReport ? "ring-1 ring-emerald-500" : ""
                          }`}
                        >
                          <span>{meta.label}</span>
                          {meta.time ? <span className="ml-1 hidden truncate text-[9px] font-semibold xl:inline">{meta.time}</span> : null}
                          {hasPendingCorrection ? (
                            <span className="absolute right-0 top-0 rounded-full bg-orange-600 px-1 text-[8px] font-bold leading-3 text-white shadow-sm">
                              !
                            </span>
                          ) : null}
                        </button>
                      </td>
                    );
                  })}
                  <td className="border-b border-r border-slate-100 bg-white px-0.5 py-1 text-[10px] font-bold text-slate-800 sm:text-[11px]">
                    {formatHours(row.planned)}
                  </td>
                  <td className="border-b border-l-2 border-slate-300 bg-white px-0.5 py-1 text-[10px] font-bold text-emerald-800 sm:text-[11px]">
                    {formatHours(row.actual)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-slate-500">デモ用の月次集計です。給与計算の正式書類ではありません。</p>
          <button
            type="button"
            onClick={downloadMonthlyReportCsv}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900 shadow-sm"
          >
            月間レポートCSV
          </button>
        </div>
      </section>

      {selectedCell && selectedEmployee && selectedDay ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center" onClick={() => setSelectedCell(null)}>
          <section className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">{selectedIsReportOnly ? t("manager.workReport") : t("manager.shiftEdit")}</h2>
                <p className="mt-0.5 text-sm font-semibold text-slate-600">
                  {selectedEmployee.name} / {selectedDay.date}（{selectedDay.weekday}）
                </p>
              </div>
              <button type="button" onClick={() => setSelectedCell(null)} className="rounded-lg px-2 py-1 text-sm text-slate-500">
                {t("manager.cancel")}
              </button>
            </div>

            <p className="mt-4 text-xs font-bold text-slate-700">
              {t("manager.plannedShift")}: <span className="text-slate-950">{shiftMeta[schedule[selectedCell.employeeId][selectedCell.dayKey] ?? "none"].label}</span>
            </p>

            {selectedCorrection ? (
              <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-950">
                <h3 className="font-bold">勤務時間の修正依頼</h3>
                <p className="mt-1 text-xs font-semibold">スタッフが勤務時間の修正を依頼しています。</p>
                <dl className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <dt className="text-[11px] font-bold text-orange-700">申請された出勤時間</dt>
                    <dd className="font-bold">{selectedCorrection.requestedStartTime || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold text-orange-700">申請された退勤時間</dt>
                    <dd className="font-bold">{selectedCorrection.requestedEndTime || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold text-orange-700">申請された休憩時間</dt>
                    <dd className="font-bold">{selectedCorrection.requestedBreakMinutes}分</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11px] font-bold text-orange-700">理由</dt>
                    <dd className="font-semibold">{selectedCorrection.message || "-"}</dd>
                  </div>
                </dl>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => approveCorrectionRequest(selectedCorrection)}
                    className="rounded-lg bg-orange-700 px-3 py-2 text-sm font-bold text-white"
                  >
                    承認する
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCell(null)}
                    className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-bold text-orange-800"
                  >
                    後で確認
                  </button>
                </div>
              </div>
            ) : null}

            {selectedIsReportOnly ? (
              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <h3 className="text-sm font-bold text-slate-950">{t("manager.workReport")}</h3>
                {selectedReport ? (
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
                  <p>{t("manager.workStart")}: <span className="font-bold">{selectedReport.startedAt}</span></p>
                  <p>{t("manager.workEnd")}: <span className="font-bold">{selectedReport.endedAt}</span></p>
                  <p>{t("manager.breakTime")}: <span className="font-bold">{selectedReport.breakMinutes}分</span></p>
                  <p>{t("manager.actualHours")}: <span className="font-bold">{formatHours(reportHours(selectedReport))}</span></p>
                  <p>{t("manager.transportation")}: <span className="font-bold">{selectedReport.transportationCost}円</span></p>
                  {selectedReport.message ? <p className="col-span-2">{t("manager.reportMessage")}: {selectedReport.message}</p> : null}
                </div>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-500">{t("manager.noReport")}</p>
                )}
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-700">{t("manager.shiftEdit")}</p>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {selectedEditableShiftCodes.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setDraftShift(code)}
                        className={`rounded-lg border px-2 py-2 text-xs font-bold ${
                          draftShift === code ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {shiftMeta[code].label}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={saveCell} className="mt-4 h-10 w-full rounded-lg bg-emerald-800 text-sm font-bold text-white">
                  {t("manager.save")}
                </button>
              </>
            )}
          </section>
        </div>
      ) : null}

      {isMissingRequestsOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center" onClick={() => setIsMissingRequestsOpen(false)}>
          <section className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-base font-bold text-slate-950">{t("manager.missingRequestsTitle")}</h2>
            <p className="mt-2 text-sm text-slate-600">{t("manager.missingRequestsMessage")}</p>
            <ul className="mt-3 space-y-1">
              {missingRequestEmployees.map((employee) => (
                <li key={employee.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                  {employee.name}
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => applyDraft(missingRequestEmployeeIds)} className="rounded-lg bg-emerald-800 px-3 py-2 text-sm font-bold text-white">
                {t("manager.createWithoutMissingStaff")}
              </button>
              <button type="button" onClick={() => setIsMissingRequestsOpen(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
                {t("manager.cancel")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
