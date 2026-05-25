import AppShell from "@/components/app-shell";

export default function ManagerPage() {
  return (
    <AppShell>
      <div className="space-y-6 pb-4">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <h2 className="text-2xl font-semibold">管理者画面</h2>
          <p className="mt-2 text-sm text-slate-500">シフト管理とスタッフ管理をまとめて使えます。</p>
        </section>

        <section className="grid gap-3">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm shadow-slate-200">
            <h3 className="text-lg font-semibold">シフト編集</h3>
            <p className="mt-2 text-sm text-slate-600">週ごとのシフトをかんたんに編集。</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm shadow-slate-200">
            <h3 className="text-lg font-semibold">スタッフ管理</h3>
            <p className="mt-2 text-sm text-slate-600">従業員リストと役割を管理。</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm shadow-slate-200">
            <h3 className="text-lg font-semibold">希望確認</h3>
            <p className="mt-2 text-sm text-slate-600">スタッフの希望シフトを確認。</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm shadow-slate-200">
            <h3 className="text-lg font-semibold">レシピ管理</h3>
            <p className="mt-2 text-sm text-slate-600">レシピの追加・編集・確認。</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
