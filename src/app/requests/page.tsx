"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";

// Stable mock today for demo (deterministic across server/client)
const MOCK_TODAY = "2026-06-01";
const TARGET_YEAR = 2026;
const TARGET_MONTH_INDEX = 5;
const TARGET_MONTH_LABEL = "6月";

type RequestTab = "shift" | "vacation";
type RequestOption = "1シフト" | "2シフト" | "通しシフト" | "休み希望";
type VacationType = "休暇" | "病欠" | "その他";

type VacationRequest = {
  id: string;
  date: string;
  type: VacationType;
  reason: string;
  memo: string;
  status: "未確認";
};

const vacationTypes: VacationType[] = ["休暇", "病欠", "その他"];
const initialVacationRequests: VacationRequest[] = [
  {
    id: "vacation-request-001",
    date: "2026-06-10",
    type: "休暇",
    reason: "家庭の都合",
    memo: "午前中に用事があります",
    status: "未確認",
  },
];

function generateDates(start: Date, count: number) {
  const arr: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    arr.push(d);
  }
  return arr;
}

function generateMonthDates(year: number, monthIndex: number) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return generateDates(new Date(year, monthIndex, 1), daysInMonth);
}

function orderForTwoRowCalendar(monthDates: Date[]) {
  const orderedDates: Date[] = [];
  for (let chunkStart = 0; chunkStart < monthDates.length; chunkStart += 14) {
    const chunk = monthDates.slice(chunkStart, chunkStart + 14);
    for (let index = 0; index < 7; index++) {
      if (chunk[index]) {
        orderedDates.push(chunk[index]);
      }
      if (chunk[index + 7]) {
        orderedDates.push(chunk[index + 7]);
      }
    }
  }
  return orderedDates;
}

function formatKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}
function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
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
  // target month start (mock)
  const dates = useMemo(() => generateMonthDates(TARGET_YEAR, TARGET_MONTH_INDEX), []);
  const calendarDates = useMemo(() => orderForTwoRowCalendar(dates), [dates]);
  // use stable mock today key to avoid server/client mismatch
  const todayKey = MOCK_TODAY;

  // requests stored as map dateKey -> RequestOption | null
  const [requests, setRequests] = useState<Record<string, RequestOption | null>>({});
  const [activeTab, setActiveTab] = useState<RequestTab>("shift");

  const [modalOpen, setModalOpen] = useState(false);
  const [activeDateKey, setActiveDateKey] = useState<string | null>(null);
  const [tempSelection, setTempSelection] = useState<RequestOption | null>("休み希望");

  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [vacationDate, setVacationDate] = useState(MOCK_TODAY);
  const [vacationType, setVacationType] = useState<VacationType>("休暇");
  const [vacationReason, setVacationReason] = useState("");
  const [vacationMemo, setVacationMemo] = useState("");
  const [vacationRequests, setVacationRequests] = useState(initialVacationRequests);
  const [nextVacationRequestNumber, setNextVacationRequestNumber] = useState(2);
  const [vacationError, setVacationError] = useState("");
  const [vacationSuccess, setVacationSuccess] = useState("");

  function openForDate(date: Date) {
    const key = formatKey(date);
    setActiveDateKey(key);
    // default highlight 休み希望 if no existing request
    const existing = requests[key] ?? null;
    setTempSelection(existing ?? "休み希望");
    setModalOpen(true);
  }

  function confirmSelection() {
    if (!activeDateKey) return;
    setRequests((prev) => ({ ...prev, [activeDateKey]: tempSelection }));
    setModalOpen(false);
  }

  function clearSelection() {
    if (!activeDateKey) return;
    setRequests((prev) => {
      const next = { ...prev };
      delete next[activeDateKey];
      return next;
    });
    setModalOpen(false);
  }

  function submitAll() {
    // mock submit
    setNotice(t("requests.shift.success"));
    setTimeout(() => setNotice(null), 3000);
  }

  function submitVacationRequest() {
    setVacationError("");
    setVacationSuccess("");

    if (!vacationDate) {
      setVacationError(t("requests.vacation.validationDateRequired"));
      return;
    }
    if (!vacationType) {
      setVacationError(t("requests.vacation.validationTypeRequired"));
      return;
    }
    if (!vacationReason.trim()) {
      setVacationError(t("requests.vacation.validationReasonRequired"));
      return;
    }

    const request: VacationRequest = {
      id: `vacation-request-${String(nextVacationRequestNumber).padStart(3, "0")}`,
      date: vacationDate,
      type: vacationType,
      reason: vacationReason.trim(),
      memo: vacationMemo.trim(),
      status: "未確認",
    };

    setVacationRequests((current) => [request, ...current]);
    setNextVacationRequestNumber((current) => current + 1);
    setVacationSuccess(t("requests.vacation.success"));
    setVacationReason("");
    setVacationMemo("");
  }

  function requestOptionLabel(option: RequestOption) {
    if (option === "1シフト") return t("requests.optionShift1");
    if (option === "2シフト") return t("requests.optionShift2");
    if (option === "通しシフト") return t("requests.optionFullDay");
    return t("requests.optionOff");
  }

  function requestOptionDescription(option: RequestOption) {
    if (option === "1シフト") return "08:30–13:00";
    if (option === "2シフト") return "13:00–17:30";
    if (option === "通しシフト") return "08:30–17:30";
    return t("requests.optionOffDescription");
  }

  function vacationTypeLabel(type: VacationType) {
    if (type === "休暇") return t("requests.vacation.typeVacation");
    if (type === "病欠") return t("requests.vacation.typeSick");
    return t("requests.vacation.typeOther");
  }

  function shortWeekday(date: Date) {
    const keys = [
      "weekday.short.sun",
      "weekday.short.mon",
      "weekday.short.tue",
      "weekday.short.wed",
      "weekday.short.thu",
      "weekday.short.fri",
      "weekday.short.sat",
    ];
    return t(keys[date.getDay()]);
  }

  function longWeekday(date: Date) {
    const keys = [
      "weekday.long.sun",
      "weekday.long.mon",
      "weekday.long.tue",
      "weekday.long.wed",
      "weekday.long.thu",
      "weekday.long.fri",
      "weekday.long.sat",
    ];
    return t(keys[date.getDay()]);
  }

  function formatMonthDay(date: Date) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatDateWithWeekday(date: Date) {
    return `${formatMonthDay(date)}（${shortWeekday(date)}）`;
  }

  function formatDateKeyWithWeekday(dateKey: string) {
    const date = dateFromKey(dateKey);
    return date ? formatDateWithWeekday(date) : dateKey;
  }

  function formatMonthRequestsTitle() {
    return t("requests.monthRequests")
      .replace("{monthLabel}", TARGET_MONTH_LABEL)
      .replace("{days}", String(dates.length));
  }

  const selectedList = Object.entries(requests)
    .filter(([, v]) => v)
    .map(([k, v]) => ({ dateKey: k, label: v as RequestOption }))
    .sort((a, b) => (a.dateKey > b.dateKey ? 1 : -1));
  const activeDate = activeDateKey ? dateFromKey(activeDateKey) : null;

  return (
    <div className="space-y-5 pb-6">
        {/* Header */}
        <header className="rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">{t("requests.title")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("requests.subtitle")}</p>
          <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 shadow-sm">
            <div className="h-8 w-8 flex-none rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-semibold">YH</div>
            <div className="text-sm font-medium">山田 花子</div>
          </div>
        </header>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="font-semibold text-slate-900">{t("requests.explanationTitle")}</p>
          <p className="mt-1 text-sm text-slate-600">{t("requests.explanationText")}</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "shift" as const, label: t("requests.shiftTab") },
              { id: "vacation" as const, label: t("requests.vacationTab") },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-emerald-700 bg-emerald-800 text-white"
                    : "border-transparent bg-slate-50 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {activeTab === "shift" ? (
          <>
            {/* Month Card */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{t("requests.targetMonth")}</div>
                  <div className="mt-1 font-semibold text-slate-900">{t("requests.targetMonthValue")}</div>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    {t("requests.unsubmitted")}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{t("requests.afterSubmitNote")}</p>
            </div>

            {/* Full month calendar */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900">{formatMonthRequestsTitle()}</h2>
              <p className="text-sm text-slate-500 mt-1">{t("requests.tapDateHint")}</p>

              <div className="mt-3 overflow-x-auto pb-2">
                <div className="grid grid-flow-col grid-rows-2 auto-cols-[72px] gap-2">
                  {calendarDates.map((d) => {
                    const key = formatKey(d);
                    const req = requests[key] ?? null;
                    const isRequested = !!req;
                    const isToday = key === todayKey;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => openForDate(d)}
                        aria-label={`${formatDateWithWeekday(d)} ${req ? requestOptionLabel(req) : t("requests.shift.unselected")}`}
                        className={`min-h-[96px] rounded-xl p-2 text-left shadow-sm transition ${
                          isToday
                            ? "border-2 border-amber-400 bg-amber-50"
                            : isRequested
                              ? "border border-amber-200 bg-amber-50"
                              : "border border-slate-100 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{d.getDate()}日</div>
                            <div className="mt-0.5 text-xs font-medium text-slate-500">{shortWeekday(d)}</div>
                          </div>
                          {isToday ? (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-900">
                              {t("requests.today")}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-slate-600">
                          {req ? requestOptionLabel(req) : t("requests.shift.unselected")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Selected requests summary */}
            <section className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900">{t("requests.shift.selectedTitle")}</h3>
              <div className="mt-3">
                {selectedList.length === 0 ? (
                  <p className="text-sm text-slate-500">{t("requests.shift.emptySelected")}</p>
                ) : (
                  <div className="max-h-[240px] overflow-y-auto pr-2">
                    <ul className="space-y-2">
                      {selectedList.map((s) => (
                        <li key={s.dateKey} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                          <div>
                            <div className="text-sm font-medium text-slate-800">{formatDateKeyWithWeekday(s.dateKey)}</div>
                            <div className="text-xs text-slate-600">{requestOptionLabel(s.label)}</div>
                          </div>
                          <div className="text-xs text-slate-500">{t("requests.shift.edit")}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* Comment box */}
            <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
              <label className="text-sm font-medium text-slate-800">
                {t("requests.shift.comment")}（{t("common.optional")}）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("requests.shift.commentPlaceholder")}
                className="mt-2 w-full resize-none rounded-lg border border-slate-100 p-3 text-sm"
                rows={3}
              />
            </div>

            {/* Submit button */}
            <div className="space-y-2">
              <button
                onClick={submitAll}
                className="w-full rounded-3xl bg-gradient-to-r from-green-700 to-green-800 px-4 py-3 text-white font-semibold shadow-md"
              >
                {t("requests.shift.submit")}
              </button>
              {notice && <div className="text-center text-sm text-emerald-600">{notice}</div>}
            </div>
          </>
        ) : (
          <>
            <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-900">{t("requests.vacation.title")}</h2>
              <label className="block text-sm font-semibold text-slate-800">
                {t("requests.vacation.date")}
                <input
                  type="date"
                  value={vacationDate}
                  onChange={(event) => setVacationDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </label>

              <div>
                <p className="text-sm font-semibold text-slate-800">{t("requests.vacation.type")}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {vacationTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVacationType(type)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        vacationType === type
                          ? "border-emerald-700 bg-emerald-800 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {vacationTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-semibold text-slate-800">
                {t("requests.vacation.reason")}
                <textarea
                  value={vacationReason}
                  onChange={(event) => setVacationReason(event.target.value)}
                  placeholder={t("requests.vacation.reasonPlaceholder")}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                {t("requests.vacation.memo")}（{t("common.optional")}）
                <textarea
                  value={vacationMemo}
                  onChange={(event) => setVacationMemo(event.target.value)}
                  placeholder={t("requests.vacation.memoPlaceholder")}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                />
              </label>

              {vacationError ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{vacationError}</p>
              ) : null}
              {vacationSuccess ? (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{vacationSuccess}</p>
              ) : null}

              <button
                type="button"
                onClick={submitVacationRequest}
                className="w-full rounded-3xl bg-gradient-to-r from-green-700 to-green-800 px-4 py-3 font-semibold text-white shadow-md"
              >
                {t("requests.vacation.submit")}
              </button>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900">{t("requests.vacation.recentTitle")}</h3>
              <div className="mt-3 space-y-2">
                {vacationRequests.map((request) => (
                  <article key={request.id} className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{request.date}</p>
                        <p className="mt-1 text-xs text-slate-600">{vacationTypeLabel(request.type)}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                        {t("requests.vacation.statusPending")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{request.reason}</p>
                    {request.memo ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {t("requests.vacation.memo")}: {request.memo}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        <p className="text-xs text-slate-500">{t("common.demoNote")}</p>

        {/* Modal / Bottom sheet */}
        {modalOpen && activeDateKey && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
            <div className="relative w-full max-w-[430px] rounded-t-2xl bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-700">
                    {activeDate ? formatDateWithWeekday(activeDate) : activeDateKey}
                  </div>
                  {activeDate ? <div className="text-xs text-slate-500">{longWeekday(activeDate)}</div> : null}
                  <div className="text-xs text-slate-500">{t("requests.shift.modalHint")}</div>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-sm text-slate-500">{t("common.close")}</button>
              </div>

              <div className="mt-4 space-y-3">
                {(["1シフト", "2シフト", "通しシフト", "休み希望"] as RequestOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setTempSelection(opt)}
                    className={`w-full rounded-xl px-4 py-3 text-left ${
                      tempSelection === opt ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800">{requestOptionLabel(opt)}</div>
                        <div className="text-xs text-slate-500">{requestOptionDescription(opt)}</div>
                      </div>
                      {tempSelection === opt && <div className="text-green-700 font-semibold">{t("requests.shift.selected")}</div>}
                    </div>
                  </button>
                ))}

                <div className="flex gap-2">
                  <button onClick={clearSelection} className="flex-1 rounded-xl bg-slate-100 px-4 py-3">{t("requests.shift.clear")}</button>
                  <button
                    onClick={confirmSelection}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold"
                  >
                    {requests[activeDateKey] ? t("requests.shift.change") : t("requests.shift.confirm")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
