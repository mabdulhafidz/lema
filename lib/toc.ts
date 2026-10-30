import type { ReactNode } from 'react';
import { isValidElement } from 'react';

export type Heading = { id: string; text: string; level: 2 | 3 };

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function stripInlineMd(s: string) {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .trim();
}

/** Collects ## and ### headings (skips fenced code) with unique ids. */
export function extractHeadings(md: string): Heading[] {
  const out: Heading[] = [];
  const seen = new Map<string, number>();
  let inCode = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = stripInlineMd(m[2]);
    const base = slugify(text) || 'bagian';
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push({ id: n ? `${base}-${n}` : base, text, level: m[1].length as 2 | 3 });
  }
  return out;
}

export function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

export function readingMinutes(md: string) {
  return Math.max(1, Math.round(md.split(/\s+/).filter(Boolean).length / 200));
}

/** "Pertemuan 5" / "pertemuan-05" → "05" */
export function meetingNumber(
  note: { series?: string; title?: string; slug?: string },
  fallback: number,
) {
  const m = /(\d+)/.exec(note.series ?? '') ?? /(\d+)/.exec(note.title ?? '') ?? /(\d+)/.exec(note.slug ?? '');
  return String(m ? Number(m[1]) : fallback).padStart(2, '0');
}
