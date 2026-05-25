import AppShell from "@/components/app-shell";

export default function RecipesPage() {
  return (
    <AppShell>
      <div className="space-y-6 pb-4">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <h2 className="text-2xl font-semibold">レシピ</h2>
          <p className="mt-2 text-sm text-slate-500">人気のカフェメニューを確認できます。</p>
        </section>

        <article className="rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <div className="overflow-hidden rounded-[1.75rem] bg-slate-100 py-12 text-center text-slate-500">
            写真のプレースホルダー
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-slate-500">メニュー</p>
              <h3 className="mt-1 text-xl font-semibold">抹茶ラテ</h3>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-medium">材料</p>
              <p className="mt-1 text-sm text-slate-600">抹茶パウダー、牛乳、シロップ、氷、水</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-medium">手順</p>
              <p className="mt-1 text-sm text-slate-600">シロップ、抹茶、水を混ぜ、氷と牛乳を注いで完成。</p>
            </div>
          </div>
        </article>
      </div>
    </AppShell>
  );
}
