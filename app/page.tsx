import Link from 'next/link';
import { getNotes } from '@/lib/notes';
import { getLocale, getTranslations } from 'next-intl/server';
import NoteCover from '@/components/NoteCover';
import { meetingNumber } from '@/lib/toc';

const coverOf = (note: object) =>
  'cover' in note && typeof note.cover === 'string' ? note.cover : undefined;

export default async function Home() {
  const locale = await getLocale();
  const notes = await getNotes(locale);
  const t = await getTranslations('HomePage');
  const [latest, ...older] = notes;

  return (
    <main className="flex-1 text-sm">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 md:px-12">
        <h1 className="sr-only">{t('title')}</h1>

        {latest && (
          <Link
            href={`/posts/${latest.slug}`}
            className="group grid items-center gap-6 py-6 md:gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:py-8"
          >
            <NoteCover
              variant="hero"
              cover={coverOf(latest)}
              number={meetingNumber(latest, notes.length)}
              index={0}
              alt={latest.title}
              label={t('meeting')}
            />
            <div className="flex flex-col gap-3.5">
              <h2 className="font-mono text-3xl font-extrabold leading-tight tracking-tight group-hover:underline lg:text-4xl">
                {latest.title}
              </h2>
              {latest.description && (
                <p className="font-sans text-base leading-relaxed text-gray-600 dark:text-gray-400">
                  {latest.description}
                </p>
              )}
              <p className="font-mono text-xs text-gray-500">
                {[latest.date, latest.author, latest.status].filter(Boolean).join(' · ')}
              </p>
              {latest.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {latest.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      #{tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Link>
        )}

        {older.length > 0 && (
          <section className="border-t border-gray-200 pt-8 dark:border-gray-800">
            <h2 className="font-mono text-xs font-bold tracking-widest text-gray-500">
              {t('previous').toUpperCase()}
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
              {older.map((note, i) => {
                const num = meetingNumber(note, notes.length - 1 - i);
                return (
                  <li key={note.slug}>
                    <Link href={`/posts/${note.slug}`} className="group flex flex-col gap-2.5">
                      <NoteCover
                        cover={coverOf(note)}
                        number={num}
                        index={i + 1}
                        alt={note.title}
                        label={t('meeting')}
                      />
                      <h3 className="font-mono text-[15px] font-bold leading-snug group-hover:underline">
                        {note.title}
                      </h3>
                      <p className="font-mono text-[11px] text-gray-500">
                        {[note.date, note.status].filter(Boolean).join(' · ')}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
