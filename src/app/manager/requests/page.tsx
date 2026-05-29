"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";
import { employees as coreEmployees, shiftTypes as coreShiftTypes } from "@/lib/mock-data/core";
import { shiftRequests as sharedShiftRequests } from "@/lib/mock-data/requests";

type RequestStatus = "pending" | "reviewed" | "applied" | "hold";
type RequestFilter = "all" | RequestStatus;

type ShiftRequest = {
  id: string;
  employee: string;
  initials: string;
  date: string;
  shift: string;
  comment?: string;
  status: RequestStatus;
};

function formatJapaneseDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日（${weekdays[date.getUTCDay()]}）`;
}

function mapSharedRequest(request: typeof sharedShiftRequests[number]): ShiftRequest {
  const employee = coreEmployees.find((item) => item.id === request.employeeId);
  const shift = coreShiftTypes.find((item) => item.code === request.shiftCode);
  return {
    id: request.id,
    employee: employee?.name ?? request.employeeId,
    initials: employee?.avatarLabel ?? request.employeeId.slice(0, 2),
    date: formatJapaneseDate(request.date),
    shift: request.shiftCode === "off" ? "休み希望" : shift?.label ?? request.shiftCode,
    comment: request.note,
    status: request.status,
  };
}

const initialRequests: ShiftRequest[] = sharedShiftRequests.map(mapSharedRequest);

const statusDetails: Record<RequestStatus, { labelKey: string; badge: string }> = {
  pending: { labelKey: "managerRequests.status.pending", badge: "bg-amber-100 text-amber-800" },
  reviewed: { labelKey: "managerRequests.status.reviewed", badge: "bg-emerald-100 text-emerald-800" },
  applied: { labelKey: "managerRequests.status.applied", badge: "bg-sky-100 text-sky-800" },
  hold: { labelKey: "managerRequests.status.hold", badge: "bg-slate-100 text-slate-700" },
};

const filters: { id: RequestFilter; labelKey: string }[] = [
  { id: "all", labelKey: "managerRequests.filters.all" },
  { id: "pending", labelKey: "managerRequests.filters.pending" },
  { id: "reviewed", labelKey: "managerRequests.filters.reviewed" },
  { id: "applied", labelKey: "managerRequests.filters.applied" },
  { id: "hold", labelKey: "managerRequests.filters.hold" },
];

const summaryStatuses: RequestStatus[] = ["pending", "reviewed", "applied", "hold"];

export default function ManagerRequestsPage() {
  return (
    <AppShell variant="wide">
      <ManagerRequestsContent />
    </AppShell>
  );
}

function ManagerRequestsContent() {
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<RequestFilter>("all");
  const [requests, setRequests] = useState<ShiftRequest[]>(initialRequests);

  const filteredRequests =
    selectedFilter === "all" ? requests : requests.filter((request) => request.status === selectedFilter);
  const pendingCount = requests.filter((request) => request.status === "pending").length;

  function changeStatus(id: string, status: RequestStatus) {
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, status } : request)));
  }

  return (
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700">{t("managerRequests.title")}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("managerRequests.title")}</h1>
              <p className="mt-1 text-sm text-slate-600">{t("managerRequests.subtitle")}</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white sm:self-auto">
              {t("managerRequests.managerChip")}
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">{t("managerRequests.targetMonth")}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{t("managerRequests.targetMonthValue")}</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
              {t("managerRequests.pendingCount")} {pendingCount}{t("managerRequests.itemsSuffix")}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{t("managerRequests.shiftMemoText")}</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-500">{t("managerRequests.filtersTitle")}</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  selectedFilter === filter.id
                    ? "border-emerald-700 bg-emerald-800 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                }`}
              >
                {t(filter.labelKey)}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {summaryStatuses.map((status) => {
            const detail = statusDetails[status];
            const count = requests.filter((request) => request.status === status).length;
            return (
              <div key={status} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xs text-slate-500">{t(detail.labelKey)}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{count}{t("managerRequests.itemsSuffix")}</p>
              </div>
            );
          })}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{t("managerRequests.requestListTitle")}</h2>
            <p className="text-sm text-slate-500">{filteredRequests.length}{t("managerRequests.itemsSuffix")}</p>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              <p className="font-semibold text-slate-700">{t("managerRequests.emptyTitle")}</p>
              <p className="mt-1">{t("managerRequests.emptyText")}</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const detail = statusDetails[request.status];
              return (
                <article key={request.id} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 shadow-sm sm:p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-xs font-bold text-white">
                      {request.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{request.employee}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${detail.badge}`}>{t(detail.labelKey)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{request.date}</p>
                      <p className="mt-2 inline-flex rounded-lg bg-white px-2.5 py-1 text-sm font-semibold text-emerald-800">
                        {request.shift}
                      </p>
                      {request.comment ? (
                        <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-slate-600">
                          {t("managerRequests.fields.note")}: {request.comment}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => changeStatus(request.id, "reviewed")}
                      className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
                    >
                      {t("managerRequests.actions.markReviewed")}
                    </button>
                    <button
                      type="button"
                      onClick={() => changeStatus(request.id, "applied")}
                      className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800"
                    >
                      {t("managerRequests.actions.markApplied")}
                    </button>
                    <button
                      type="button"
                      onClick={() => changeStatus(request.id, "hold")}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {t("managerRequests.actions.markHold")}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t("managerRequests.shiftMemoTitle")}</h2>
          <p className="mt-2 text-sm text-slate-600">{t("managerRequests.shiftMemoText")}</p>
          <Link
            href="/manager/shifts"
            className="mt-3 inline-flex rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {t("managerRequests.openShiftEditor")}
          </Link>
        </section>

        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {t("managerRequests.demoNote")}
        </p>
      </div>
  );
}
