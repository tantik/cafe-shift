"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";

type SuggestionStatus = "unchecked" | "reviewed" | "accepted" | "hold";
type Filter = "all" | SuggestionStatus;

type Suggestion = {
  id: string;
  employeeName: string;
  initials: string;
  category: string;
  title: string;
  content: string;
  priority: string;
  status: SuggestionStatus;
};

const initialSuggestions: Suggestion[] = [
  {
    id: "manager-suggestion-1",
    employeeName: "山田 花子",
    initials: "YH",
    category: "新レシピ",
    title: "抹茶ゆずラテの提案",
    content: "夏向けにさっぱりした抹茶ドリンクを追加できると良さそうです。",
    priority: "通常",
    status: "unchecked",
  },
  {
    id: "manager-suggestion-2",
    employeeName: "佐藤 健",
    initials: "SK",
    category: "業務改善",
    title: "仕込みチェックリストを作りたい",
    content: "朝の仕込み内容を確認できる紙か画面があるとミスが減りそうです。",
    priority: "できれば早め",
    status: "reviewed",
  },
  {
    id: "manager-suggestion-3",
    employeeName: "鈴木 愛",
    initials: "SA",
    category: "困りごと",
    title: "冷蔵庫の在庫確認が重複しています",
    content: "同じ在庫を複数人が確認している日があります。担当を決めたいです。",
    priority: "重要",
    status: "unchecked",
  },
  {
    id: "manager-suggestion-4",
    employeeName: "伊藤 翔",
    initials: "IS",
    category: "その他",
    title: "朝の清掃手順を共有したい",
    content: "新人スタッフ向けに朝の清掃手順をまとめると良いと思います。",
    priority: "通常",
    status: "hold",
  },
];

const filters: { id: Filter; labelKey: string }[] = [
  { id: "all", labelKey: "managerSuggestions.filters.all" },
  { id: "unchecked", labelKey: "managerSuggestions.status.unchecked" },
  { id: "reviewed", labelKey: "managerSuggestions.status.reviewed" },
  { id: "accepted", labelKey: "managerSuggestions.status.accepted" },
  { id: "hold", labelKey: "managerSuggestions.status.hold" },
];
const statuses: SuggestionStatus[] = ["unchecked", "reviewed", "accepted", "hold"];
const statusLabelKeys: Record<SuggestionStatus, string> = {
  unchecked: "managerSuggestions.status.unchecked",
  reviewed: "managerSuggestions.status.reviewed",
  accepted: "managerSuggestions.status.accepted",
  hold: "managerSuggestions.status.hold",
};

export default function ManagerSuggestionsPage() {
  return (
    <AppShell variant="wide">
      <ManagerSuggestionsContent />
    </AppShell>
  );
}

function ManagerSuggestionsContent() {
  const { t } = useI18n();
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [filter, setFilter] = useState<Filter>("all");

  const visibleSuggestions =
    filter === "all" ? suggestions : suggestions.filter((suggestion) => suggestion.status === filter);
  const counts = useMemo(
    () =>
      statuses.map((status) => ({
        status,
        count: suggestions.filter((suggestion) => suggestion.status === status).length,
      })),
    [suggestions],
  );

  function updateStatus(id: string, status: SuggestionStatus) {
    setSuggestions((current) =>
      current.map((suggestion) => (suggestion.id === id ? { ...suggestion, status } : suggestion)),
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700">{t("managerSuggestions.badge")}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("managerSuggestions.title")}</h1>
              <p className="mt-1 text-sm text-slate-600">{t("managerSuggestions.subtitle")}</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white sm:self-auto">
              {t("managerSuggestions.managerChip")}
            </span>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.map((item) => (
            <div key={item.status} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">{t(statusLabelKeys[item.status])}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{item.count}{t("managerSuggestions.itemsSuffix")}</p>
            </div>
          ))}
        </section>

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  filter === item.id ? "bg-emerald-800 text-white" : "bg-slate-50 text-slate-700"
                }`}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {visibleSuggestions.map((suggestion) => (
            <article key={suggestion.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-xs font-bold text-white">
                  {suggestion.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{suggestion.employeeName}</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                      {suggestion.category}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                      {suggestion.priority}
                    </span>
                    <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                      {t(statusLabelKeys[suggestion.status])}
                    </span>
                  </div>
                  <h2 className="mt-2 font-semibold text-slate-900">{suggestion.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{suggestion.content}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(suggestion.id, "reviewed")}
                      className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800"
                    >
                      {t("managerSuggestions.actions.markReviewed")}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(suggestion.id, "accepted")}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
                    >
                      {t("managerSuggestions.actions.accept")}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(suggestion.id, "hold")}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      {t("managerSuggestions.actions.hold")}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-slate-700 shadow-sm">
          {t("managerSuggestions.acceptedNote")}
        </section>

        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {t("managerSuggestions.demoNote")}
        </p>
      </div>
    </>
  );
}
