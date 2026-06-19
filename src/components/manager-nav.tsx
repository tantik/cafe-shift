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
    <nav className="mb-3 grid grid-cols-3 gap-2">
      {managerNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg border px-3 py-2 text-center text-sm font-bold shadow-sm transition ${
              isActive
                ? "border-emerald-700 bg-emerald-800 text-white"
                : "border-slate-200 bg-white text-slate-800 hover:border-emerald-300"
            }`}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
