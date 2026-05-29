"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import LanguageSwitcher from "@/components/language-switcher";

type Role = "manager" | "worker";

type User = {
  id: number;
  name: string;
  initials: string;
  role: Role;
  lineLinked: boolean;
};

const users: User[] = [
  { id: 1, name: "店長 田中", initials: "TY", role: "manager", lineLinked: true },
  { id: 2, name: "山田 花子", initials: "YH", role: "worker", lineLinked: true },
  { id: 3, name: "佐藤 健", initials: "SK", role: "worker", lineLinked: true },
  { id: 4, name: "鈴木 愛", initials: "SA", role: "worker", lineLinked: false },
];

const periodPresets = [1, 10, 16, 21];

function formatPeriodExample(day: number) {
  const endDay = day === 1 ? "5月31日" : `6月${day - 1}日`;
  return `例: ${day}日開始の場合、5月${day}日〜${endDay}で集計します。`;
}

export default function ManagerSettingsPage() {
  const [periodStart, setPeriodStart] = useState("16");
  const [managedUsers, setManagedUsers] = useState<User[]>(users);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [draftRole, setDraftRole] = useState<Role>("worker");

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

  return (
    <AppShell variant="wide">
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700">管理設定</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">設定</h1>
              <p className="mt-1 text-sm text-slate-600">カフェの基本設定とユーザー権限を管理できます</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white sm:self-auto">
              店長 田中
            </span>
          </div>
        </header>

        <section className="rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">カフェ設定</h2>
              <p className="mt-2 text-lg font-bold text-slate-900">Cafe Shift Demo</p>
              <p className="mt-1 text-sm text-slate-600">タイムゾーン: Asia/Tokyo</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800">デモ</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">MVPではデモ設定として表示しています。</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="font-semibold text-slate-900">集計開始日</h2>
          <p className="mt-1 text-sm text-slate-600">勤務時間集計の開始日を1〜28日の範囲で設定できます。</p>
          <label className="mt-3 block text-sm font-semibold text-slate-700" htmlFor="period-start-day">
            集計開始日
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
            <span className="text-sm text-slate-600">日開始</span>
          </div>
          {!isPeriodStartValid ? <p className="mt-1.5 text-sm font-medium text-rose-700">1〜28の数字を入力してください</p> : null}
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
                {period}日
              </button>
            ))}
          </div>
          {isPeriodStartValid ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-slate-600">{formatPeriodExample(parsedPeriodStart)}</p>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">2月にも対応しやすいよう、MVPでは1〜28日を対象にします。</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div>
            <h2 className="font-semibold text-slate-900">ユーザーと権限</h2>
            <p className="mt-1 text-sm text-slate-600">MVPでは manager / worker の2種類だけを使用します。</p>
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
                      {user.role}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        user.lineLinked ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {user.lineLinked ? "LINE連携済み" : "LINE未連携"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openRoleEditor(user)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
                >
                  権限を変更
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="font-semibold text-slate-900">個人設定</h2>
          <p className="mt-2 text-sm font-semibold text-slate-800">表示言語</p>
          <p className="mt-1 text-sm text-slate-600">自分の画面で使う言語を選択できます。</p>
          <div className="mt-2">
            <LanguageSwitcher />
          </div>
          <p className="mt-3 text-sm text-slate-500">MVPでは日本語UIを標準にし、多言語表示は後で拡張します。</p>
        </section>

        <section className="rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm">
          <h2 className="font-semibold text-slate-900">LINE連携</h2>
          <p className="mt-1 text-sm text-slate-600">
            本番ではLIFFを使ってLINE User IDを取得し、ユーザーとスタッフを紐づけます。デモでは未連携でも操作できます。
          </p>
        </section>

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </p>
      </div>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center">
          <section className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl" role="dialog" aria-modal="true" aria-label="権限を変更">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">権限を変更</h2>
                <p className="mt-1 text-sm text-slate-600">{editingUser.name}</p>
              </div>
              <button type="button" onClick={closeRoleEditor} className="rounded-lg px-2 py-1 text-sm text-slate-500">
                閉じる
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
                  {role}
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-slate-600">
              <p>manager は管理画面を利用できます。</p>
              <p className="mt-1">worker はスタッフ画面のみ利用します。</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveRole}
                className="flex-1 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white"
              >
                保存する
              </button>
              <button
                type="button"
                onClick={closeRoleEditor}
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
