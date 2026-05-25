import type { ReactNode } from "react";
import MobileNav from "@/components/mobile-nav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f1e6] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col px-4 pb-24 pt-6">
        <header className="mb-5 rounded-[2rem] bg-white/90 px-5 py-4 text-center shadow-sm shadow-slate-200 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Cafe Shift</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">Cafe Shift</h1>
        </header>
        <main className="flex-1">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
