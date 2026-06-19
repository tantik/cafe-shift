"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import { demoEmployees } from "@/lib/demo-employees";
import { useI18n } from "@/lib/i18n/use-i18n";

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

const initialEmployees: Employee[] = demoEmployees.map((employee, index) => ({
  id: index + 1,
  familyName: employee.name,
  givenName: "",
  displayName: employee.name,
  initials: employee.initials,
  active: employee.active,
  lineUserId: employee.lineUserId,
  memo: employee.memo,
}));

const emptyDraft: EmployeeDraft = {
  familyName: "",
  givenName: "",
  displayName: "",
  initials: "",
  lineUserId: "",
  active: true,
  memo: "",
};

const filters: { id: EmployeeFilter; labelKey: string }[] = [
  { id: "all", labelKey: "managerEmployees.filters.all" },
  { id: "active", labelKey: "managerEmployees.filters.active" },
  { id: "inactive", labelKey: "managerEmployees.filters.inactive" },
  { id: "unlinked", labelKey: "managerEmployees.filters.unlinked" },
];

export default function ManagerEmployeesPage() {
  return (
    <AppShell variant="wide" showMobileNav={false}>
      <ManagerEmployeesContent />
    </AppShell>
  );
}

function ManagerEmployeesContent() {
  const { t } = useI18n();
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
    <>
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">{t("managerEmployees.totalStaff")}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{employees.length}{t("managerEmployees.peopleSuffix")}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">{t("managerEmployees.activeStaff")}</p>
            <p className="mt-1 text-xl font-bold text-emerald-800">{activeCount}{t("managerEmployees.peopleSuffix")}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">{t("managerEmployees.inactiveStaff")}</p>
            <p className="mt-1 text-xl font-bold text-amber-800">{inactiveCount}{t("managerEmployees.peopleSuffix")}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-950/5 p-3 shadow-sm">
            <p className="text-xs text-slate-500">{t("managerEmployees.unlinkedStaff")}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{unlinkedCount}{t("managerEmployees.peopleSuffix")}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("managerEmployees.searchPlaceholder")}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={openAddEditor}
              className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
            >
              {t("managerEmployees.addStaff")}
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
                {t(filter.labelKey)}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">{t("managerEmployees.staffListTitle")}</h2>
            <p className="text-sm text-slate-500">{visibleEmployees.length}{t("managerEmployees.peopleSuffix")}</p>
          </div>

          {visibleEmployees.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
              {t("managerEmployees.emptyText")}
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
                        {employee.active ? t("managerEmployees.status.active") : t("managerEmployees.status.inactive")}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          employee.lineUserId ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {employee.lineUserId ? t("managerEmployees.line.linked") : t("managerEmployees.line.unlinked")}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {employee.familyName} {employee.givenName}
                    </p>
                    {employee.memo ? <p className="mt-1 text-xs text-slate-500">{t("managerEmployees.memo")}: {employee.memo}</p> : null}
                  </div>
                </div>
                <div className="mt-2.5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditEditor(employee)}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
                  >
                    {t("managerEmployees.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleEmployeeStatus(employee.id)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {employee.active ? t("managerEmployees.deactivate") : t("managerEmployees.activate")}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t("managerEmployees.lineInfoTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("managerEmployees.lineInfoText")}</p>
        </section>

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          {t("managerEmployees.demoNote")}
        </p>
      </div>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center">
          <section className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl" role="dialog" aria-modal="true" aria-label={editingId === null ? t("managerEmployees.modal.addTitle") : t("managerEmployees.modal.editTitle")}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">{editingId === null ? t("managerEmployees.modal.addTitle") : t("managerEmployees.modal.editTitle")}</h2>
              <button type="button" onClick={closeEditor} className="rounded-lg px-2 py-1 text-sm text-slate-500">
                {t("managerEmployees.actions.close")}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="text-sm font-semibold text-slate-700">
                {t("managerEmployees.fields.familyName")}
                <input
                  value={draft.familyName}
                  onChange={(event) => updateDraft("familyName", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                {t("managerEmployees.fields.givenName")}
                <input
                  value={draft.givenName}
                  onChange={(event) => updateDraft("givenName", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                {t("managerEmployees.fields.displayName")}
                <input
                  value={draft.displayName}
                  onChange={(event) => updateDraft("displayName", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                {t("managerEmployees.fields.initials")}
                <input
                  value={draft.initials}
                  onChange={(event) => updateDraft("initials", event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                />
              </label>
            </div>

            <label className="mt-3 block text-sm font-semibold text-slate-700">
              {t("managerEmployees.fields.lineUserId")}
              <input
                value={draft.lineUserId}
                onChange={(event) => updateDraft("lineUserId", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
              />
            </label>

            <p className="mt-3 text-sm font-semibold text-slate-700">{t("managerEmployees.fields.status")}</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                { active: true, label: t("managerEmployees.status.active") },
                { active: false, label: t("managerEmployees.status.inactive") },
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
              {t("managerEmployees.fields.memo")}
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
                {t("managerEmployees.actions.save")}
              </button>
              <button
                type="button"
                onClick={closeEditor}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                {t("managerEmployees.actions.close")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
