import type { ReactNode } from "react";
import LanguageSwitcher from "@/components/language-switcher";
import MobileNav from "@/components/mobile-nav";
import { I18nProvider } from "@/lib/i18n/use-i18n";

export default function AppShell({
  children,
  variant = "mobile",
}: {
  children: ReactNode;
  variant?: "mobile" | "wide";
}) {
  const widthClass = variant === "wide" ? "max-w-6xl px-3 sm:px-5 md:px-6" : "max-w-[430px] px-3 sm:px-4";

  return (
    <I18nProvider>
      <div className="min-h-screen bg-[#f7f1e6] text-slate-900">
        <div className={`mx-auto flex min-h-screen flex-col pb-24 pt-6 ${widthClass}`}>
          <header className="mb-5 rounded-[2rem] bg-white/90 px-5 py-4 text-center shadow-sm shadow-slate-200 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Cafe Shift</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight">Cafe Shift</h1>
              </div>
              <LanguageSwitcher />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <MobileNav />
        </div>
      </div>
    </I18nProvider>
  );
}
