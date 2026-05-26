"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";

type RequestStatus = "pending" | "reviewed" | "applied" | "hold";
type RequestFilter = "all" | RequestStatus;

type ShiftRequest = {
  id: number;
  employee: string;
  initials: string;
  date: string;
  shift: string;
  comment?: string;
  status: RequestStatus;
};

const initialRequests: ShiftRequest[] = [
  { id: 1, employee: "山田 花子", initials: "YH", date: "2026年6月3日（水）", shift: "1シフト", comment: "午前のみ可能です", status: "pending" },
  { id: 2, employee: "佐藤 健", initials: "SK", date: "2026年6月5日（金）", shift: "休み希望", comment: "予定があります", status: "pending" },
  { id: 3, employee: "鈴木 愛", initials: "SA", date: "2026年6月7日（日）", shift: "2シフト", status: "pending" },
  { id: 4, employee: "伊藤 翔", initials: "IS", date: "2026年6月10日（水）", shift: "通しシフト", status: "pending" },
  { id: 5, employee: "高橋 美咲", initials: "TM", date: "2026年6月12日（金）", shift: "休み希望", status: "pending" },
  { id: 6, employee: "田中 優", initials: "TY", date: "2026年6月14日（日）", shift: "1シフト", status: "pending" },
  { id: 7, employee: "中村 蓮", initials: "NR", date: "2026年6月18日（木）", shift: "2シフト", status: "pending" },
  { id: 8, employee: "小林 杏", initials: "KA", date: "2026年6月20日（土）", shift: "休み希望", status: "pending" },
];

const statusDetails: Record<RequestStatus, { label: string; badge: string }> = {
  pending: { label: "未確認", badge: "bg-amber-100 text-amber-800" },
  reviewed: { label: "確認済み", badge: "bg-emerald-100 text-emerald-800" },
  applied: { label: "反映済み", badge: "bg-sky-100 text-sky-800" },
  hold: { label: "保留", badge: "bg-slate-100 text-slate-700" },
};

const filters: { id: RequestFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "pending", label: "未確認" },
  { id: "reviewed", label: "確認済み" },
  { id: "applied", label: "反映済み" },
  { id: "hold", label: "保留" },
];

const summaryStatuses: RequestStatus[] = ["pending", "reviewed", "applied", "hold"];

export default function ManagerRequestsPage() {
  const [selectedFilter, setSelectedFilter] = useState<RequestFilter>("all");
  const [requests, setRequests] = useState<ShiftRequest[]>(initialRequests);

  const filteredRequests =
    selectedFilter === "all" ? requests : requests.filter((request) => request.status === selectedFilter);
  const pendingCount = requests.filter((request) => request.status === "pending").length;

  function changeStatus(id: number, status: RequestStatus) {
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, status } : request)));
  }

  return (
    <AppShell variant="wide">
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700">シフト希望</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">希望確認</h1>
              <p className="mt-1 text-sm text-slate-600">スタッフから提出されたシフト希望を確認できます</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white sm:self-auto">
              店長 田中
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">対象月</p>
              <p className="mt-1 text-xl font-bold text-slate-900">2026年6月</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">未確認 {pendingCount}件</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            この画面ではスタッフの希望を確認します。最終シフトは管理者が調整します。
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-medium text-slate-500">表示フィルター</p>
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
                {filter.label}
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
                <p className="text-xs text-slate-500">{detail.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{count}件</p>
              </div>
            );
          })}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">提出された希望</h2>
            <p className="text-sm text-slate-500">{filteredRequests.length}件</p>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              このステータスの希望はありません。
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
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${detail.badge}`}>{detail.label}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{request.date}</p>
                      <p className="mt-2 inline-flex rounded-lg bg-white px-2.5 py-1 text-sm font-semibold text-emerald-800">
                        {request.shift}
                      </p>
                      {request.comment ? (
                        <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-slate-600">メモ: {request.comment}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => changeStatus(request.id, "reviewed")}
                      className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
                    >
                      確認済みにする
                    </button>
                    <button
                      type="button"
                      onClick={() => changeStatus(request.id, "applied")}
                      className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800"
                    >
                      反映済みにする
                    </button>
                    <button
                      type="button"
                      onClick={() => changeStatus(request.id, "hold")}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      保留にする
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">シフト作成メモ</h2>
          <p className="mt-2 text-sm text-slate-600">
            希望は参考情報です。最終的なシフトは /manager/shifts で調整します。
          </p>
          <Link
            href="/manager/shifts"
            className="mt-3 inline-flex rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            シフト編集を開く →
          </Link>
        </section>

        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </p>
      </div>
    </AppShell>
  );
}
