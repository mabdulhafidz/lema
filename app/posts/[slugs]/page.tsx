import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLocale, getTranslations } from 'next-intl/server';
import { getNotes } from '@/lib/notes';
import { extractHeadings, readingMinutes, slugify, textOf, meetingNumber } from '@/lib/toc';
import { TocAside, TocBar } from '@/components/TableOfContents';

const notesDir = path.join(process.cwd(), 'notes');

export const dynamicParams = false;

export async function generateStaticParams() {
  const files = await fs.readdir(path.join(notesDir, 'id'));
  return files
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slugs: f.replace(/\.md$/, '') }));
}

async function readNote(locale: string, slug: string) {
  for (const l of [locale, 'id']) {
    try {
      return await fs.readFile(path.join(notesDir, l, `${slug}.md`), 'utf8');
    } catch {}
  }
  return null;
}

export default async function Post({
  params,
}: {
  params: Promise<{ slugs: string }>;
}) {
  const { slugs } = await params;
  const locale = await getLocale();
  const t = await getTranslations('PostPage');
  const tHome = await getTranslations('HomePage');

  const raw = await readNote(locale, slugs);
  if (!raw) notFound();

  const md = raw
    .replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const notes = await getNotes(locale);
  const note = notes.find((n) => n.slug === slugs);
  const cover =
    note && 'cover' in note && typeof note.cover === 'string' ? note.cover : undefined;

  const headings = extractHeadings(md);
  const minutes = readingMinutes(md);

  // Give h2/h3 the same ids the TOC uses (matched in document order).
  let hi = 0;
  const idFor = (children: React.ReactNode) => {
    const text = textOf(children);
    const h = headings[hi];
    if (h && slugify(h.text) === slugify(text)) {
      hi++;
      return h.id;
    }
    return slugify(text);
  };

  const components: Components = {
    h2: ({ children }) => <h2 id={idFor(children)}>{children}</h2>,
    h3: ({ children }) => <h3 id={idFor(children)}>{children}</h3>,
    // Markdown image → figure with the alt text as caption
    img: ({ src, alt }) =>
      typeof src === 'string' ? (
        <span className="not-prose my-8 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ''}
            loading="lazy"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800"
          />
          {alt && (
            <span className="mt-2 block font-mono text-xs text-gray-500">{alt}</span>
          )}
        </span>
      ) : null,
  };

  const meta = [
    note ? `${tHome('meeting')} ${meetingNumber(note, 0)}` : null,
    note?.date,
    t('minRead', { count: minutes }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 md:px-12">
        <Link
          href="/"
          className="font-mono text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          {t('backToAll')}
        </Link>

        {cover && (
          <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-gray-100 lg:aspect-[21/8] dark:bg-gray-900">
            <Image src={cover} alt={note?.title ?? ''} fill priority sizes="100vw" className="object-cover" />
          </div>
        )}

        {/* <p className="mt-8 font-mono text-xs tracking-wide text-accent">{meta.toUpperCase()}</p> */}

        <div className="mt-6">
          <TocBar headings={headings} minutes={minutes} />
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
          <article
            id="article"
            className="prose prose-neutral max-w-2xl dark:prose-invert md:prose-lg
                       prose-headings:font-mono prose-headings:font-extrabold prose-headings:tracking-tight
                       prose-h1:text-3xl md:prose-h1:text-4xl
                       prose-h2:scroll-mt-24 prose-h3:scroll-mt-24
                       prose-p:font-serif prose-li:font-serif prose-td:font-serif
                       prose-blockquote:border-l-accent prose-blockquote:font-serif prose-blockquote:not-italic
                       prose-a:text-accent prose-strong:text-inherit prose-code:font-mono
                       prose-hr:border-gray-200 dark:prose-hr:border-gray-800"
          >
            <Markdown remarkPlugins={[remarkGfm]} components={components}>
              {md}
            </Markdown>
          </article>
          <aside>
            <TocAside headings={headings} minutes={minutes} />
          </aside>
        </div>
      </div>
    </main>
  );
}
