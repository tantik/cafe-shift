import AppShell from "@/components/app-shell";
import Link from "next/link";

export default function ManagerPage() {
  // Mock data (deterministic, no external calls)
  const todayLabel = "6月1日（月）";
  const shiftGroups = [
    { title: "1シフト 08:30–13:00", names: ["山田", "佐藤", "田中"] },
    { title: "2シフト 13:00–17:30", names: ["鈴木", "高橋"] },
    { title: "通しシフト 08:30–17:30", names: ["伊藤"] },
  ];
  const summary = { present: 6, off: 2 };
  const attention = [
    { title: "シフト希望", subtitle: "未確認", count: 8 },
    { title: "勤務報告", subtitle: "延長勤務あり", count: 3 },
    { title: "病欠・欠勤", subtitle: "", count: 1 },
  ];
  const timeSummaryPeriod = "5月1日〜5月31日";
  const timeRows = [
    { name: "山田 花子", planned: "72h", overtime: "2h", total: "74h" },
    { name: "佐藤 健", planned: "68h", sick: "-4.5h", total: "63.5h" },
    { name: "鈴木 愛", planned: "80h", overtime: "1.5h", total: "81.5h" },
  ];

  const quickActions = [
    { title: "シフトを編集" },
    { title: "希望を確認" },
    { title: "勤務報告" },
    { title: "勤務時間集計" },
    { title: "提案・改善" },
    { title: "スタッフ管理" },
    { title: "レシピ管理" },
    { title: "設定" },
  ];

  return (
    <AppShell variant="wide">
      <div className="space-y-5 pb-8">
        {/* Header */}
        <header className="rounded-2xl bg-gradient-to-r from-emerald-50 to-amber-50 p-6 shadow-md border border-amber-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">管理者画面</h1>
              <p className="mt-1 text-sm text-slate-600">今日の状況と確認が必要な項目をまとめて見られます</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-800 text-white px-3 py-1 text-sm font-semibold">店長</div>
              <div className="text-sm font-medium">田中</div>
            </div>
          </div>
        </header>

        {/* Top two columns: Today overview + Attention (stack on mobile, side-by-side on md) */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Today overview */}
          <section className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">今日のシフト</div>
              <div className="mt-1 font-semibold text-slate-900">{todayLabel}</div>
            </div>
            <div className="text-sm text-slate-600">合計 出勤予定 <span className="font-semibold text-slate-800">{summary.present}名</span></div>
          </div>

          <div className="mt-4 space-y-3">
            {shiftGroups.map((g) => (
              <div key={g.title} className="flex items-center justify-between rounded-xl bg-amber-50 p-3 border border-amber-100">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{g.title}</div>
                  <div className="text-xs text-slate-600 mt-1">{g.names.join('、')}</div>
                </div>
                <div className="text-xs text-slate-500">{g.names.length}名</div>
              </div>
            ))}

            <div className="mt-2 flex gap-3">
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">出勤予定 {summary.present}名</div>
              <div className="rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">休み {summary.off}名</div>
            </div>
          </div>
          </section>
          {/* Attention card */}
          <section className="rounded-2xl bg-amber-50 p-4 shadow-sm border border-amber-100">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">確認が必要</div>
              <div className="text-xs text-slate-500">要対応の数を確認してください</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {attention.map((a) => (
                <div key={a.title} className="rounded-xl bg-white p-3 shadow-sm border border-slate-100 text-center">
                  <div className="text-sm font-medium text-slate-800">{a.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{a.subtitle}</div>
                  <div className="mt-2 text-lg font-semibold text-amber-700">{a.count}件</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Time summary preview (full width) */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">勤務時間サマリー</div>
              <div className="mt-1 font-semibold text-slate-900">{timeSummaryPeriod}</div>
            </div>
            <div className="text-xs text-slate-500">給与計算ではなく、勤務時間確認用です。</div>
          </div>

          <div className="mt-3 space-y-2">
            {timeRows.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-600">
                    予定 {r.planned} {r.overtime ? `/ 残業 ${r.overtime}` : r.sick ? `/ 病欠 ${r.sick}` : ''}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-800">合計 {r.total}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900">クイックアクション</h3>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((q) => {
              const href =
                q.title === "シフトを編集"
                  ? "/manager/shifts"
                  : q.title === "希望を確認"
                    ? "/manager/requests"
                    : q.title === "勤務報告"
                      ? "/manager/time-reports"
                      : q.title === "勤務時間集計"
                        ? "/manager/attendance"
                        : q.title === "提案・改善"
                          ? "/manager/suggestions"
                          : q.title === "スタッフ管理"
                            ? "/manager/employees"
                            : q.title === "レシピ管理"
                              ? "/manager/recipes"
                              : q.title === "設定"
                                ? "/manager/settings"
                                : null;
              const canOpen = href !== null;
              const card = (
                <div
                  className={`relative flex items-center justify-between gap-3 rounded-xl border bg-amber-50 p-4 shadow-sm ${
                    canOpen
                      ? "border-emerald-200 transition group-hover:border-emerald-400 group-hover:bg-emerald-50"
                      : "border-amber-100"
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">{q.title}</div>
                    <div className={`text-xs ${canOpen ? "font-semibold text-emerald-700" : "text-slate-500"}`}>
                      {q.title === "勤務報告" ? "延長勤務も確認 →" : canOpen ? "開く →" : "準備中"}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">›</div>
                </div>
              );

              return href ? (
                <Link
                  key={q.title}
                  href={href}
                  className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  {card}
                </Link>
              ) : (
                <div key={q.title}>{card}</div>
              );
            })}
          </div>
        </section>

        <p className="text-xs text-slate-500">この画面はデモです。実際のデータは後でSupabaseに接続します。</p>
      </div>
    </AppShell>
  );
}
