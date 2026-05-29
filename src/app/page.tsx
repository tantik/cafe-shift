import AppShell from "@/components/app-shell";
import Link from "next/link";

const cards = [
  { title: "今日のシフト", href: "/shifts" },
  { title: "シフト希望", href: "/requests" },
  { title: "勤務報告（シフト画面）", href: "/shifts" },
  { title: "提案・改善", href: "/suggestions" },
  { title: "レシピ確認", href: "/recipes" },
  { title: "管理者メニュー", href: "/manager" },
];

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-6 pb-4">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm shadow-slate-200">
          <p className="text-sm text-slate-500">LINEで使えるカフェ向けシフト管理</p>
          <h2 className="mt-4 text-3xl font-semibold">Cafe Shift</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            シンプルなシフト管理とレシピ確認をスマホでかんたんに。
          </p>
        </section>

        <div className="grid gap-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-[1.75rem] bg-white p-5 text-left shadow-sm shadow-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-lg font-semibold">{card.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
