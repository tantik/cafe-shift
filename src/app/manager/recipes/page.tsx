"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";

type RecipeFilter = "all" | "active" | "draft";

type Recipe = {
  id: number;
  title: string;
  category: string;
  description: string;
  photoMemo: string;
  ingredients: string;
  steps: string;
  notes: string;
  active: boolean;
};

type RecipeDraft = Omit<Recipe, "id">;

const initialRecipes: Recipe[] = [
  {
    id: 1,
    title: "抹茶ラテ",
    category: "ラテ",
    description: "定番の抹茶ラテ",
    photoMemo: "抹茶の色が見える正面写真",
    ingredients: "牛乳160g\n抹茶液30g\nシロップ10g",
    steps: "氷を入れます\n牛乳とシロップを注ぎます\n抹茶液を重ねます",
    notes: "提供前によく混ぜる案内をします",
    active: true,
  },
  {
    id: 2,
    title: "ほうじ茶ラテ",
    category: "ラテ",
    description: "香ばしい茶葉のミルクラテ",
    photoMemo: "ラテアートが見える写真",
    ingredients: "牛乳160g\nほうじ茶液30g\nシロップ10g",
    steps: "材料を計量します\n氷と牛乳を入れます\nほうじ茶液を注ぎます",
    notes: "",
    active: true,
  },
  {
    id: 3,
    title: "煎茶",
    category: "日本茶",
    description: "すっきりした定番の温かい煎茶",
    photoMemo: "急須と湯呑みの写真",
    ingredients: "煎茶葉5g\n湯180ml",
    steps: "湯温を整えます\n茶葉を蒸らします\n均等に注ぎます",
    notes: "",
    active: true,
  },
  {
    id: 4,
    title: "玄米茶",
    category: "日本茶",
    description: "香ばしさを楽しむ温かいお茶",
    photoMemo: "玄米茶の湯気が見える写真",
    ingredients: "玄米茶葉5g\n湯180ml",
    steps: "茶葉を入れます\n熱湯を注ぎます\n短時間で抽出します",
    notes: "",
    active: true,
  },
  {
    id: 5,
    title: "和紅茶",
    category: "紅茶",
    description: "やわらかな香りの国産紅茶",
    photoMemo: "",
    ingredients: "和紅茶葉4g\n湯200ml",
    steps: "抽出時間を確認します\n温めたカップへ注ぎます",
    notes: "写真撮影後に公開予定",
    active: false,
  },
  {
    id: 6,
    title: "季節のアイスティー",
    category: "季節",
    description: "夏向けの爽やかな限定ドリンク",
    photoMemo: "",
    ingredients: "紅茶液120g\n季節のシロップ15g\n氷",
    steps: "グラスに氷を入れます\n材料を注ぎます\n飾りを添えます",
    notes: "提供時期を確認",
    active: false,
  },
];

const emptyDraft: RecipeDraft = {
  title: "",
  category: "",
  description: "",
  photoMemo: "",
  ingredients: "",
  steps: "",
  notes: "",
  active: true,
};

const filters: { id: RecipeFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "active", label: "公開中" },
  { id: "draft", label: "下書き" },
];

function statusLabel(active: boolean) {
  return active ? "公開中" : "下書き";
}

export default function ManagerRecipesPage() {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<RecipeFilter>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft);

  const visibleRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "active" && recipe.active) ||
        (selectedFilter === "draft" && !recipe.active);
      const matchesQuery = recipe.title.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [query, recipes, selectedFilter]);

  const publishedCount = recipes.filter((recipe) => recipe.active).length;
  const categoryCount = new Set(recipes.map((recipe) => recipe.category)).size;

  function openAddEditor() {
    setEditingId(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  }

  function openEditEditor(recipe: Recipe) {
    const { id, ...recipeDraft } = recipe;
    setEditingId(id);
    setDraft(recipeDraft);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
  }

  function updateDraft<K extends keyof RecipeDraft>(field: K, value: RecipeDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function saveRecipe() {
    if (!draft.title.trim() || !draft.category.trim()) {
      return;
    }

    if (editingId === null) {
      const nextId = recipes.reduce((largest, recipe) => Math.max(largest, recipe.id), 0) + 1;
      setRecipes((current) => [...current, { id: nextId, ...draft }]);
    } else {
      setRecipes((current) =>
        current.map((recipe) => (recipe.id === editingId ? { id: editingId, ...draft } : recipe)),
      );
    }
    setEditorOpen(false);
  }

  function toggleStatus(id: number) {
    setRecipes((current) =>
      current.map((recipe) => (recipe.id === id ? { ...recipe, active: !recipe.active } : recipe)),
    );
  }

  return (
    <AppShell variant="wide">
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <header className="rounded-2xl border border-emerald-100/70 bg-emerald-950/5 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700/80">ドリンクレシピ</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">レシピ管理</h1>
              <p className="mt-1 text-sm text-slate-600">スタッフが確認するドリンクレシピを管理できます</p>
            </div>
            <div className="inline-flex items-center self-start rounded-full bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white sm:self-auto">
              店長 田中
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "登録レシピ", value: `${recipes.length}件` },
            { label: "公開中", value: `${publishedCount}件` },
            { label: "下書き", value: `${recipes.length - publishedCount}件` },
            { label: "カテゴリ数", value: `${categoryCount}件` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-3 shadow-sm">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex-1">
              <span className="sr-only">レシピ名で検索</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="レシピ名で検索"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
              />
            </label>
            <button
              type="button"
              onClick={openAddEditor}
              className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
              レシピを追加
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  selectedFilter === filter.id
                    ? "border-amber-600 bg-amber-100 text-amber-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {visibleRecipes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
              条件に合うレシピはありません
            </div>
          ) : (
            visibleRecipes.map((recipe) => (
              <article key={recipe.id} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 shadow-sm sm:p-4">
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-xs font-semibold text-amber-800">
                    写真
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">{recipe.title}</h2>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">{recipe.category}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          recipe.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusLabel(recipe.active)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{recipe.description || "説明は未入力です"}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditEditor(recipe)}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(recipe.id)}
                    className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm font-semibold text-amber-800"
                  >
                    {recipe.active ? "下書きにする" : "公開する"}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
          <p className="font-semibold text-slate-900">スタッフ画面との関係</p>
          <p className="mt-1 text-sm text-slate-600">公開中のレシピはスタッフのレシピ画面に表示される想定です。</p>
          <Link href="/recipes" className="mt-3 inline-flex text-sm font-semibold text-emerald-800 hover:text-emerald-950">
            スタッフ用レシピを見る →
          </Link>
        </section>

        <p className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
          この画面はデモです。実際の保存と写真アップロードは後でSupabase Storageに接続します。
        </p>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center">
          <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-amber-100 bg-white p-4 shadow-xl sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700">{editingId === null ? "新規登録" : "編集"}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editingId === null ? "レシピを追加" : "レシピを編集"}
                </h2>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  draft.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                }`}
              >
                {statusLabel(draft.active)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                レシピ名
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                カテゴリ
                <input
                  value={draft.category}
                  onChange={(event) => updateDraft("category", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
            </div>

            <div className="mt-3 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                短い説明
                <input
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                写真メモ
                <input
                  value={draft.photoMemo}
                  onChange={(event) => updateDraft("photoMemo", event.target.value)}
                  placeholder="写真アップロードは後で追加します"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                材料
                <textarea
                  value={draft.ingredients}
                  onChange={(event) => updateDraft("ingredients", event.target.value)}
                  placeholder="例）牛乳160g、シロップ10g"
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                作り方
                <textarea
                  value={draft.steps}
                  onChange={(event) => updateDraft("steps", event.target.value)}
                  placeholder="1行ずつ手順を入力してください"
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                追加メモ
                <textarea
                  value={draft.notes}
                  onChange={(event) => updateDraft("notes", event.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700">ステータス</p>
              <div className="mt-2 flex gap-2">
                {[true, false].map((active) => (
                  <button
                    key={String(active)}
                    type="button"
                    onClick={() => updateDraft("active", active)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                      draft.active === active
                        ? "border-amber-600 bg-amber-100 text-amber-900"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {statusLabel(active)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={saveRecipe}
                disabled={!draft.title.trim() || !draft.category.trim()}
                className="flex-1 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
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
    </AppShell>
  );
}
