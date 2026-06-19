import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import MobileNav from "@/components/mobile-nav";
import { I18nProvider } from "@/lib/i18n/use-i18n";
import { dictionaries } from "@/lib/i18n/dictionaries";
import logo from "@/logo.png";

export default function AppShell({
  children,
  variant = "mobile",
  showMobileNav = true,
}: {
  children: ReactNode;
  variant?: "mobile" | "wide";
  showMobileNav?: boolean;
}) {
  const widthClass = variant === "wide" ? "max-w-6xl px-3 sm:px-5 md:px-6" : "max-w-[430px] px-3 sm:px-4";
  const bottomPadding = showMobileNav ? "pb-24" : "pb-6";

  return (
    <I18nProvider>
      <div className="min-h-screen bg-[#f7f1e6] text-slate-900">
        <div className={`mx-auto flex min-h-screen flex-col pt-6 ${bottomPadding} ${widthClass}`}>
          <header className="mb-4 rounded-xl bg-white/90 px-3.5 py-3 shadow-sm shadow-slate-200 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/"
                className="flex min-w-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                aria-label={`${dictionaries.ja["app.name"]} home`}
              >
                <Image
                  src={logo}
                  alt={dictionaries.ja["app.name"]}
                  className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                  priority
                />
                <span className="truncate text-base font-semibold leading-tight text-slate-900 sm:text-lg">{dictionaries.ja["app.name"]}</span>
              </Link>
              <LanguageSwitcher />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          {showMobileNav ? <MobileNav /> : null}
        </div>
      </div>
    </I18nProvider>
  );
}
