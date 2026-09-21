import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const notesDir = path.join(process.cwd(), 'notes');

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

export async function getNotes(): Promise<NoteMeta[]> {
  const files = await fs.readdir(notesDir);

  const notes = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (f) => {
        const slug = f.replace(/\.md$/, '');
        const raw = await fs.readFile(path.join(notesDir, f), 'utf8');
        const { data } = matter(raw);

        return {
          slug,
          title: data.title ?? slug,
          description: data.description,
          date: data.date
            ? new Date(data.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })
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