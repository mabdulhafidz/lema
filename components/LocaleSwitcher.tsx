'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { setLocale } from '@/lib/actions/locale';

const locales = [
  { code: 'id', short: 'ID', label: 'Bahasa Indonesia' },
  { code: 'en', short: 'EN', label: 'English' },
] as const;

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function select(code: string) {
    setOpen(false);
    if (code === locale) return;
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative font-mono text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Bahasa: ${current.label}`}
        className="flex min-h-9 items-center gap-1.5 rounded-full px-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
      >
        <span className={pending ? 'animate-pulse' : ''}>{current.short}</span>
        <span className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 flex w-52 flex-col gap-0.5 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-black"
        >
          {locales.map(({ code, short, label }) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => select(code)}
                  className={`flex min-h-10 w-full items-center gap-3 rounded-md px-2.5 text-left text-[13px] transition-colors ${
                    active
                      ? 'bg-accent/10 font-bold text-black dark:text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                  }`}
                >
                  <span
                    className={`flex h-5 w-7 flex-none items-center justify-center rounded text-[10px] font-bold ${
                      active ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                    }`}
                  >
                    {short}
                  </span>
                  <span className="flex-1">{label}</span>
                  {active && <span className="text-accent" aria-hidden>✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}