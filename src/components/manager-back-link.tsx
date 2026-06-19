"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/use-i18n";

export default function ManagerBackLink() {
  const pathname = usePathname();
  const { t } = useI18n();

  if (
    pathname === "/manager" ||
    pathname === "/manager/employees" ||
    pathname === "/manager/recipes" ||
    pathname === "/manager/settings" ||
    !pathname.startsWith("/manager/")
  ) {
    return null;
  }

  return (
    <Link
      href="/manager"
      className="mb-3 inline-flex w-fit cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm hover:border-emerald-300"
    >
      ← {t("manager.backToManager")}
    </Link>
  );
}
