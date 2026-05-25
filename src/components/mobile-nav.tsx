import Link from "next/link";

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/worker", label: "スタッフ" },
  { href: "/shifts", label: "シフト" },
  { href: "/recipes", label: "レシピ" },
  { href: "/manager", label: "管理" },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-[430px] items-center justify-between gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-slate-100 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
