"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";

const shiftColorOptions = [
  { id: "blue", label: "Blue", swatchClass: "bg-blue-300", badgeClass: "border-blue-200 bg-blue-50 text-blue-800" },
  { id: "salmon", label: "Salmon", swatchClass: "bg-orange-300", badgeClass: "border-orange-200 bg-orange-50 text-orange-800" },
  { id: "yellow", label: "Yellow", swatchClass: "bg-yellow-300", badgeClass: "border-yellow-200 bg-yellow-50 text-yellow-800" },
  { id: "emerald", label: "Green", swatchClass: "bg-emerald-300", badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  { id: "violet", label: "Violet", swatchClass: "bg-violet-300", badgeClass: "border-violet-200 bg-violet-50 text-violet-800" },
  { id: "sky", label: "Sky", swatchClass: "bg-sky-300", badgeClass: "border-sky-200 bg-sky-50 text-sky-800" },
  { id: "teal", label: "Teal", swatchClass: "bg-teal-300", badgeClass: "border-teal-200 bg-teal-50 text-teal-800" },
  { id: "rose", label: "Rose", swatchClass: "bg-rose-300", badgeClass: "border-rose-200 bg-rose-50 text-rose-800" },
  { id: "amber", label: "Amber", swatchClass: "bg-amber-300", badgeClass: "border-amber-200 bg-amber-50 text-amber-800" },
  { id: "indigo", label: "Indigo", swatchClass: "bg-indigo-300", badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-800" },
  { id: "lime", label: "Lime", swatchClass: "bg-lime-300", badgeClass: "border-lime-200 bg-lime-50 text-lime-800" },
  { id: "pink", label: "Pink", swatchClass: "bg-pink-300", badgeClass: "border-pink-200 bg-pink-50 text-pink-800" },
  { id: "cyan", label: "Cyan", swatchClass: "bg-cyan-300", badgeClass: "border-cyan-200 bg-cyan-50 text-cyan-800" },
  { id: "fuchsia", label: "Fuchsia", swatchClass: "bg-fuchsia-300", badgeClass: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800" },
  { id: "stone", label: "Stone", swatchClass: "bg-stone-300", badgeClass: "border-stone-200 bg-stone-50 text-stone-800" },
  { id: "purple", label: "Purple", swatchClass: "bg-purple-300", badgeClass: "border-purple-200 bg-purple-50 text-purple-800" },
  { id: "orange", label: "Orange", swatchClass: "bg-orange-400", badgeClass: "border-orange-300 bg-orange-100 text-orange-900" },
  { id: "red", label: "Red", swatchClass: "bg-red-300", badgeClass: "border-red-200 bg-red-50 text-red-800" },
  { id: "zinc", label: "Zinc", swatchClass: "bg-zinc-300", badgeClass: "border-zinc-200 bg-zinc-50 text-zinc-800" },
  { id: "slate", label: "Slate", swatchClass: "bg-slate-300", badgeClass: "border-slate-200 bg-slate-50 text-slate-800" },
  { id: "blue_soft", label: "Blue soft", swatchClass: "bg-blue-200", badgeClass: "border-blue-100 bg-blue-50 text-blue-700" },
  { id: "blue_deep", label: "Blue deep", swatchClass: "bg-blue-400", badgeClass: "border-blue-300 bg-blue-100 text-blue-900" },
  { id: "sky_soft", label: "Sky soft", swatchClass: "bg-sky-200", badgeClass: "border-sky-100 bg-sky-50 text-sky-700" },
  { id: "sky_deep", label: "Sky deep", swatchClass: "bg-sky-400", badgeClass: "border-sky-300 bg-sky-100 text-sky-900" },
  { id: "cyan_soft", label: "Cyan soft", swatchClass: "bg-cyan-200", badgeClass: "border-cyan-100 bg-cyan-50 text-cyan-700" },
  { id: "cyan_deep", label: "Cyan deep", swatchClass: "bg-cyan-400", badgeClass: "border-cyan-300 bg-cyan-100 text-cyan-900" },
  { id: "teal_soft", label: "Teal soft", swatchClass: "bg-teal-200", badgeClass: "border-teal-100 bg-teal-50 text-teal-700" },
  { id: "teal_deep", label: "Teal deep", swatchClass: "bg-teal-400", badgeClass: "border-teal-300 bg-teal-100 text-teal-900" },
  { id: "emerald_soft", label: "Green soft", swatchClass: "bg-emerald-200", badgeClass: "border-emerald-100 bg-emerald-50 text-emerald-700" },
  { id: "emerald_deep", label: "Green deep", swatchClass: "bg-emerald-400", badgeClass: "border-emerald-300 bg-emerald-100 text-emerald-900" },
  { id: "green", label: "Leaf", swatchClass: "bg-green-300", badgeClass: "border-green-200 bg-green-50 text-green-800" },
  { id: "green_deep", label: "Leaf deep", swatchClass: "bg-green-400", badgeClass: "border-green-300 bg-green-100 text-green-900" },
  { id: "lime_soft", label: "Lime soft", swatchClass: "bg-lime-200", badgeClass: "border-lime-100 bg-lime-50 text-lime-700" },
  { id: "lime_deep", label: "Lime deep", swatchClass: "bg-lime-400", badgeClass: "border-lime-300 bg-lime-100 text-lime-900" },
  { id: "yellow_soft", label: "Yellow soft", swatchClass: "bg-yellow-200", badgeClass: "border-yellow-100 bg-yellow-50 text-yellow-700" },
  { id: "yellow_deep", label: "Yellow deep", swatchClass: "bg-yellow-400", badgeClass: "border-yellow-300 bg-yellow-100 text-yellow-900" },
  { id: "amber_soft", label: "Amber soft", swatchClass: "bg-amber-200", badgeClass: "border-amber-100 bg-amber-50 text-amber-700" },
  { id: "amber_deep", label: "Amber deep", swatchClass: "bg-amber-400", badgeClass: "border-amber-300 bg-amber-100 text-amber-900" },
  { id: "orange_soft", label: "Orange soft", swatchClass: "bg-orange-200", badgeClass: "border-orange-100 bg-orange-50 text-orange-700" },
  { id: "orange_deep", label: "Orange deep", swatchClass: "bg-orange-500", badgeClass: "border-orange-300 bg-orange-100 text-orange-900" },
  { id: "red_soft", label: "Red soft", swatchClass: "bg-red-200", badgeClass: "border-red-100 bg-red-50 text-red-700" },
  { id: "red_deep", label: "Red deep", swatchClass: "bg-red-400", badgeClass: "border-red-300 bg-red-100 text-red-900" },
  { id: "rose_soft", label: "Rose soft", swatchClass: "bg-rose-200", badgeClass: "border-rose-100 bg-rose-50 text-rose-700" },
  { id: "rose_deep", label: "Rose deep", swatchClass: "bg-rose-400", badgeClass: "border-rose-300 bg-rose-100 text-rose-900" },
  { id: "pink_soft", label: "Pink soft", swatchClass: "bg-pink-200", badgeClass: "border-pink-100 bg-pink-50 text-pink-700" },
  { id: "pink_deep", label: "Pink deep", swatchClass: "bg-pink-400", badgeClass: "border-pink-300 bg-pink-100 text-pink-900" },
  { id: "fuchsia_soft", label: "Fuchsia soft", swatchClass: "bg-fuchsia-200", badgeClass: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700" },
  { id: "fuchsia_deep", label: "Fuchsia deep", swatchClass: "bg-fuchsia-400", badgeClass: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-900" },
  { id: "purple_soft", label: "Purple soft", swatchClass: "bg-purple-200", badgeClass: "border-purple-100 bg-purple-50 text-purple-700" },
  { id: "purple_deep", label: "Purple deep", swatchClass: "bg-purple-400", badgeClass: "border-purple-300 bg-purple-100 text-purple-900" },
  { id: "violet_soft", label: "Violet soft", swatchClass: "bg-violet-200", badgeClass: "border-violet-100 bg-violet-50 text-violet-700" },
  { id: "violet_deep", label: "Violet deep", swatchClass: "bg-violet-400", badgeClass: "border-violet-300 bg-violet-100 text-violet-900" },
  { id: "indigo_soft", label: "Indigo soft", swatchClass: "bg-indigo-200", badgeClass: "border-indigo-100 bg-indigo-50 text-indigo-700" },
  { id: "indigo_deep", label: "Indigo deep", swatchClass: "bg-indigo-400", badgeClass: "border-indigo-300 bg-indigo-100 text-indigo-900" },
  { id: "slate_soft", label: "Slate soft", swatchClass: "bg-slate-200", badgeClass: "border-slate-100 bg-slate-50 text-slate-700" },
  { id: "slate_deep", label: "Slate deep", swatchClass: "bg-slate-400", badgeClass: "border-slate-300 bg-slate-100 text-slate-900" },
  { id: "zinc_soft", label: "Zinc soft", swatchClass: "bg-zinc-200", badgeClass: "border-zinc-100 bg-zinc-50 text-zinc-700" },
  { id: "zinc_deep", label: "Zinc deep", swatchClass: "bg-zinc-400", badgeClass: "border-zinc-300 bg-zinc-100 text-zinc-900" },
  { id: "stone_soft", label: "Stone soft", swatchClass: "bg-stone-200", badgeClass: "border-stone-100 bg-stone-50 text-stone-700" },
  { id: "stone_deep", label: "Stone deep", swatchClass: "bg-stone-400", badgeClass: "border-stone-300 bg-stone-100 text-stone-900" },
] as const;

type ShiftColor = (typeof shiftColorOptions)[number]["id"];

type ShiftSetting = {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  color: ShiftColor;
};

const periodPresets = [1, 10, 16, 21];

const initialShiftSettings: ShiftSetting[] = [
  { id: 1, label: "1", startTime: "08:30", endTime: "13:00", color: "blue" },
  { id: 2, label: "2", startTime: "13:00", endTime: "17:30", color: "salmon" },
  { id: 3, label: "3", startTime: "08:30", endTime: "10:00", color: "yellow" },
  { id: 4, label: "通", startTime: "08:30", endTime: "17:30", color: "emerald" },
];

const colorPresets: ShiftColor[] = shiftColorOptions.map((option) => option.id);
const shiftColorStyles = Object.fromEntries(shiftColorOptions.map((option) => [option.id, option.badgeClass])) as Record<ShiftColor, string>;

function shiftColorClass(color: ShiftColor) {
  return shiftColorStyles[color];
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
  const [shiftSettings, setShiftSettings] = useState<ShiftSetting[]>(initialShiftSettings);
  const [colorPickerShiftId, setColorPickerShiftId] = useState<number | null>(null);

  const parsedPeriodStart = Number(periodStart);
  const isPeriodStartValid =
    periodStart.trim() !== "" &&
    Number.isInteger(parsedPeriodStart) &&
    parsedPeriodStart >= 1 &&
    parsedPeriodStart <= 28;

  function updateShiftSetting<K extends keyof ShiftSetting>(id: number, field: K, value: ShiftSetting[K]) {
    setShiftSettings((current) => current.map((shift) => (shift.id === id ? { ...shift, [field]: value } : shift)));
  }

  function addShiftSetting() {
    const nextId = shiftSettings.reduce((max, shift) => Math.max(max, shift.id), 0) + 1;
    const usedColors = new Set(shiftSettings.map((shift) => shift.color));
    const color = colorPresets.find((preset) => !usedColors.has(preset)) ?? colorPresets[(nextId - 1) % colorPresets.length];
    setShiftSettings((current) => [...current, { id: nextId, label: String(nextId), startTime: "10:00", endTime: "14:00", color }]);
  }

  function deleteShiftSetting(id: number) {
    setShiftSettings((current) => current.filter((shift) => shift.id !== id));
    setColorPickerShiftId((current) => (current === id ? null : current));
  }

  const colorPickerShift = colorPickerShiftId === null ? null : shiftSettings.find((shift) => shift.id === colorPickerShiftId) ?? null;

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
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

        <section className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:p-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">{t("manager.shiftSettings")}</h2>
            <button type="button" onClick={addShiftSetting} className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white">
              {t("manager.addShift")}
            </button>
          </div>
          <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
            {shiftSettings.map((shift) => (
              <div key={shift.id} className="grid grid-cols-[46px_1fr_1fr] gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1.5 sm:grid-cols-[54px_1fr_1fr_96px_auto] sm:items-center sm:gap-2 sm:p-2">
                <input
                  value={shift.label}
                  onChange={(event) => updateShiftSetting(shift.id, "label", event.target.value)}
                  className={`h-8 rounded-lg border px-1.5 text-center text-sm font-bold sm:h-9 sm:px-2 ${shiftColorClass(shift.color)}`}
                  aria-label="shift label"
                />
                <input
                  type="time"
                  value={shift.startTime}
                  onChange={(event) => updateShiftSetting(shift.id, "startTime", event.target.value)}
                  className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-1.5 text-xs sm:h-9 sm:px-2 sm:text-sm"
                />
                <input
                  type="time"
                  value={shift.endTime}
                  onChange={(event) => updateShiftSetting(shift.id, "endTime", event.target.value)}
                  className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-1.5 text-xs sm:h-9 sm:px-2 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setColorPickerShiftId(shift.id)}
                  className={`col-span-2 flex h-8 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold sm:col-span-1 sm:h-9 ${shiftColorClass(shift.color)}`}
                >
                  <span className={`h-3 w-3 rounded-full ${shiftColorOptions.find((option) => option.id === shift.color)?.swatchClass ?? "bg-slate-300"}`} />
                  {t("manager.color")}
                </button>
                <button
                  type="button"
                  onClick={() => deleteShiftSetting(shift.id)}
                  className="h-8 rounded-lg border border-rose-200 bg-white px-2 text-xs font-bold text-rose-700 sm:h-9 sm:px-3"
                >
                  {t("manager.deleteShift")}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
      {colorPickerShift ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center">
          <section className="max-h-[82vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-950">{t("manager.color")}</h2>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-500">
                  {colorPickerShift.label} / {colorPickerShift.startTime} - {colorPickerShift.endTime}
                </p>
              </div>
              <button type="button" onClick={() => setColorPickerShiftId(null)} className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500">
                {t("manager.cancel")}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-10">
              {shiftColorOptions.map((option) => {
                const isSelected = option.id === colorPickerShift.color;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      updateShiftSetting(colorPickerShift.id, "color", option.id);
                      setColorPickerShiftId(null);
                    }}
                    className={`flex h-10 w-full items-center justify-center rounded-xl border bg-white transition ${
                      isSelected ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2" : "border-slate-200 hover:border-slate-400"
                    }`}
                    aria-label={option.label}
                  >
                    <span className={`h-6 w-6 rounded-full ${option.swatchClass}`} />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
