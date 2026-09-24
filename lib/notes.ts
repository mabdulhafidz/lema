import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const notesRoot = path.join(process.cwd(), 'notes');

const dateLocales: Record<string, string> = {
  id: 'id-ID',
  en: 'en-US',
};

export type NoteMeta = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  author?: string;
  series?: string;
  status?: string;
  tags: string[];
};

export async function getNotes(locale: string): Promise<NoteMeta[]> {
  console.log(`Getting notes for locale: ${locale}`);
  const dir = path.join(notesRoot, locale);
  const files = await fs.readdir(dir);

  const notes = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (f) => {
        const slug = f.replace(/\.md$/, '');
        const raw = await fs.readFile(path.join(dir, f), 'utf8');
        const { data } = matter(raw);

        return {
          slug,
          title: data.title ?? slug,
          description: data.description,
          date: data.date
            ? new Date(data.date).toLocaleDateString(
                dateLocales[locale] ?? 'id-ID',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC',
                }
              )
            : undefined,
          author: data.author,
          series: data.series,
          status: data.status,
          tags: Array.isArray(data.tags) ? data.tags : [],
        } satisfies NoteMeta;
      })
  );

  return notes.sort((a, b) =>
    a.slug.localeCompare(b.slug, undefined, { numeric: true })
  );
}