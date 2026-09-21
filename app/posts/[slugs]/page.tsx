import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const notesDir = path.join(process.cwd(), 'notes');

export const dynamicParams = false; 

export async function generateStaticParams() {
  const files = await fs.readdir(notesDir);
  return files
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slugs: f.replace(/\.md$/, '') }));
}

export default async function Post({
  params,
}: {
  params: Promise<{ slugs: string }>;
}) {
  const { slugs } = await params;

  let raw: string;
  try {
    raw = await fs.readFile(path.join(notesDir, `${slugs}.md`), 'utf8');
  } catch {
    notFound();
  }

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
          ← Semua catatan
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