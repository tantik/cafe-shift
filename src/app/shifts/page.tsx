import AppShell from "@/components/app-shell";

const weekDays = [
  { day: "月", shift: "1シフト" },
  { day: "火", shift: "2シフト" },
  { day: "水", shift: "通しシフト" },
  { day: "木", shift: "休み" },
  { day: "金", shift: "休暇" },
];

export default function ShiftsPage() {
  return (
    <AppShell>
      <div className="space-y-6 pb-4">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <h2 className="text-2xl font-semibold">シフトカレンダー</h2>
          <p className="mt-2 text-sm text-slate-500">今週の予定と固定シフトを確認します。</p>
        </section>

        <section className="grid gap-3">
          <div className="grid gap-3">
            {weekDays.map((item) => (
              <div key={item.day} className="rounded-[1.75rem] bg-slate-50 p-4 shadow-sm shadow-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">{item.day}曜日</span>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">{item.shift}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm shadow-slate-200">
            <h3 className="text-lg font-semibold">固定シフトラベル</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium">1シフト</p>
                <p className="text-sm text-slate-600">08:30–13:00</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium">2シフト</p>
                <p className="text-sm text-slate-600">13:00–17:30</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium">通しシフト</p>
                <p className="text-sm text-slate-600">08:30–17:30</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium">休み</p>
                <p className="text-sm text-slate-600">—</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium">休暇</p>
                <p className="text-sm text-slate-600">—</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
