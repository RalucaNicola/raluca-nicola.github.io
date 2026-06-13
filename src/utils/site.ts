import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

/** The two top-level sections of the site. */
export const SECTIONS = {
  work: { label: 'Work' },
  hobbies: { label: 'Hobbies' },
} as const;

export type Section = keyof typeof SECTIONS;

export const SECTION_KEYS = Object.keys(SECTIONS) as Section[];

export function sectionLabel(section: Section): string {
  return SECTIONS[section].label;
}

/** Turn a human tag label ("Data visualization") into a URL slug ("data-visualization"). */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const base = import.meta.env.BASE_URL;

/** Join the site base path with a relative path, collapsing duplicate slashes. */
export function href(path: string): string {
  return (base + '/' + path).replace(/\/+/g, '/');
}

export function sectionHref(section: Section): string {
  return href(section);
}

export function articleHref(section: Section, id: string): string {
  return href(section + '/' + id);
}

export function tagHref(tag: string): string {
  return href('tags/' + tagSlug(tag));
}

export type ArticleEntry =
  | (CollectionEntry<'work'> & { section: 'work' })
  | (CollectionEntry<'hobbies'> & { section: 'hobbies' });

/** Load every published article across all sections, tagging each with its section. */
export async function loadAllArticles(): Promise<ArticleEntry[]> {
  const [work, hobbies] = await Promise.all([
    getCollection('work', ({ data }) => !data.draft),
    getCollection('hobbies', ({ data }) => !data.draft),
  ]);
  const all: ArticleEntry[] = [
    ...work.map((e) => ({ ...e, section: 'work' as const })),
    ...hobbies.map((e) => ({ ...e, section: 'hobbies' as const })),
  ];
  return all.sort((a, b) => +b.data.date - +a.data.date);
}

/** Collect every tag in use, with its display label, slug and article count. */
export async function collectTags() {
  const articles = await loadAllArticles();
  const map = new Map<string, { label: string; slug: string; count: number }>();
  for (const article of articles) {
    for (const tag of article.data.tags) {
      const slug = tagSlug(tag);
      if (!slug) continue;
      const existing = map.get(slug);
      if (existing) existing.count += 1;
      else map.set(slug, { label: tag, slug, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}
