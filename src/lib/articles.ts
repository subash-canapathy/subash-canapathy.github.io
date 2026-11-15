import { type CollectionEntry, getCollection } from 'astro:content';
import { url } from './url';

export type Article = CollectionEntry<'articles'>;

/** Published articles, newest first. Drafts are hidden from every list, page and feed. */
export async function getArticles(): Promise<Article[]> {
	const all = await getCollection('articles', ({ data }) => !data.draft);
	return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const articleUrl = (a: Article) => url(`/articles/${a.id}/`);

/** "Oct 14, 2026" (dates are calendar dates, so format in UTC). */
export function formatDate(d: Date): string {
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** "23 min read", from the Markdown body at ~230 words a minute. */
export function readingTime(a: Article): string {
	const words = (a.body ?? '').split(/\s+/).filter(Boolean).length;
	return `${Math.max(1, Math.round(words / 230))} min read`;
}

export const primaryTag = (a: Article) => a.data.tags[0];
