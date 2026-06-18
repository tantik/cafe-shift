'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/use-i18n';

const navItems = [
  { href: '/shifts', labelKey: 'nav.shifts' },
  { href: '/recipes', labelKey: 'nav.recipes' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-[430px] items-center justify-between gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[46px] flex-1 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-green-700 text-white shadow-sm shadow-green-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
