import type { ImageMetadata } from 'astro';
import { type CollectionEntry, getCollection } from 'astro:content';
import { url } from './url';

export type Article = CollectionEntry<'articles'>;

export const PAGE_SIZE = 10;
/** How many tags get a pill on the Articles page; the rest sit under "More tags". */
export const TOP_TAGS = 4;

/**
 * Published articles, newest first. Drafts (`draft: true`) are shown while previewing with
 * `npm run dev` and are never built into the live site.
 */
export async function getArticles(): Promise<Article[]> {
	const all = await getCollection('articles', ({ data }) => import.meta.env.DEV || !data.draft);
	const pinned = all.filter((a) => a.data.pinned);
	if (pinned.length > 1) {
		throw new Error(`Only one article can be pinned at a time. Pinned now: ${pinned.map((a) => a.id).join(', ')}. Set "pinned: false" on all but one.`);
	}
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

export const primaryTag = (a: Article) => a.data.tags[0]!;

/* Tags */
export const tagSlug = (tag: string) =>
	tag
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
export const tagUrl = (tag: string) => url(`/articles/tag/${tagSlug(tag)}/`);

export interface TagCount {
	tag: string;
	slug: string;
	count: number;
}
/** Tags in use, most used first (ties alphabetical). Two spellings of one tag fail the build. */
export function tagCounts(articles: Article[]): TagCount[] {
	const map = new Map<string, TagCount>();
	for (const a of articles) {
		for (const tag of a.data.tags) {
			const slug = tagSlug(tag);
			const existing = map.get(slug);
			if (existing && existing.tag !== tag) {
				throw new Error(`Tag spelled two ways: "${existing.tag}" and "${tag}" (in ${a.id}). Use one spelling everywhere.`);
			}
			if (existing) existing.count++;
			else map.set(slug, { tag, slug, count: 1 });
		}
	}
	return [...map.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/* Images */
const bundleImages = import.meta.glob<{ default: ImageMetadata }>(
	'../content/articles/*/images/*.{png,jpg,jpeg,webp,gif,avif}',
	{ eager: true },
);
/**
 * The image used on cards and share previews: `hero` from the front matter, else the first
 * image in the article body. Undefined for articles without images (they get typographic cards).
 */
export function cardImage(a: Article): ImageMetadata | undefined {
	if (a.data.hero) return a.data.hero;
	const m = /!\[[^\]]*\]\(\s*\.\/(images\/[^)\s"]+)/.exec(a.body ?? '');
	if (!m) return undefined;
	return bundleImages[`../content/articles/${a.id}/${m[1]}`]?.default;
}

/** Up to `n` other articles, preferring ones that share tags, then the newest. */
export function related(article: Article, all: Article[], n = 2): Article[] {
	const tags = new Set(article.data.tags.map(tagSlug));
	return all
		.filter((a) => a.id !== article.id)
		.map((a) => ({ a, shared: a.data.tags.filter((t) => tags.has(tagSlug(t))).length }))
		.sort((x, y) => y.shared - x.shared || y.a.data.date.getTime() - x.a.data.date.getTime())
		.slice(0, n)
		.map((x) => x.a);
}
