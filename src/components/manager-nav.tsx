"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/use-i18n";

const managerNavItems = [
  { href: "/manager/employees", labelKey: "manager.staff" },
  { href: "/manager/recipes", labelKey: "manager.recipes" },
  { href: "/manager/settings", labelKey: "manager.settings" },
];

export default function ManagerNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="mx-auto grid max-w-[430px] grid-cols-3 gap-2">
        {managerNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg border px-3 py-2 text-center text-sm font-bold shadow-sm transition ${
                isActive
                  ? "border-emerald-700 bg-emerald-800 text-white"
                  : "border-slate-200 bg-slate-100 text-slate-800 hover:border-emerald-300"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
