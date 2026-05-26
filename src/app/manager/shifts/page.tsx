"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";

type ShiftCode = "shift_1" | "shift_2" | "full_day" | "off" | "vacation" | "sick";

type Employee = {
  id: string;
  name: string;
  initials: string;
};

type Assignment = {
  employeeId: string;
  shift: ShiftCode;
  memo: string;
};

type CalendarDay = {
  key: string;
  day: number;
  weekday: string;
};

type ShiftRequest = {
  date: string;
  employeeId: string;
  shift: ShiftCode | "day_off_request";
  comment?: string;
};

const employees: Employee[] = [
  { id: "yamada", name: "山田 花子", initials: "YH" },
  { id: "sato", name: "佐藤 健", initials: "SK" },
  { id: "suzuki", name: "鈴木 愛", initials: "SA" },
  { id: "ito", name: "伊藤 翔", initials: "IS" },
  { id: "takahashi", name: "高橋 美咲", initials: "TM" },
  { id: "tanaka", name: "田中 優", initials: "TY" },
  { id: "nakamura", name: "中村 蓮", initials: "NR" },
  { id: "kobayashi", name: "小林 杏", initials: "KA" },
];

const shiftOptions: { code: ShiftCode; label: string; time: string }[] = [
  { code: "shift_1", label: "1シフト", time: "08:30–13:00" },
  { code: "shift_2", label: "2シフト", time: "13:00–17:30" },
  { code: "full_day", label: "通しシフト", time: "08:30–17:30" },
  { code: "off", label: "休み", time: "" },
  { code: "vacation", label: "休暇", time: "" },
  { code: "sick", label: "病欠", time: "" },
];

const shiftRequests: ShiftRequest[] = [
  { date: "2026-06-03", employeeId: "yamada", shift: "shift_1", comment: "午前のみ可能です" },
  { date: "2026-06-05", employeeId: "sato", shift: "day_off_request", comment: "予定があります" },
  { date: "2026-06-07", employeeId: "suzuki", shift: "shift_2" },
  { date: "2026-06-10", employeeId: "ito", shift: "full_day" },
  { date: "2026-06-12", employeeId: "takahashi", shift: "day_off_request" },
  { date: "2026-06-14", employeeId: "tanaka", shift: "shift_1" },
  { date: "2026-06-18", employeeId: "nakamura", shift: "shift_2" },
  { date: "2026-06-20", employeeId: "kobayashi", shift: "day_off_request" },
];

const weekdays = ["月", "火", "水", "木", "金", "土", "日"];
const days: CalendarDay[] = Array.from({ length: 28 }, (_, index) => ({
  key: `2026-06-${String(index + 1).padStart(2, "0")}`,
  day: index + 1,
  weekday: weekdays[index % weekdays.length],
}));
const mockToday = "2026-06-01";
const initialSelectedDate = "2026-06-01";
const sickDays = [5, 12, 19, 26];
const standardPattern: ShiftCode[] = ["shift_1", "shift_1", "shift_1", "shift_2", "shift_2", "full_day", "off", "vacation"];

function createInitialAssignments() {
  return days.reduce<Record<string, Assignment[]>>((result, day) => {
    result[day.key] = employees
      .slice(0, 6)
      .filter((employee) => !shiftRequests.some((request) => request.date === day.key && request.employeeId === employee.id))
      .map((employee, index) => {
        let shift = standardPattern[(index + day.day - 1) % standardPattern.length];
        if (sickDays.includes(day.day) && index === (day.day + 1) % employees.length) {
          shift = "sick";
        }
        return { employeeId: employee.id, shift, memo: "" };
      });
    return result;
  }, {});
}

function formatDate(day: CalendarDay) {
  return `2026年6月${day.day}日（${day.weekday}）`;
}

export default function ManagerShiftsPage() {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>(createInitialAssignments);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [draftShift, setDraftShift] = useState<ShiftCode>("shift_1");
  const [draftMemo, setDraftMemo] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployeeId, setNewEmployeeId] = useState<string | null>(null);
  const [newShift, setNewShift] = useState<ShiftCode | null>(null);
  const [newMemo, setNewMemo] = useState("");

  const selectedDay = days.find((day) => day.key === selectedDate) ?? days[0];
  const selectedAssignments = assignments[selectedDate] ?? [];
  const selectedRequests = shiftRequests.filter((request) => request.date === selectedDate);
  const editingEmployee = employees.find((employee) => employee.id === editingEmployeeId);
  const availableEmployees = employees.filter(
    (employee) => !selectedAssignments.some((assignment) => assignment.employeeId === employee.id),
  );

  function openEditor(assignment: Assignment) {
    setEditingEmployeeId(assignment.employeeId);
    setDraftShift(assignment.shift);
    setDraftMemo(assignment.memo);
  }

  function closeEditor() {
    setEditingEmployeeId(null);
  }

  function saveAssignment() {
    if (!editingEmployeeId) {
      return;
    }

    setAssignments((current) => ({
      ...current,
      [selectedDate]: current[selectedDate].map((assignment) =>
        assignment.employeeId === editingEmployeeId
          ? { ...assignment, shift: draftShift, memo: draftMemo }
          : assignment,
      ),
    }));
    closeEditor();
  }

  function openAddEditor() {
    setNewEmployeeId(null);
    setNewShift(null);
    setNewMemo("");
    setIsAdding(true);
  }

  function closeAddEditor() {
    setIsAdding(false);
  }

  function saveNewAssignment() {
    if (!newEmployeeId || !newShift) {
      return;
    }

    setAssignments((current) => {
      const currentDay = current[selectedDate] ?? [];
      if (currentDay.some((assignment) => assignment.employeeId === newEmployeeId)) {
        return current;
      }
      return {
        ...current,
        [selectedDate]: [...currentDay, { employeeId: newEmployeeId, shift: newShift, memo: newMemo }],
      };
    });
    closeAddEditor();
  }

  function addRequestToShift(request: ShiftRequest) {
    if (request.shift === "day_off_request") {
      return;
    }
    const requestedShift: ShiftCode = request.shift;

    setAssignments((current) => {
      const currentDay = current[selectedDate] ?? [];
      if (currentDay.some((assignment) => assignment.employeeId === request.employeeId)) {
        return current;
      }
      return {
        ...current,
        [selectedDate]: [...currentDay, { employeeId: request.employeeId, shift: requestedShift, memo: request.comment ?? "" }],
      };
    });
  }

  return (
    <AppShell variant="wide">
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700">シフト管理</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">シフト編集</h1>
              <p className="mt-1 text-sm text-slate-600">月ごとのシフトを確認しながら、日別にスタッフの勤務を調整できます</p>
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
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">編集中</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">スタッフの希望を確認しながら、最終シフトを作成します。</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">2週間シフト</h2>
              <p className="text-xs text-slate-500">横にスライドして次の2週間を確認</p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">28日分</span>
          </div>

          <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {[days.slice(0, 14), days.slice(14)].map((period, periodIndex) => (
              <div key={periodIndex} className="grid min-w-full snap-start grid-cols-7 gap-1.5 sm:gap-2">
                {period.map((day) => {
                  const dailyAssignments = assignments[day.key];
                  const firstCount = dailyAssignments.filter((item) => item.shift === "shift_1").length;
                  const secondCount = dailyAssignments.filter((item) => item.shift === "shift_2").length;
                  const fullCount = dailyAssignments.filter((item) => item.shift === "full_day").length;
                  const hasSick = dailyAssignments.some((item) => item.shift === "sick");
                  const isSelected = selectedDate === day.key;
                  const isToday = mockToday === day.key;

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDate(day.key)}
                      className={`min-h-28 rounded-xl border p-1.5 text-left transition sm:p-2 ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 shadow-sm"
                          : isToday
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-100 bg-slate-50 hover:border-amber-200"
                      }`}
                    >
                      <span className="block text-[10px] text-slate-500">{day.weekday}</span>
                      <span className="block text-sm font-bold text-slate-900">{day.day}</span>
                      {isToday ? <span className="block text-[10px] font-semibold text-emerald-700">今日</span> : null}
                      <span className="mt-1 block text-[10px] leading-4 text-slate-600">① {firstCount}名</span>
                      <span className="block text-[10px] leading-4 text-slate-600">② {secondCount}名</span>
                      <span className="block text-[10px] leading-4 text-slate-600">通 {fullCount}名</span>
                      {hasSick ? <span className="mt-1 inline-block rounded bg-rose-100 px-1 text-[10px] text-rose-700">病欠</span> : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.9fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">選択した日のシフト</h2>
                <p className="mt-1 text-sm text-slate-500">{formatDate(selectedDay)}</p>
              </div>
              <button
                type="button"
                onClick={openAddEditor}
                disabled={availableEmployees.length === 0}
                className="rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                スタッフを追加
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {shiftOptions.map((shift) => {
                const assigned = selectedAssignments.filter((assignment) => assignment.shift === shift.code);

                return (
                  <div key={shift.code} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">
                        {shift.label} {shift.time}
                      </p>
                      <span className="text-xs text-slate-500">{assigned.length}名</span>
                    </div>
                    {assigned.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-400">割り当てなし</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {assigned.map((assignment) => {
                          const employee = employees.find((item) => item.id === assignment.employeeId);
                          if (!employee) {
                            return null;
                          }
                          return (
                            <div key={assignment.employeeId} className="flex items-center gap-2 rounded-lg bg-white p-2">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-xs font-bold text-white">
                                {employee.initials}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">{employee.name}</p>
                                <p className="text-xs text-slate-500">
                                  {shift.label} {shift.time}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => openEditor(assignment)}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                              >
                                編集
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-100 bg-amber-50 p-3 shadow-sm sm:p-4">
            <h2 className="font-semibold text-slate-900">この日の希望</h2>
            <p className="mt-1 text-sm text-slate-600">スタッフの希望を確認しながらシフトを調整できます</p>

            {selectedRequests.length === 0 ? (
              <p className="mt-4 rounded-xl bg-white/80 px-3 py-4 text-sm text-slate-500">この日の希望はありません</p>
            ) : (
              <div className="mt-3 space-y-2">
                {selectedRequests.map((request) => {
                  const employee = employees.find((item) => item.id === request.employeeId);
                  const isAssigned = selectedAssignments.some((assignment) => assignment.employeeId === request.employeeId);
                  const isDayOffRequest = request.shift === "day_off_request";
                  const requestedShift = isDayOffRequest
                    ? "休み希望"
                    : shiftOptions.find((shift) => shift.code === request.shift)?.label ?? "";

                  if (!employee) {
                    return null;
                  }

                  return (
                    <article key={`${request.date}-${request.employeeId}`} className="rounded-xl border border-amber-100 bg-white p-3">
                      <div className="flex items-start gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-[10px] font-bold text-white">
                          {employee.initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <p className="text-sm font-semibold text-slate-900">{employee.name}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                isAssigned
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isDayOffRequest
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isAssigned ? "登録済み" : isDayOffRequest ? "休み希望" : "希望"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-emerald-800">{requestedShift}</p>
                          {request.comment ? <p className="mt-1 text-xs text-slate-500">メモ: {request.comment}</p> : null}
                        </div>
                      </div>
                      {!isAssigned && !isDayOffRequest ? (
                        <button
                          type="button"
                          onClick={() => addRequestToShift(request)}
                          className="mt-3 w-full rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white"
                        >
                          シフトに追加
                        </button>
                      ) : isDayOffRequest && !isAssigned ? (
                        <p className="mt-2 text-sm text-slate-500">休み希望です</p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </p>
      </div>

      {editingEmployee ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center">
          <section className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl" role="dialog" aria-modal="true" aria-label="シフトを編集">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">シフトを編集</h2>
                <p className="mt-1 text-sm text-slate-600">{editingEmployee.name}</p>
                <p className="text-xs text-slate-500">{formatDate(selectedDay)}</p>
              </div>
              <button type="button" onClick={closeEditor} className="rounded-lg px-2 py-1 text-sm text-slate-500">
                閉じる
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {shiftOptions.map((shift) => (
                <button
                  key={shift.code}
                  type="button"
                  onClick={() => setDraftShift(shift.code)}
                  className={`rounded-xl border p-2 text-left text-sm transition ${
                    draftShift === shift.code
                      ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="block font-semibold">{shift.label}</span>
                  {shift.time ? <span className="block text-xs text-slate-500">{shift.time}</span> : null}
                </button>
              ))}
            </div>

            <label className="mt-4 block text-sm font-semibold text-slate-800" htmlFor="shift-memo">
              メモ
            </label>
            <textarea
              id="shift-memo"
              value={draftMemo}
              onChange={(event) => setDraftMemo(event.target.value)}
              placeholder="メモがあれば入力してください"
              className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveAssignment}
                className="flex-1 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white"
              >
                保存する
              </button>
              <button
                type="button"
                onClick={closeEditor}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                閉じる
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isAdding ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center">
          <section className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl" role="dialog" aria-modal="true" aria-label="スタッフを追加">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">スタッフを追加</h2>
                <p className="mt-1 text-xs text-slate-500">{formatDate(selectedDay)}</p>
              </div>
              <button type="button" onClick={closeAddEditor} className="rounded-lg px-2 py-1 text-sm text-slate-500">
                閉じる
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-800">スタッフ</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {availableEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => setNewEmployeeId(employee.id)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left text-sm transition ${
                      newEmployeeId === employee.id
                        ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-[10px] font-bold text-white">
                      {employee.initials}
                    </span>
                    <span className="truncate font-semibold">{employee.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-800">シフト</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {shiftOptions.map((shift) => (
                  <button
                    key={shift.code}
                    type="button"
                    onClick={() => setNewShift(shift.code)}
                    className={`rounded-xl border p-2 text-left text-sm transition ${
                      newShift === shift.code
                        ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="block font-semibold">{shift.label}</span>
                    {shift.time ? <span className="block text-xs text-slate-500">{shift.time}</span> : null}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-4 block text-sm font-semibold text-slate-800" htmlFor="new-shift-memo">
              メモ
            </label>
            <textarea
              id="new-shift-memo"
              value={newMemo}
              onChange={(event) => setNewMemo(event.target.value)}
              placeholder="メモがあれば入力してください"
              className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveNewAssignment}
                disabled={!newEmployeeId || !newShift}
                className="flex-1 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                保存する
              </button>
              <button
                type="button"
                onClick={closeAddEditor}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
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
