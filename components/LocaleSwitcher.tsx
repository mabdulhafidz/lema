'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { setLocale } from '@/lib/actions/locale';

type FlagProps = { className?: string };

function FlagID({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={className} aria-hidden="true">
      <rect width="3" height="3" fill="#E70011" />
      <rect y="1" width="3" height="1" fill="#FFFFFF" />
    </svg>
  );
}

function FlagEN({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <rect width="60" height="60" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3" />
      <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

const locales = [
  { code: 'id', label: 'Bahasa Indonesia', Flag: FlagID },
  { code: 'en', label: 'English', Flag: FlagEN },
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
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.label}`}
        className="flex items-center gap-1.5 rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
      >
        <current.Flag className="h-4 w-6 rounded-sm" />
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.5 7.5 10 12l4.5-4.5-1.4-1.4L10 9.2 6.9 6.1z" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-10 mt-1 flex flex-col bg-white dark:bg-black"
        >
          {locales.map(({ code, label, Flag }) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                onClick={() => select(code)}
                title={label}
                aria-label={label}
                className={`flex w-full items-center rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  code === locale ? 'opacity-50' : ''
                }`}
              >
                <Flag className="h-4 w-6 rounded-sm" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}