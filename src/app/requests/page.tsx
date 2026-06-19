"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";
import { DEMO_START_DATE, shiftTypes as coreShiftTypes } from "@/lib/mock-data/core";
import type { ShiftCode } from "@/types/domain";

type RequestShiftCode = "shift_1" | "shift_2" | "shift_3" | "full_day" | "store_closed" | "vacation" | "none";

type CalendarDay = {
  key: string;
  day: number;
  weekdayIndex: number;
  isCurrentMonth: boolean;
};

type DemoReport = {
  plannedShift: RequestShiftCode;
  start: string;
  end: string;
  breakMinutes: number;
  actualHours: string;
  transportation: number;
  message: string;
};

const weekdays = ["月", "火", "水", "木", "金", "土", "日"];
const baseDate = parseDateKey(DEMO_START_DATE);
const initialMonthOffset = 1;
const demoRequestHistory: Record<string, RequestShiftCode> = {
  "2026-06-03": "shift_1",
  "2026-06-04": "shift_2",
  "2026-06-06": "vacation",
  "2026-06-09": "full_day",
  "2026-06-12": "shift_3",
  "2026-06-16": "shift_1",
  "2026-06-17": "store_closed",
  "2026-06-18": "full_day",
};

const demoReports: Record<string, DemoReport> = {
  "2026-06-16": {
    plannedShift: "shift_1",
    start: "08:31",
    end: "13:04",
    breakMinutes: 0,
    actualHours: "4.5h",
    transportation: 500,
    message: "通常通り。朝の補充を対応しました。",
  },
  "2026-06-18": {
    plannedShift: "full_day",
    start: "08:28",
    end: "17:42",
    breakMinutes: 60,
    actualHours: "8.2h",
    transportation: 620,
    message: "ランチ後の片付けに少し時間がかかりました。",
  },
};

const requestOptions: RequestShiftCode[] = ["shift_1", "shift_2", "shift_3", "full_day", "store_closed", "vacation", "none"];

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function getClientDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonthStart(monthOffset: number) {
  return new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + monthOffset, 1));
}

function getMonthLabel(monthStart: Date) {
  return `${monthStart.getUTCFullYear()}年${monthStart.getUTCMonth() + 1}月`;
}

function getCalendarDays(monthStart: Date): CalendarDay[] {
  const year = monthStart.getUTCFullYear();
  const monthIndex = monthStart.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const firstWeekdayIndex = (firstDay.getUTCDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setUTCDate(firstDay.getUTCDate() - firstWeekdayIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);
    return {
      key: formatDateKey(date),
      day: date.getUTCDate(),
      weekdayIndex: (date.getUTCDay() + 6) % 7,
      isCurrentMonth: date.getUTCMonth() === monthIndex,
    };
  });
}

function getCoreShift(code: ShiftCode) {
  return coreShiftTypes.find((shift) => shift.code === code);
}

function getRequestMeta(code: RequestShiftCode) {
  if (code === "none") {
    return { marker: "-", label: "-", detail: "", className: "border-slate-100 bg-white text-slate-400" };
  }
  if (code === "store_closed") {
    return { marker: "休", label: "休み", detail: "休み", className: "border-sky-100 bg-sky-50 text-sky-700" };
  }

  const shiftCode = code as Exclude<ShiftCode, "sick" | "off">;
  const shift = getCoreShift(shiftCode);
  const markerByCode: Record<Exclude<ShiftCode, "sick" | "off">, string> = {
    shift_1: "1",
    shift_2: "2",
    shift_3: "3",
    full_day: "通",
    vacation: "休暇",
  };
  const styles: Record<Exclude<ShiftCode, "sick" | "off">, string> = {
    shift_1: "border-sky-200 bg-sky-50 text-sky-800",
    shift_2: "border-orange-200 bg-orange-50 text-orange-800",
    shift_3: "border-yellow-200 bg-yellow-50 text-yellow-800",
    full_day: "border-emerald-200 bg-emerald-50 text-emerald-800",
    vacation: "border-pink-100 bg-pink-50/70 text-pink-700",
  };

  return {
    marker: markerByCode[shiftCode],
    label: shift?.label ?? markerByCode[shiftCode],
    detail: shift?.startTime && shift.endTime ? `${shift.startTime}〜${shift.endTime}` : "休暇",
    className: styles[shiftCode],
  };
}

function formatModalDate(dateKey: string) {
  const date = parseDateKey(dateKey);
  const weekday = weekdays[(date.getUTCDay() + 6) % 7];
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}（${weekday}）`;
}

function optionLabelKey(option: RequestShiftCode) {
  const keys: Record<RequestShiftCode, string> = {
    shift_1: "requests.shiftOption1",
    shift_2: "requests.shiftOption2",
    shift_3: "requests.shiftOption3",
    full_day: "requests.shiftOptionFull",
    store_closed: "requests.shiftOptionOff",
    vacation: "requests.shiftOptionVacation",
    none: "requests.shiftOptionNone",
  };
  return keys[option];
}

export default function RequestsPage() {
  return (
    <AppShell>
      <RequestsContent />
    </AppShell>
  );
}

function RequestsContent() {
  const { t } = useI18n();
  const [todayKey] = useState(getClientDateKey);
  const [monthOffset, setMonthOffset] = useState(initialMonthOffset);
  const [requests, setRequests] = useState<Record<string, RequestShiftCode>>(demoRequestHistory);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [draftSelection, setDraftSelection] = useState<RequestShiftCode>("none");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const monthStart = useMemo(() => getMonthStart(monthOffset), [monthOffset]);
  const calendarDays = useMemo(() => getCalendarDays(monthStart), [monthStart]);
  const monthLabel = getMonthLabel(monthStart);
  const selectedMeta = selectedDateKey ? getRequestMeta(requests[selectedDateKey] ?? "none") : null;
  const selectedReport = selectedDateKey ? demoReports[selectedDateKey] : undefined;
  const selectedIsReadOnly = selectedDateKey ? selectedDateKey < todayKey : false;
  const monthEnd = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0));
  const isPastMonth = formatDateKey(monthEnd) < todayKey;

  function openDay(dateKey: string) {
    setSelectedDateKey(dateKey);
    setDraftSelection(requests[dateKey] ?? "none");
  }

  function saveSelection() {
    if (!selectedDateKey || selectedDateKey < todayKey) {
      return;
    }
    setRequests((current) => ({ ...current, [selectedDateKey]: draftSelection }));
    setSelectedDateKey(null);
  }

  function submitRequests() {
    setSuccess(t("requests.shiftRequestsSuccessDemo"));
  }

  return (
    <div className="space-y-3 pb-4">
      <div>
        <h1 className="text-xl font-bold text-slate-950">{t("requests.shiftRequestsTitle")}</h1>
        <p className="mt-0.5 text-sm text-slate-600">{t("requests.shiftRequestsSubtitle")}</p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
        <button
          type="button"
          onClick={() => setMonthOffset((current) => current - 1)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm"
        >
          {t("requests.previousMonth")}
        </button>
        <span className="min-w-[96px] text-center text-sm font-bold text-slate-950">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setMonthOffset((current) => current + 1)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm"
        >
          {t("requests.nextMonth")}
        </button>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-300 text-center text-[10px] font-bold text-slate-500">
          {weekdays.map((weekday, index) => (
            <div
              key={weekday}
              className={`border-r border-slate-300 py-1 last:border-r-0 ${
                index === 5 ? "bg-sky-50/70" : index === 6 ? "bg-rose-50/60" : ""
              }`}
            >
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const request = requests[day.key] ?? "none";
            const meta = getRequestMeta(request);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => day.isCurrentMonth && openDay(day.key)}
                disabled={!day.isCurrentMonth}
                className={`min-h-[44px] border-r border-b border-slate-300 px-1 py-1 text-left last:border-r-0 disabled:bg-slate-50/60 disabled:text-slate-300 ${
                  day.weekdayIndex === 5 ? "bg-sky-50/40" : day.weekdayIndex === 6 ? "bg-rose-50/35" : "bg-white"
                }`}
              >
                <span className={`block text-[10px] font-bold leading-none ${day.isCurrentMonth ? "text-slate-700" : "text-slate-300"}`}>
                  {day.day}
                </span>
                <span className={`mt-1 flex h-5 items-center justify-center border text-[10px] font-bold leading-none ${meta.className}`}>
                  {day.isCurrentMonth ? meta.marker : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <label className="block rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <span className="text-sm font-bold text-slate-900">{t("requests.shiftRequestMessage")}</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("requests.shiftRequestMessagePlaceholder")}
          rows={3}
          readOnly={isPastMonth}
          className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900 read-only:bg-slate-50 read-only:text-slate-500"
        />
      </label>

      {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{success}</p> : null}

      <button
        type="button"
        onClick={submitRequests}
        disabled={isPastMonth}
        className="h-11 w-full rounded-lg bg-emerald-800 text-sm font-bold text-white shadow-sm disabled:cursor-default disabled:opacity-50"
      >
        {t("requests.submitShiftRequests")}
      </button>

      {selectedDateKey && selectedMeta ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label={t("requests.cancel")}
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setSelectedDateKey(null)}
          />
          <div className="relative w-full max-w-[430px] rounded-t-xl bg-white p-4 shadow-xl sm:rounded-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-slate-950">
                {t("requests.selectShiftForDate").replace("{date}", formatModalDate(selectedDateKey))}
              </h2>
              {selectedIsReadOnly ? (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{t("requests.readOnly")}</span>
              ) : null}
            </div>

            {selectedIsReadOnly ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">{t("requests.pastRecord")}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex min-w-9 justify-center rounded border px-1 py-0.5 text-xs font-bold ${selectedMeta.className}`}>
                      {selectedMeta.marker}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{selectedMeta.detail || selectedMeta.label}</span>
                  </div>
                </div>

                {selectedReport ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <p className="text-xs font-bold text-slate-500">{t("requests.demoReport")}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <p>{t("requests.plannedShift")}: <span className="font-bold">{getRequestMeta(selectedReport.plannedShift).marker}</span></p>
                      <p>{t("requests.actualHours")}: <span className="font-bold">{selectedReport.actualHours}</span></p>
                      <p>{t("requests.start")}: <span className="font-bold">{selectedReport.start}</span></p>
                      <p>{t("requests.end")}: <span className="font-bold">{selectedReport.end}</span></p>
                      <p>{t("requests.break")}: <span className="font-bold">{selectedReport.breakMinutes}分</span></p>
                      <p>{t("requests.transportation")}: <span className="font-bold">{selectedReport.transportation}円</span></p>
                      <p className="col-span-2">{t("requests.message")}: {selectedReport.message}</p>
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => setSelectedDateKey(null)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700"
                >
                  {t("requests.close")}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-3 space-y-1.5">
                  {requestOptions.map((option) => {
                    const meta = getRequestMeta(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDraftSelection(option)}
                        className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left ${
                          draftSelection === option ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white"
                        }`}
                      >
                        <span className={`inline-flex min-w-9 justify-center rounded border px-1 py-0.5 text-xs font-bold ${meta.className}`}>
                          {meta.marker}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">{t(optionLabelKey(option))}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDateKey(null)}
                    className="h-10 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700"
                  >
                    {t("requests.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={saveSelection}
                    className="h-10 rounded-lg bg-emerald-800 text-sm font-bold text-white"
                  >
                    {t("requests.save")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
