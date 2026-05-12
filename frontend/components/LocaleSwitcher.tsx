'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';

export default function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      // Very simple routing logic: replace the first path segment
      const newPathname = pathname.replace(`/${locale}`, `/${nextLocale}`);
      router.replace(newPathname);
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-slate-200/80">
      <span className="sr-only">Change language</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={onSelectChange}
        className="bg-slate-900/60 text-sm text-slate-100 border border-slate-700 rounded px-2 py-1 outline-none"
      >
        <option value="en">English</option>
        <option value="am">አማርኛ</option>
      </select>
    </label>
  );
}
