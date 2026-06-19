"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import { demoRecipes, type DemoRecipe } from "@/lib/demo-recipes";
import { useI18n } from "@/lib/i18n/use-i18n";

function RecipePhoto({ recipe, label }: { recipe: DemoRecipe; label: string }) {
  if (recipe.imageUrl) {
    return (
      <div className="flex h-14 w-full items-center justify-center overflow-hidden rounded-md bg-[#fbf8f1]">
        <img src={recipe.imageUrl} alt={recipe.titleJa} className="h-full w-full object-contain" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="flex h-14 items-center justify-center rounded-md bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 text-[10px] font-bold text-slate-400">
      {label}
    </div>
  );
}

function RecipeCard({
  recipe,
  isSelected,
  onClick,
  photoLabel,
}: {
  recipe: DemoRecipe;
  isSelected: boolean;
  onClick: () => void;
  photoLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[78px] rounded-lg border bg-white p-1 text-left transition ${
        isSelected ? "border-emerald-700 ring-2 ring-emerald-700" : "border-slate-200 shadow-sm shadow-slate-200"
      }`}
    >
      <RecipePhoto recipe={recipe} label={photoLabel} />
      <p className="mt-1 line-clamp-2 min-h-7 text-[10px] font-bold leading-tight text-slate-900">{recipe.titleJa}</p>
      <p className="truncate text-[9px] font-semibold text-slate-500">{recipe.category}</p>
    </button>
  );
}

export default function RecipesPage() {
  return (
    <AppShell>
      <RecipesContent />
    </AppShell>
  );
}

function RecipesContent() {
  const { language, t } = useI18n();
  const [selectedRecipeId, setSelectedRecipeId] = useState(demoRecipes[0].id);
  const selectedRecipe = demoRecipes.find((recipe) => recipe.id === selectedRecipeId) ?? demoRecipes[0];

  // Get locale-aware text with fallback to Japanese
  const getTitle = () => {
    if (language === "en" && selectedRecipe.titleEn) {
      return selectedRecipe.titleEn;
    }
    return selectedRecipe.titleJa;
  };

  const getDescription = () => {
    if (language === "en" && selectedRecipe.descriptionEn) {
      return selectedRecipe.descriptionEn;
    }
    return selectedRecipe.descriptionJa;
  };

  const getIngredients = () => {
    if (language === "en" && selectedRecipe.ingredientsEn && selectedRecipe.ingredientsEn.length > 0) {
      return selectedRecipe.ingredientsEn;
    }
    return selectedRecipe.ingredients;
  };

  const getSteps = () => {
    if (language === "en" && selectedRecipe.stepsEn && selectedRecipe.stepsEn.length > 0) {
      return selectedRecipe.stepsEn;
    }
    return selectedRecipe.steps;
  };

  const getNotes = () => {
    if (language === "en" && selectedRecipe.notesEn && selectedRecipe.notesEn.length > 0) {
      return selectedRecipe.notesEn;
    }
    return selectedRecipe.notes;
  };

  return (
    <div className="space-y-3 pb-4">
      <section className="overflow-x-auto p-0.5 scroll-px-1 scrollbar-hide">
        <div className="grid w-max grid-flow-col grid-rows-2 auto-cols-[78px] gap-2 pb-1">
          {demoRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSelected={selectedRecipeId === recipe.id}
              onClick={() => setSelectedRecipeId(recipe.id)}
              photoLabel={t("recipes.photo")}
            />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-tight text-slate-950">{getTitle()}</h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{selectedRecipe.titleEn}</p>
          </div>
          {selectedRecipe.badge ? (
            <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">
              {selectedRecipe.badge}
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-xs font-bold text-emerald-800">{selectedRecipe.category}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{getDescription()}</p>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-950">{t("recipes.ingredients")}</h3>
          <ul className="mt-2 grid grid-cols-1 gap-1.5">
            {getIngredients().map((ingredient) => (
              <li key={ingredient} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-950">{t("recipes.steps")}</h3>
          <ol className="mt-2 list-none space-y-2">
            {getSteps().map((step, index) => (
              <li key={step} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                <span className="shrink-0 font-bold text-emerald-800">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {selectedRecipe.prepLiquid || selectedRecipe.notes || selectedRecipe.notesEn ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <h3 className="text-sm font-bold text-slate-950">
              {selectedRecipe.prepLiquid ? t("recipes.matchaLiquid") : t("recipes.tips")}
            </h3>
            <div className="mt-2 space-y-1.5">
              {(selectedRecipe.prepLiquid ?? getNotes() ?? []).map((note) => (
                <p key={note} className="text-sm leading-relaxed text-slate-600">
                  {note}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
