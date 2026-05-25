import AppShell from "@/components/app-shell";

export default function WorkerPage() {
  return (
    <AppShell>
      <div className="space-y-6 pb-4">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <h2 className="text-2xl font-semibold">スタッフ画面</h2>
          <p className="mt-2 text-sm text-slate-500">自分のシフトをかんたんに確認できます。</p>
        </section>

        <section className="space-y-3">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm shadow-slate-200">
            <h3 className="text-lg font-semibold">今日のシフト</h3>
            <p className="mt-2 text-sm text-slate-600">今日は 1シフト 08:30–13:00 です。</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm shadow-slate-200">
            <h3 className="text-lg font-semibold">自分のシフト</h3>
            <p className="mt-2 text-sm text-slate-600">今週の自分の予定をまとめて表示します。</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm shadow-slate-200">
            <h3 className="text-lg font-semibold">来月の希望提出</h3>
            <p className="mt-2 text-sm text-slate-600">次の月の希望シフトをLINEから提出できます。</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
