"use client";

import { useState } from "react";

export default function ManagerLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/manager-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("パスワードが正しくありません");
      return;
    }

    window.location.href = "/manager";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f1e6] px-4 py-8 text-slate-900">
      <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-bold text-emerald-700">Mame To Cha Tokyo</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">管理者ログイン</h1>
        </div>

        <form onSubmit={submitLogin} className="space-y-3">
          <label className="block">
            <span className="sr-only">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="パスワード"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base outline-none focus:border-emerald-700"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || password.trim() === ""}
            className="h-11 w-full rounded-xl bg-emerald-800 text-sm font-bold text-white shadow-sm disabled:cursor-default disabled:opacity-50"
          >
            ログイン
          </button>
        </form>
      </section>
    </main>
  );
}
