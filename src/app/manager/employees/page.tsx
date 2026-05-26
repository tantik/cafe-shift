"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";

type EmployeeFilter = "all" | "active" | "inactive" | "unlinked";

type Employee = {
  id: number;
  familyName: string;
  givenName: string;
  displayName: string;
  initials: string;
  lineUserId: string;
  active: boolean;
  memo: string;
};

type EmployeeDraft = Omit<Employee, "id">;

const initialEmployees: Employee[] = [
  { id: 1, familyName: "山田", givenName: "花子", displayName: "山田", initials: "YH", active: true, lineUserId: "line_yamada", memo: "午前シフト中心" },
  { id: 2, familyName: "佐藤", givenName: "健", displayName: "佐藤", initials: "SK", active: true, lineUserId: "line_sato", memo: "" },
  { id: 3, familyName: "鈴木", givenName: "愛", displayName: "鈴木", initials: "SA", active: true, lineUserId: "", memo: "" },
  { id: 4, familyName: "伊藤", givenName: "翔", displayName: "伊藤", initials: "IS", active: true, lineUserId: "line_ito", memo: "" },
  { id: 5, familyName: "高橋", givenName: "美咲", displayName: "高橋", initials: "TM", active: false, lineUserId: "", memo: "" },
  { id: 6, familyName: "田中", givenName: "優", displayName: "田中", initials: "TY", active: true, lineUserId: "line_tanaka", memo: "" },
  { id: 7, familyName: "中村", givenName: "蓮", displayName: "中村", initials: "NR", active: true, lineUserId: "line_nakamura", memo: "" },
  { id: 8, familyName: "小林", givenName: "杏", displayName: "小林", initials: "KA", active: true, lineUserId: "", memo: "" },
];

const emptyDraft: EmployeeDraft = {
  familyName: "",
  givenName: "",
  displayName: "",
  initials: "",
  lineUserId: "",
  active: true,
  memo: "",
};

const filters: { id: EmployeeFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "active", label: "勤務中" },
  { id: "inactive", label: "休止中" },
  { id: "unlinked", label: "LINE未連携" },
];

export default function ManagerEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<EmployeeFilter>("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<EmployeeDraft>(emptyDraft);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleEmployees = employees.filter((employee) => {
    const matchesQuery =
      normalizedQuery === "" ||
      `${employee.familyName} ${employee.givenName} ${employee.displayName} ${employee.initials}`
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && employee.active) ||
      (selectedFilter === "inactive" && !employee.active) ||
      (selectedFilter === "unlinked" && employee.lineUserId === "");
    return matchesQuery && matchesFilter;
  });
  const activeCount = employees.filter((employee) => employee.active).length;
  const inactiveCount = employees.filter((employee) => !employee.active).length;
  const unlinkedCount = employees.filter((employee) => employee.lineUserId === "").length;

  function openAddEditor() {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsEditorOpen(true);
  }

  function openEditEditor(employee: Employee) {
    setEditingId(employee.id);
    setDraft({
      familyName: employee.familyName,
      givenName: employee.givenName,
      displayName: employee.displayName,
      initials: employee.initials,
      lineUserId: employee.lineUserId,
      active: employee.active,
      memo: employee.memo,
    });
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
  }

  function updateDraft<K extends keyof EmployeeDraft>(field: K, value: EmployeeDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function saveEmployee() {
    if (!draft.familyName.trim() || !draft.givenName.trim() || !draft.displayName.trim() || !draft.initials.trim()) {
      return;
    }

    if (editingId === null) {
      const nextId = employees.reduce((max, employee) => Math.max(max, employee.id), 0) + 1;
      setEmployees((current) => [...current, { id: nextId, ...draft }]);
    } else {
      setEmployees((current) =>
        current.map((employee) => (employee.id === editingId ? { id: editingId, ...draft } : employee)),
      );
    }
    closeEditor();
  }

  function toggleEmployeeStatus(id: number) {
    setEmployees((current) =>
      current.map((employee) => (employee.id === id ? { ...employee, active: !employee.active } : employee)),
    );
  }

  return (
    <AppShell variant="wide">
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700">スタッフ情報</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">スタッフ管理</h1>
              <p className="mt-1 text-sm text-slate-600">スタッフ情報と勤務ステータスを管理できます</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white sm:self-auto">
              店長 田中
            </span>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">登録スタッフ</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{employees.length}名</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">勤務中</p>
            <p className="mt-1 text-xl font-bold text-emerald-800">{activeCount}名</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">休止中</p>
            <p className="mt-1 text-xl font-bold text-amber-800">{inactiveCount}名</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-950/5 p-3 shadow-sm">
            <p className="text-xs text-slate-500">LINE未連携</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{unlinkedCount}名</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="名前で検索"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={openAddEditor}
              className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
            >
              スタッフを追加
            </button>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                  selectedFilter === filter.id
                    ? "border-emerald-700 bg-emerald-800 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">スタッフ一覧</h2>
            <p className="text-sm text-slate-500">{visibleEmployees.length}名</p>
          </div>

          {visibleEmployees.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
              条件に合うスタッフはいません。
            </p>
          ) : (
            visibleEmployees.map((employee) => (
              <article key={employee.id} className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 shadow-sm">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-xs font-bold text-white">
                    {employee.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{employee.displayName}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          employee.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {employee.active ? "勤務中" : "休止中"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          employee.lineUserId ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {employee.lineUserId ? "連携済み" : "未連携"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {employee.familyName} {employee.givenName}
                    </p>
                    {employee.memo ? <p className="mt-1 text-xs text-slate-500">メモ: {employee.memo}</p> : null}
                  </div>
                </div>
                <div className="mt-2.5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditEditor(employee)}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleEmployeeStatus(employee.id)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {employee.active ? "休止にする" : "勤務中に戻す"}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm">
          <h2 className="font-semibold text-slate-900">LINE連携について</h2>
          <p className="mt-1 text-sm text-slate-600">
            LINE User ID は後でLIFF連携時に自動取得できるようにします。MVPでは手動入力または未連携でも問題ありません。
          </p>
        </section>

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </p>
      </div>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center">
          <section className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl" role="dialog" aria-modal="true" aria-label="スタッフ情報を編集">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">{editingId === null ? "スタッフを追加" : "スタッフを編集"}</h2>
              <button type="button" onClick={closeEditor} className="rounded-lg px-2 py-1 text-sm text-slate-500">
                閉じる
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="text-sm font-semibold text-slate-700">
                姓
                <input
                  value={draft.familyName}
                  onChange={(event) => updateDraft("familyName", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                名
                <input
                  value={draft.givenName}
                  onChange={(event) => updateDraft("givenName", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                表示名
                <input
                  value={draft.displayName}
                  onChange={(event) => updateDraft("displayName", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                イニシャル
                <input
                  value={draft.initials}
                  onChange={(event) => updateDraft("initials", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                />
              </label>
            </div>

            <label className="mt-3 block text-sm font-semibold text-slate-700">
              LINE User ID
              <input
                value={draft.lineUserId}
                onChange={(event) => updateDraft("lineUserId", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
              />
            </label>

            <p className="mt-3 text-sm font-semibold text-slate-700">ステータス</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                { active: true, label: "勤務中" },
                { active: false, label: "休止中" },
              ].map((status) => (
                <button
                  key={status.label}
                  type="button"
                  onClick={() => updateDraft("active", status.active)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                    draft.active === status.active
                      ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <label className="mt-3 block text-sm font-semibold text-slate-700">
              メモ
              <textarea
                value={draft.memo}
                onChange={(event) => updateDraft("memo", event.target.value)}
                className="mt-1 block min-h-16 w-full rounded-lg border border-slate-200 p-3 font-normal outline-none focus:border-emerald-500"
              />
            </label>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveEmployee}
                disabled={!draft.familyName.trim() || !draft.givenName.trim() || !draft.displayName.trim() || !draft.initials.trim()}
                className="flex-1 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                保存する
              </button>
              <button
                type="button"
                onClick={closeEditor}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                閉じる
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
