"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/app-shell";
import { useI18n } from "@/lib/i18n/use-i18n";

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

const menuRecipeItems = [
  ["抹茶ラテ", "Ceremonia"],
  ["サクラ抹茶ラテフロート", "Ceremonia"],
  ["ピュア抹茶", "Ceremonia"],
  ["ストロベリー抹茶ラテ", "Ceremonia"],
  ["ゴールドパウダー抹茶ラテ", "Ceremonia"],
  ["マンゴー抹茶ラテ", "Summer Special"],
  ["ラズベリー＆パッションフルーツ抹茶ラテ", "Summer Special"],
  ["抹茶クラウド ココナッツウォーター", "Summer Special"],
  ["抹茶ソーダ", "Summer Special"],
  ["抹茶ソーダフロート", "Summer Special"],
  ["サクラ抹茶ラテ ココナッツフロート", "Summer Special"],
  ["ほうじ茶ラテ", "Hojicha"],
  ["ピュアほうじ茶", "Hojicha"],
  ["ほうじ茶チョコラテ", "Hojicha"],
  ["ストロベリーほうじ茶チョコラテ", "Hojicha"],
  ["コーヒー", "Coffee & Other"],
  ["エスプレッソ", "Coffee & Other"],
  ["カフェラテ", "Coffee & Other"],
  ["オレンジジュース", "Coffee & Other"],
  ["ストロベリーミルク", "Coffee & Other"],
  ["ジャスミンティー", "Coffee & Other"],
  ["フルーツソーダ", "Coffee & Other"],
  ["生ビール", "Coffee & Other"],
  ["抹茶アイス", "Ice Cream"],
  ["バニラアイス", "Ice Cream"],
  ["ココナッツミルクアイス", "Ice Cream"],
  ["ソイアイス", "Ice Cream"],
  ["豆と茶セット", "Japanese Sweets"],
  ["お団子セット", "Japanese Sweets"],
  ["わらび餅", "Japanese Sweets"],
  ["Oat Milk", "Option"],
  ["Soy Milk", "Option"],
  ["Almond Milk", "Option"],
  ["Coconut Milk", "Option"],
  ["Ice Cream Option", "Option"],
] satisfies [string, string][];

const initialRecipes: Recipe[] = menuRecipeItems.map(([title, category], index) => ({
  id: index + 1,
  title,
  category,
  description: `${title}のスタッフ用デモレシピ。`,
  photoMemo: "",
  ingredients: "材料は公式レシピに合わせて更新してください",
  steps: "カップを準備します\n材料を計量します\n仕上がりを確認して提供します",
  notes: "デモデータです",
  active: true,
}));

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

const filters: { id: RecipeFilter; labelKey: string }[] = [
  { id: "all", labelKey: "managerRecipes.filters.all" },
  { id: "active", labelKey: "managerRecipes.filters.active" },
  { id: "draft", labelKey: "managerRecipes.filters.draft" },
];

function statusLabel(active: boolean, t: (key: string) => string) {
  return active ? t("managerRecipes.status.published") : t("managerRecipes.status.draft");
}

export default function ManagerRecipesPage() {
  return (
    <AppShell variant="wide" showMobileNav={false}>
      <ManagerRecipesContent />
    </AppShell>
  );
}

function ManagerRecipesContent() {
  const { t } = useI18n();
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

  function deleteRecipe(id: number) {
    setRecipes((current) => current.filter((recipe) => recipe.id !== id));
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-4 pb-8">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: t("managerRecipes.totalRecipes"), value: `${recipes.length}${t("managerRecipes.itemsSuffix")}` },
            { label: t("managerRecipes.published"), value: `${publishedCount}${t("managerRecipes.itemsSuffix")}` },
            { label: t("managerRecipes.draft"), value: `${recipes.length - publishedCount}${t("managerRecipes.itemsSuffix")}` },
            { label: t("managerRecipes.categories"), value: `${categoryCount}${t("managerRecipes.itemsSuffix")}` },
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
              <span className="sr-only">{t("managerRecipes.searchLabel")}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("managerRecipes.searchPlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
              />
            </label>
            <button
              type="button"
              onClick={openAddEditor}
              className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
              {t("managerRecipes.addRecipe")}
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
                {t(filter.labelKey)}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {visibleRecipes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
              {t("managerRecipes.emptyText")}
            </div>
          ) : (
            visibleRecipes.map((recipe) => (
              <article key={recipe.id} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 shadow-sm sm:p-4">
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-xs font-semibold text-amber-800">
                    {t("managerRecipes.photo")}
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
                        {statusLabel(recipe.active, t)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{recipe.description || t("managerRecipes.noDescription")}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditEditor(recipe)}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800"
                  >
                    {t("managerRecipes.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRecipe(recipe.id)}
                    className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-semibold text-rose-700"
                  >
                    {t("manager.deleteRecipe")}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <p className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
          {t("managerRecipes.demoNote")}
        </p>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center">
          <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-amber-100 bg-white p-4 shadow-xl sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700">{editingId === null ? t("managerRecipes.modal.newBadge") : t("managerRecipes.modal.editBadge")}</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editingId === null ? t("managerRecipes.modal.addTitle") : t("managerRecipes.modal.editTitle")}
                </h2>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  draft.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                }`}
              >
                {statusLabel(draft.active, t)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.title")}
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.category")}
                <input
                  value={draft.category}
                  onChange={(event) => updateDraft("category", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
            </div>

            <div className="mt-3 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.description")}
                <input
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.photoMemo")}
                <input
                  value={draft.photoMemo}
                  onChange={(event) => updateDraft("photoMemo", event.target.value)}
                  placeholder={t("managerRecipes.placeholders.photoMemo")}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.ingredients")}
                <textarea
                  value={draft.ingredients}
                  onChange={(event) => updateDraft("ingredients", event.target.value)}
                  placeholder={t("managerRecipes.placeholders.ingredients")}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.steps")}
                <textarea
                  value={draft.steps}
                  onChange={(event) => updateDraft("steps", event.target.value)}
                  placeholder={t("managerRecipes.placeholders.steps")}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.notes")}
                <textarea
                  value={draft.notes}
                  onChange={(event) => updateDraft("notes", event.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700">{t("managerRecipes.fields.status")}</p>
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
                    {statusLabel(active, t)}
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
                {t("managerRecipes.actions.save")}
              </button>
              <button
                type="button"
                onClick={closeEditor}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                {t("managerRecipes.actions.close")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
