"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/app-shell";
import { demoRecipes } from "@/lib/demo-recipes";
import { useI18n } from "@/lib/i18n/use-i18n";
import { createTranslationSignature, hasTranslationChanged } from "@/lib/translation-cache";

type RecipeFilter = "all" | "active" | "draft";

type Recipe = {
  id: number;
  // Display/Edit (Japanese only for manager)
  title: string;
  category: string;
  description: string;
  photoMemo: string;
  imageUrl?: string;
  ingredients: string;
  steps: string;
  notes: string;
  active: boolean;
  
  // Hidden storage for translations
  titleEn: string;
  titleJaHash?: string;
  descriptionEn: string;
  descriptionJaHash?: string;
  ingredientsEn: string;
  ingredientsJaHash?: string;
  stepsEn: string;
  stepsJaHash?: string;
  notesEn: string;
  notesJaHash?: string;
};

type RecipeDraft = Omit<Recipe, "id">;

const initialRecipes: Recipe[] = demoRecipes.map((recipe, index) => ({
  id: index + 1,
  // Display fields
  title: recipe.titleJa,
  category: recipe.category,
  description: recipe.descriptionJa,
  photoMemo: recipe.imageUrl ?? "",
  imageUrl: recipe.imageUrl,
  ingredients: recipe.ingredients.join("\n"),
  steps: recipe.steps.join("\n"),
  notes: recipe.notes?.join("\n") ?? recipe.prepLiquid?.join("\n") ?? "",
  active: true,
  
  // Hidden translations
  titleEn: recipe.titleEn,
  titleJaHash: recipe.titleJaHash,
  descriptionEn: recipe.descriptionEn || "",
  descriptionJaHash: recipe.descriptionJaHash,
  ingredientsEn: recipe.ingredientsEn?.join("\n") || "",
  ingredientsJaHash: recipe.ingredientsJaHash,
  stepsEn: recipe.stepsEn?.join("\n") || "",
  stepsJaHash: recipe.stepsJaHash,
  notesEn: recipe.notesEn?.join("\n") || "",
  notesJaHash: recipe.notesJaHash,
}));

const emptyDraft: RecipeDraft = {
  title: "",
  category: "",
  description: "",
  photoMemo: "",
  imageUrl: undefined,
  ingredients: "",
  steps: "",
  notes: "",
  active: true,
  
  // Hidden translations
  titleEn: "",
  titleJaHash: undefined,
  descriptionEn: "",
  descriptionJaHash: undefined,
  ingredientsEn: "",
  ingredientsJaHash: undefined,
  stepsEn: "",
  stepsJaHash: undefined,
  notesEn: "",
  notesJaHash: undefined,
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
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

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

  function updateDraftImage(file: File | undefined) {
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(objectUrl);
    setDraft((current) => ({ ...current, imageUrl: objectUrl, photoMemo: file.name }));
  }

  async function autoTranslateRecipe() {
    setIsTranslating(true);
    setTranslationError(null);

    try {
      // Determine which fields need translation
      const fieldsToTranslate: Record<string, string | string[]> = {};
      
      if (hasTranslationChanged(draft.title, draft.titleJaHash)) {
        fieldsToTranslate.title = draft.title;
      }
      if (hasTranslationChanged(draft.description, draft.descriptionJaHash)) {
        fieldsToTranslate.description = draft.description;
      }
      if (hasTranslationChanged(draft.ingredients.split("\n").filter((line) => line.trim()), draft.ingredientsJaHash)) {
        fieldsToTranslate.ingredients = draft.ingredients.split("\n").filter((line) => line.trim());
      }
      if (hasTranslationChanged(draft.steps.split("\n").filter((line) => line.trim()), draft.stepsJaHash)) {
        fieldsToTranslate.steps = draft.steps.split("\n").filter((line) => line.trim());
      }

      // If nothing changed and translation exists, skip
      if (Object.keys(fieldsToTranslate).length === 0 && draft.titleEn) {
        setTranslationError("No changes detected. English translation already exists.");
        setIsTranslating(false);
        return;
      }

      const response = await fetch("/api/translate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          ingredients: draft.ingredients.split("\n").filter((line) => line.trim()),
          steps: draft.steps.split("\n").filter((line) => line.trim()),
          points: [],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setTranslationError(data.error || "Translation failed. Please edit manually.");
        setIsTranslating(false);
        return;
      }

      const translations = await response.json();

      setDraft((current) => ({
        ...current,
        titleEn: translations.titleEn || "",
        titleJaHash: createTranslationSignature(current.title),
        descriptionEn: translations.descriptionEn || "",
        descriptionJaHash: createTranslationSignature(current.description),
        ingredientsEn: translations.ingredientsEn?.join("\n") || "",
        ingredientsJaHash: createTranslationSignature(current.ingredients.split("\n").filter((line) => line.trim())),
        stepsEn: translations.stepsEn?.join("\n") || "",
        stepsJaHash: createTranslationSignature(current.steps.split("\n").filter((line) => line.trim())),
        notesEn: translations.pointsEn?.join("\n") || "",
        notesJaHash: createTranslationSignature(current.notes.split("\n").filter((line) => line.trim())),
      }));

      setTranslationError(null);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationError("Translation failed. Please edit manually.");
    } finally {
      setIsTranslating(false);
    }
  }

  async function saveRecipe() {
    if (!draft.title.trim() || !draft.category.trim()) {
      return;
    }

    // If no English translation yet, try to auto-translate
    if (!draft.titleEn) {
      setIsTranslating(true);
      try {
        const response = await fetch("/api/translate-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draft.title,
            description: draft.description,
            ingredients: draft.ingredients.split("\n").filter((line) => line.trim()),
            steps: draft.steps.split("\n").filter((line) => line.trim()),
            points: [],
          }),
        });

        if (response.ok) {
          const translations = await response.json();
          const updatedDraft = {
            ...draft,
            titleEn: translations.titleEn || "",
            titleJaHash: createTranslationSignature(draft.title),
            descriptionEn: translations.descriptionEn || "",
            descriptionJaHash: createTranslationSignature(draft.description),
            ingredientsEn: translations.ingredientsEn?.join("\n") || "",
            ingredientsJaHash: createTranslationSignature(draft.ingredients.split("\n").filter((line) => line.trim())),
            stepsEn: translations.stepsEn?.join("\n") || "",
            stepsJaHash: createTranslationSignature(draft.steps.split("\n").filter((line) => line.trim())),
            notesEn: translations.pointsEn?.join("\n") || "",
            notesJaHash: createTranslationSignature(draft.notes.split("\n").filter((line) => line.trim())),
          };

          // Save with translations
          if (editingId === null) {
            const nextId = recipes.reduce((largest, recipe) => Math.max(largest, recipe.id), 0) + 1;
            setRecipes((current) => [...current, { id: nextId, ...updatedDraft }]);
          } else {
            setRecipes((current) =>
              current.map((recipe) => (recipe.id === editingId ? { id: editingId, ...updatedDraft } : recipe)),
            );
          }
          setEditorOpen(false);
          return;
        }
      } catch {
        // Fallback: save without translation
        console.warn("Auto-translation failed, saving recipe without English translation");
      } finally {
        setIsTranslating(false);
      }
    }

    // Save recipe (with or without translation)
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

        <section className="space-y-2">
          {visibleRecipes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
              {t("managerRecipes.emptyText")}
            </div>
          ) : (
            visibleRecipes.map((recipe) => (
              <article key={recipe.id} className="rounded-lg border border-amber-100 bg-amber-50/70 p-2 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white text-[11px] font-semibold text-amber-800">
                      {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.title} className="h-full w-full rounded-lg object-contain" loading="lazy" />
                      ) : (
                        t("managerRecipes.photo")
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h2 className="font-semibold leading-tight text-slate-900">{recipe.title}</h2>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-600">{recipe.category}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            recipe.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statusLabel(recipe.active, t)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">{recipe.description || t("managerRecipes.noDescription")}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditEditor(recipe)}
                      className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"
                    >
                      {t("managerRecipes.edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRecipe(recipe.id)}
                      className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700"
                    >
                      {t("manager.deleteRecipe")}
                    </button>
                  </div>
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center" onClick={closeEditor}>
          <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-amber-100 bg-white p-4 shadow-xl sm:p-5" onClick={(e) => e.stopPropagation()}>
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

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.title")} (日本語)
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
            </div>

            <div className="mt-3">
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
                {t("managerRecipes.fields.description")} (日本語)
                <input
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.photoMemo")}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => updateDraftImage(event.target.files?.[0])}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-emerald-800 focus:border-emerald-600"
                />
              </label>
              {draft.imageUrl ? (
                <div className="h-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img src={draft.imageUrl} alt={draft.title || t("managerRecipes.photo")} className="h-full w-full object-contain" />
                </div>
              ) : null}
              <label className="block text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.ingredients")} (日本語)
                <textarea
                  value={draft.ingredients}
                  onChange={(event) => updateDraft("ingredients", event.target.value)}
                  placeholder={t("managerRecipes.placeholders.ingredients")}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.steps")} (日本語)
                <textarea
                  value={draft.steps}
                  onChange={(event) => updateDraft("steps", event.target.value)}
                  placeholder={t("managerRecipes.placeholders.steps")}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {t("managerRecipes.fields.notes")} (日本語)
                <textarea
                  value={draft.notes}
                  onChange={(event) => updateDraft("notes", event.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </label>

              {translationError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="text-sm text-rose-700">{translationError}</p>
                </div>
              ) : null}

              {draft.titleEn ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm text-emerald-700">✓ English translation is saved</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={autoTranslateRecipe}
                  disabled={isTranslating || !draft.title.trim()}
                  className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isTranslating ? "Translating..." : "Translate to English"}
                </button>
              )}
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
