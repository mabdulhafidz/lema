'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Heading } from '@/lib/toc';

function useReading(headings: Heading[]) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const article = document.getElementById('article');
      if (article) {
        const r = article.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        setProgress(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1);
      }
      let a = 0;
      headings.forEach((h, i) => {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 140) a = i;
      });
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atBottom ? headings.length - 1 : a);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [headings]);

  const jump = useCallback((id: string, offset: number) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth',
    });
    history.replaceState(null, '', `#${id}`);
  }, []);

  return { active, progress, jump };
}

function TocList({
  headings,
  active,
  onPick,
  twoCol = false,
}: {
  headings: Heading[];
  active: number;
  onPick: (id: string) => void;
  twoCol?: boolean;
}) {
  let n = 0;
  return (
    <ol className={twoCol ? 'grid gap-1 md:grid-cols-2' : 'flex flex-col gap-0.5'}>
      {headings.map((h, i) => {
        const on = i === active;
        const done = i < active;
        if (h.level === 2) n++;
        return (
          <li key={h.id} className={h.level === 3 ? 'pl-8' : ''}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                onPick(h.id);
              }}
              aria-current={on ? 'location' : undefined}
              className={[
                'flex min-h-9 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] leading-snug transition-colors',
                on
                  ? 'bg-accent/10 font-bold text-black dark:text-white'
                  : done
                    ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                    : 'text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-900',
              ].join(' ')}
            >
              {h.level === 2 && (
                <span
                  className={[
                    'flex size-5 flex-none items-center justify-center rounded-full text-[10px] transition-colors',
                    on
                      ? 'bg-accent text-white'
                      : done
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800',
                  ].join(' ')}
                >
                  {done ? '✓' : n}
                </span>
              )}
              <span>{h.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** Desktop (lg+): sticky sidebar — design 2a */
export function TocAside({ headings, minutes }: { headings: Heading[]; minutes: number }) {
  const t = useTranslations('PostPage');
  const { active, progress, jump } = useReading(headings);
  if (!headings.length) return null;
  const pct = Math.round(progress * 100);

  return (
    <nav aria-label={t('toc')} className="sticky top-24 hidden flex-col gap-4 font-mono lg:flex">
      <div className="flex items-baseline justify-between text-[11px] tracking-widest text-gray-400">
        <span>{t('toc').toUpperCase()}</span>
        <span>
          {active + 1} / {headings.length}
        </span>
      </div>
      <TocList headings={headings} active={active} onPick={(id) => jump(id, 96)} />
      <div className="flex flex-col gap-1.5 border-t border-gray-200 pt-3.5 dark:border-gray-800">
        <div className="flex justify-between text-[11px] text-gray-500">
          <span>{t('read', { pct })}</span>
          <span>{t('minLeft', { count: Math.max(0, Math.ceil(minutes * (1 - progress))) })}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="self-start rounded-full border border-black px-3 py-1.5 text-xs hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
      >
        ↑ {t('backToTop')}
      </button>
    </nav>
  );
}

/** Tablet & mobile (< lg): sticky collapsible bar — design 3a */
export function TocBar({ headings, minutes }: { headings: Heading[]; minutes: number }) {
  const t = useTranslations('PostPage');
  const { active, progress, jump } = useReading(headings);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!headings.length) return null;
  const pct = Math.round(progress * 100);

  return (
    <div className="sticky top-0 z-40 -mx-6 border-b border-gray-200 bg-white/95 font-mono backdrop-blur md:-mx-12 lg:hidden dark:border-gray-800 dark:bg-black/90">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-12 w-full items-center justify-between gap-4 px-6 text-left text-[13px] md:px-12"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="whitespace-nowrap text-[11px] tracking-widest text-gray-400">
            {t('toc').toUpperCase()}
          </span>
          <span className="truncate font-bold">{headings[active]?.text}</span>
        </span>
        <span className="flex flex-none items-center gap-3 text-xs text-gray-500">
          <span>
            {active + 1}/{headings.length}
          </span>
          <span className="text-sm text-black dark:text-white">{open ? '▴' : '▾'}</span>
        </span>
      </button>
      <div className="h-[3px] bg-gray-100 dark:bg-gray-900">
        <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${pct}%` }} />
      </div>
      {open && (
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto px-4 pb-4 pt-3 md:px-10">
          <TocList
            headings={headings}
            active={active}
            twoCol
            onPick={(id) => {
              setOpen(false);
              requestAnimationFrame(() => jump(id, 64));
            }}
          />
          <div className="flex justify-between px-2 text-[11px] text-gray-500">
            <span>{t('read', { pct })}</span>
            <span>{t('minLeft', { count: Math.max(0, Math.ceil(minutes * (1 - progress))) })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
