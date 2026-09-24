import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLocale, getTranslations } from 'next-intl/server';

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
    } catch {
      
    }
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

  const raw = await readNote(locale, slugs);
  if (!raw) notFound();

  const md = raw
    .replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  return (
    <main className="min-h-screen p-6 font-mono md:p-24 bg-white dark:text-white">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/"
          className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          {t('backToAll')}
        </Link>

        <article
          className="prose prose-sm md:prose-base dark:prose-invert mt-10 max-w-3xl
                     prose-headings:font-bold prose-headings:tracking-tight
                     prose-strong:text-inherit prose-hr:border-gray-800"
        >
          <Markdown remarkPlugins={[remarkGfm]}>{md}</Markdown>
        </article>
      </div>
    </main>
  );
}