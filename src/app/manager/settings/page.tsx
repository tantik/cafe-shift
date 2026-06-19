"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";

type Role = "manager" | "worker";

type User = {
  id: number;
  name: string;
  initials: string;
  role: Role;
  lineLinked: boolean;
};

type ShiftSetting = {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  color: "blue" | "terracotta" | "yellow" | "green" | "slate";
};

const users: User[] = [
  { id: 1, name: "店長 田中", initials: "TY", role: "manager", lineLinked: true },
  { id: 2, name: "山田 花子", initials: "YH", role: "worker", lineLinked: true },
  { id: 3, name: "佐藤 健", initials: "SK", role: "worker", lineLinked: true },
  { id: 4, name: "鈴木 愛", initials: "SA", role: "worker", lineLinked: false },
];

const periodPresets = [1, 10, 16, 21];

const initialShiftSettings: ShiftSetting[] = [
  { id: 1, label: "1", startTime: "08:30", endTime: "13:00", color: "blue" },
  { id: 2, label: "2", startTime: "13:00", endTime: "17:30", color: "terracotta" },
  { id: 3, label: "3", startTime: "08:30", endTime: "10:00", color: "yellow" },
  { id: 4, label: "通", startTime: "08:30", endTime: "17:30", color: "green" },
];

const colorPresets: ShiftSetting["color"][] = ["blue", "terracotta", "yellow", "green", "slate"];

function shiftColorClass(color: ShiftSetting["color"]) {
  if (color === "blue") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }
  if (color === "terracotta") {
    return "border-orange-200 bg-orange-50 text-orange-800";
  }
  if (color === "yellow") {
    return "border-yellow-200 bg-yellow-50 text-yellow-800";
  }
  if (color === "green") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function formatPeriodExample(day: number, t: (key: string) => string) {
  if (day === 1) {
    return t("managerSettings.periodExampleFirstDay");
  }
  return t("managerSettings.periodExampleOtherDay")
    .replace("{day}", String(day))
    .replace("{endDay}", String(day - 1));
}

export default function ManagerSettingsPage() {
  return (
    <AppShell variant="wide" showMobileNav={false}>
      <ManagerSettingsContent />
    </AppShell>
  );
}

function ManagerSettingsContent() {
  const { t } = useI18n();
  const [periodStart, setPeriodStart] = useState("16");
  const [managedUsers, setManagedUsers] = useState<User[]>(users);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [draftRole, setDraftRole] = useState<Role>("worker");
  const [shiftSettings, setShiftSettings] = useState<ShiftSetting[]>(initialShiftSettings);

  const editingUser = managedUsers.find((user) => user.id === editingUserId);
  const parsedPeriodStart = Number(periodStart);
  const isPeriodStartValid =
    periodStart.trim() !== "" &&
    Number.isInteger(parsedPeriodStart) &&
    parsedPeriodStart >= 1 &&
    parsedPeriodStart <= 28;

  function openRoleEditor(user: User) {
    setEditingUserId(user.id);
    setDraftRole(user.role);
  }

  function closeRoleEditor() {
    setEditingUserId(null);
  }

  function saveRole() {
    if (editingUserId === null) {
      return;
    }
    setManagedUsers((current) =>
      current.map((user) => (user.id === editingUserId ? { ...user, role: draftRole } : user)),
    );
    closeRoleEditor();
  }

  function updateShiftSetting<K extends keyof ShiftSetting>(id: number, field: K, value: ShiftSetting[K]) {
    setShiftSettings((current) => current.map((shift) => (shift.id === id ? { ...shift, [field]: value } : shift)));
  }

  function addShiftSetting() {
    const nextId = shiftSettings.reduce((max, shift) => Math.max(max, shift.id), 0) + 1;
    setShiftSettings((current) => [...current, { id: nextId, label: String(nextId), startTime: "10:00", endTime: "14:00", color: "slate" }]);
  }

  function deleteShiftSetting(id: number) {
    setShiftSettings((current) => current.filter((shift) => shift.id !== id));
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <section className="rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">{t("managerSettings.cafeSettingsTitle")}</h2>
              <p className="mt-2 text-lg font-bold text-slate-900">{t("managerSettings.cafeName")}</p>
              <p className="mt-1 text-sm text-slate-600">{t("managerSettings.timezone")}: Asia/Tokyo</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800">{t("managerSettings.demoBadge")}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">{t("managerSettings.demoSettingsText")}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t("managerSettings.periodTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("managerSettings.periodText")}</p>
          <label className="mt-3 block text-sm font-semibold text-slate-700" htmlFor="period-start-day">
            {t("managerSettings.periodStartLabel")}
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              id="period-start-day"
              type="number"
              min={1}
              max={28}
              value={periodStart}
              onChange={(event) => setPeriodStart(event.target.value)}
              className={`w-24 rounded-lg border px-3 py-2 text-sm outline-none ${
                isPeriodStartValid ? "border-slate-200 focus:border-emerald-500" : "border-rose-300 focus:border-rose-500"
              }`}
            />
            <span className="text-sm text-slate-600">{t("managerSettings.dayStartSuffix")}</span>
          </div>
          {!isPeriodStartValid ? <p className="mt-1.5 text-sm font-medium text-rose-700">{t("managerSettings.periodValidation")}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {periodPresets.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setPeriodStart(String(period))}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  periodStart === String(period)
                    ? "border-emerald-700 bg-emerald-800 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {period}{t("managerSettings.periodPresetSuffix")}
              </button>
            ))}
          </div>
          {isPeriodStartValid ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-slate-600">{formatPeriodExample(parsedPeriodStart, t)}</p>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">{t("managerSettings.periodMvpNote")}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">{t("manager.shiftSettings")}</h2>
            <button type="button" onClick={addShiftSetting} className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white">
              {t("manager.addShift")}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {shiftSettings.map((shift) => (
              <div key={shift.id} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-[54px_1fr_1fr_1.6fr_auto] sm:items-center">
                <input
                  value={shift.label}
                  onChange={(event) => updateShiftSetting(shift.id, "label", event.target.value)}
                  className={`h-9 rounded-lg border px-2 text-center text-sm font-bold ${shiftColorClass(shift.color)}`}
                  aria-label="shift label"
                />
                <input
                  type="time"
                  value={shift.startTime}
                  onChange={(event) => updateShiftSetting(shift.id, "startTime", event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                />
                <input
                  type="time"
                  value={shift.endTime}
                  onChange={(event) => updateShiftSetting(shift.id, "endTime", event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                />
                <div className="flex gap-1">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateShiftSetting(shift.id, "color", color)}
                      className={`h-8 flex-1 rounded-lg border text-[10px] font-bold ${shiftColorClass(color)} ${shift.color === color ? "ring-2 ring-emerald-700" : ""}`}
                    >
                      {t("manager.shiftColor")}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => deleteShiftSetting(shift.id)}
                  className="h-9 rounded-lg border border-rose-200 bg-white px-3 text-xs font-bold text-rose-700"
                >
                  {t("manager.deleteShift")}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div>
            <h2 className="font-semibold text-slate-900">{t("managerSettings.usersTitle")}</h2>
            <p className="mt-1 text-sm text-slate-600">{t("managerSettings.usersText")}</p>
          </div>
          <div className="mt-3 space-y-2">
            {managedUsers.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/70 p-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-[11px] font-bold text-white">
                  {user.initials}
                </span>
                <div className="min-w-32 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        user.role === "manager" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t(`managerSettings.roles.${user.role}`)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        user.lineLinked ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {user.lineLinked ? t("managerSettings.line.linked") : t("managerSettings.line.unlinked")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openRoleEditor(user)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
                >
                  {t("managerSettings.changeRole")}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t("managerSettings.lineIntegrationTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("managerSettings.lineIntegrationText")}</p>
        </section>

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          {t("managerSettings.demoNote")}
        </p>
      </div>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center">
          <section className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl" role="dialog" aria-modal="true" aria-label={t("managerSettings.roleModalTitle")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t("managerSettings.roleModalTitle")}</h2>
                <p className="mt-1 text-sm text-slate-600">{editingUser.name}</p>
              </div>
              <button type="button" onClick={closeRoleEditor} className="rounded-lg px-2 py-1 text-sm text-slate-500">
                {t("managerSettings.actions.close")}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["manager", "worker"] as Role[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setDraftRole(role)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                    draftRole === role
                      ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {t(`managerSettings.roles.${role}`)}
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-slate-600">
              <p>{t("managerSettings.roleModalDescriptionManager")}</p>
              <p className="mt-1">{t("managerSettings.roleModalDescriptionWorker")}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveRole}
                className="flex-1 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {t("managerSettings.actions.save")}
              </button>
              <button
                type="button"
                onClick={closeRoleEditor}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                {t("managerSettings.actions.close")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
