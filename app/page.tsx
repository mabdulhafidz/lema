import Link from 'next/link';
import { getNotes } from '@/lib/notes';
import {getLocale, getTranslations} from 'next-intl/server';

export default async function Home() {
  const locale = await getLocale();
  const notes = await getNotes(locale);
  const t = await getTranslations('HomePage');

  return (
    <main className="min-h-screen bg-white p-6 font-mono text-sm text-black md:p-24 dark:bg-black dark:text-white">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-bold sm:text-2xl">{t('title')}</h1>
        {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('description')}
        </p> */}

        <ul className="mt-10 flex flex-col gap-8">
          {notes.map((note) => (
            <li key={note.slug}>
              <Link href={`/posts/${note.slug}`} className="group block">
                <h2 className="text-lg font-bold group-hover:underline">
                  {note.title}
                </h2>

                {note.description && (
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {note.description}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  {[note.date, note.author, note.series, note.status]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                {note.tags.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}