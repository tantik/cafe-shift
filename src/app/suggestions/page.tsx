"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";

type Category = "新レシピ" | "業務改善" | "困りごと" | "その他";
type Priority = "通常" | "できれば早め" | "重要";
type SuggestionStatus = "未確認" | "確認済み" | "採用" | "保留";

type Suggestion = {
  id: string;
  category: Category;
  title: string;
  content: string;
  priority: Priority;
  status: SuggestionStatus;
};

const categories: Category[] = ["新レシピ", "業務改善", "困りごと", "その他"];
const priorities: Priority[] = ["通常", "できれば早め", "重要"];

const initialSuggestions: Suggestion[] = [
  {
    id: "suggestion-1",
    category: "新レシピ",
    title: "抹茶ゆずラテの提案",
    content: "夏向けにさっぱりした抹茶ドリンクを出せると良さそうです。",
    priority: "通常",
    status: "未確認",
  },
];

export default function SuggestionsPage() {
  const [category, setCategory] = useState<Category>("新レシピ");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Priority>("通常");
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [nextSuggestionNumber, setNextSuggestionNumber] = useState(2);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit() {
    setError("");
    setSuccess("");

    if (!category || !title.trim() || !content.trim()) {
      setError("カテゴリ、タイトル、内容を入力してください");
      return;
    }

    setSuggestions((current) => [
      {
        id: `suggestion-${nextSuggestionNumber}`,
        category,
        title: title.trim(),
        content: content.trim(),
        priority,
        status: "未確認",
      },
      ...current,
    ]);
    setNextSuggestionNumber((current) => current + 1);
    setSuccess("提案を送信しました（デモ）");
    setTitle("");
    setContent("");
    setPriority("通常");
  }

  return (
    <AppShell>
      <div className="space-y-4 pb-4">
        <header className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700">提案・改善</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">提案・改善</h1>
          <p className="mt-1 text-sm text-slate-600">新しいレシピや業務改善のアイデアを送れます</p>
          <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm">
            山田 花子
          </span>
        </header>

        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-slate-700 shadow-sm">
          気づいたことや改善アイデアを店長に共有できます。
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-800">カテゴリ</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    category === item ? "border-emerald-700 bg-emerald-800 text-white" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-semibold text-slate-800">
            タイトル
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例）新しい抹茶ドリンクの提案"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            内容
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="具体的な内容を書いてください"
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
          <div>
            <p className="text-sm font-semibold text-slate-800">優先度</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {priorities.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPriority(item)}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold ${
                    priority === item ? "border-amber-600 bg-amber-100 text-amber-900" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm"
          >
            提案を送信する
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">送信した提案</h2>
          <div className="mt-3 space-y-2">
            {suggestions.map((suggestion) => (
              <article key={suggestion.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                    {suggestion.category}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                    {suggestion.priority}
                  </span>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                    {suggestion.status}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-slate-900">{suggestion.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{suggestion.content}</p>
              </article>
            ))}
          </div>
        </section>

        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際の保存は後でSupabaseに接続します。
        </p>
      </div>
    </AppShell>
  );
}
