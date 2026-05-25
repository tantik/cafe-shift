'use client';

import { useState } from 'react';
import AppShell from '@/components/app-shell';

type Recipe = {
  id: string;
  name: string;
  label: string;
  color: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  notes?: string[];
};

const mockRecipes: Recipe[] = [
  {
    id: 'matcha_latte',
    name: '抹茶ラテ',
    label: '人気',
    color: 'bg-green-100',
    description: 'クリーミーな牛乳と抹茶の香りが調和した人気メニュー。',
    ingredients: [
      'シロップ 10g',
      '牛乳 160g',
      '氷 適量',
      '抹茶 7g',
      'お湯 30g',
      '冷水 20g',
    ],
    steps: [
      '小さいカップにシロップを入れる。',
      '牛乳を160g入れて、マドラーでよく混ぜる。',
      'グラスに氷を入れる。',
      '抹茶液を作る。',
      '牛乳の上から抹茶液をゆっくり注ぐ。',
      'フタをして完成。',
    ],
    notes: [
      '抹茶液の作り方:',
      '1. 抹茶7gをカップに入れる。',
      '2. お湯30gを加えて、ダマがなくなるまで混ぜる。',
      '3. 冷水20gを加える。',
      '4. 泡が出るまでしっかり混ぜる。',
    ],
  },
  {
    id: 'hojicha_latte',
    name: 'ほうじ茶ラテ',
    label: '定番',
    color: 'bg-amber-100',
    description: 'ほうじ茶の香ばしさが心地よいリラックスドリンク。',
    ingredients: ['ほうじ茶パウダー 5g', '牛乳 180g', '蜂蜜 10g', '氷 適量'],
    steps: [
      'グラスに氷を入れる。',
      'ほうじ茶パウダーを少量のお湯で溶く。',
      '蜂蜜を加える。',
      '牛乳を注いでよく混ぜる。',
    ],
  },
  {
    id: 'sencha',
    name: '煎茶',
    label: '定番',
    color: 'bg-teal-100',
    description: '爽やかな緑茶の香りが特徴。シンプルで飲みやすい。',
    ingredients: ['煎茶 3g', 'お湯 150ml'],
    steps: [
      'お湯を75℃に冷ます。',
      'カップに煎茶を入れる。',
      'お湯を注ぎ、1〜2分待つ。',
      '完成。',
    ],
  },
  {
    id: 'genmai_cha',
    name: '玄米茶',
    label: '定番',
    color: 'bg-yellow-100',
    description: '玄米の香りが香ばしい健康的なお茶。',
    ingredients: ['玄米茶 3g', 'お湯 150ml'],
    steps: [
      'お湯を75℃に冷ます。',
      'カップに玄米茶を入れる。',
      'お湯を注ぎ、1分待つ。',
      '完成。',
    ],
  },
  {
    id: 'wakocha',
    name: '和紅茶',
    label: '季節',
    color: 'bg-rose-100',
    description: '日本産の上品な紅茶。温かみのある味わい。',
    ingredients: ['和紅茶 3g', 'お湯 160ml'],
    steps: [
      'お湯を90℃に冷ます。',
      'カップに和紅茶を入れる。',
      'お湯を注ぎ、3〜4分待つ。',
      '完成。',
    ],
  },
  {
    id: 'iced_tea',
    name: '季節のアイスティー',
    label: '季節',
    color: 'bg-cyan-100',
    description: '季節の紅茶を使ったさっぱりアイスドリンク。',
    ingredients: ['季節の紅茶 5g', 'お湯 100ml', '氷 適量', '砂糖 5g'],
    steps: [
      'グラスに氷を入れる。',
      'お湯を注ぎ、紅茶を浸す。',
      '砂糖を加える。',
      'かき混ぜて完成。',
    ],
  },
  {
    id: 'ice_matcha',
    name: 'アイス抹茶',
    label: '人気',
    color: 'bg-green-100',
    description: '冷たい牛乳と抹茶のさっぱりした組み合わせ。',
    ingredients: [
      '抹茶パウダー 7g',
      'お湯 30g',
      '牛乳 180g',
      '氷 適量',
      'シロップ 10g',
    ],
    steps: [
      '抹茶をお湯でよく溶く。',
      'グラスに氷を入れる。',
      '抹茶液を注ぐ。',
      '牛乳をゆっくり注ぐ。',
      'シロップを加えて完成。',
    ],
  },
  {
    id: 'yuzu_sencha',
    name: 'ゆず煎茶',
    label: '季節',
    color: 'bg-yellow-50',
    description: '爽やかなゆずの香りと煎茶の組み合わせ。',
    ingredients: ['煎茶 3g', 'お湯 150ml', 'ゆず果汁 10ml'],
    steps: [
      'お湯を75℃に冷ます。',
      'カップに煎茶を入れる。',
      'お湯を注ぎ、1〜2分待つ。',
      'ゆず果汁を加えて完成。',
    ],
  },
];

function RecipeCard({
  recipe,
  isSelected,
  onClick,
}: {
  recipe: Recipe;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl transition ${
        isSelected
          ? 'ring-2 ring-green-700 shadow-md'
          : 'shadow-sm shadow-slate-200 hover:shadow-md'
      }`}
    >
      <div className={`rounded-2xl p-3 ${recipe.color}`}>
        <div className="aspect-square rounded-lg bg-gradient-to-br from-white/50 to-slate-100 flex items-center justify-center text-xs text-slate-400">
          写真
        </div>
      </div>
      <div className="mt-2 px-2 pb-2">
        <p className="text-xs font-semibold text-slate-900 line-clamp-2">
          {recipe.name}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">{recipe.label}</p>
      </div>
    </button>
  );
}

export default function RecipesPage() {
  const [selectedRecipeId, setSelectedRecipeId] = useState('matcha_latte');
  const selectedRecipe = mockRecipes.find((r) => r.id === selectedRecipeId);

  // gallery will render all recipes in a 2-row horizontally scrolling grid

  return (
    <AppShell>
      <div className="space-y-6 pb-4">
        {/* Header */}
        <section className="rounded-3xl bg-gradient-to-br from-green-50 to-teal-50 p-6 shadow-sm shadow-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900">レシピ</h2>
          <p className="mt-2 text-sm text-slate-600">
            ドリンクの作り方をすぐ確認できます
          </p>
        </section>

        {/* Recipe Gallery */}
        <section>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="grid grid-rows-2 grid-flow-col auto-cols-[140px] gap-3 pb-2">
              {mockRecipes.map((recipe) => (
                <div key={recipe.id} className="w-[140px]">
                  <RecipeCard
                    recipe={recipe}
                    isSelected={selectedRecipeId === recipe.id}
                    onClick={() => setSelectedRecipeId(recipe.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Recipe Detail */}
        {selectedRecipe && (
          <section className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200">
            {/* Recipe Title */}
            <h3 className="text-2xl font-semibold text-slate-900">
              {selectedRecipe.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {selectedRecipe.label}
            </p>

            {/* Description */}
            {selectedRecipe.description && (
              <p className="mt-3 text-sm text-slate-600">
                {selectedRecipe.description}
              </p>
            )}

            {/* Ingredients */}
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h4 className="font-semibold text-slate-900">材料</h4>
              <ul className="mt-3 space-y-2">
                {selectedRecipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-green-600 flex-none" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h4 className="font-semibold text-slate-900">作り方</h4>
              <ol className="mt-3 space-y-2">
                {selectedRecipe.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-600">
                    <span className="font-semibold text-green-700 flex-none">
                      {idx + 1}.
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Notes */}
            {selectedRecipe.notes && selectedRecipe.notes.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <h4 className="font-semibold text-slate-900">
                  {selectedRecipe.name === '抹茶ラテ' ? '抹茶液の作り方' : '追加メモ'}
                </h4>
                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                  <div className="space-y-2">
                    {selectedRecipe.notes.map((note, idx) => (
                      <p key={idx} className="text-sm text-slate-600">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AppShell>
  );
}
