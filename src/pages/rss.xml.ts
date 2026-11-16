import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_TITLE } from '../consts';
import { getArticles } from '../lib/articles';

export async function GET(context: APIContext) {
	const articles = await getArticles();
	return rss({
		title: `${SITE_TITLE} · Articles`,
		description: 'Essays on engineering leadership, AI transformation and agentic product development.',
		site: context.site ?? 'https://subash-canapathy.github.io',
		trailingSlash: true,
		items: articles.map((a) => ({
			title: a.data.title,
			description: a.data.description,
			pubDate: a.data.date,
			categories: a.data.tags,
			link: `/articles/${a.id}/`,
		})),
	});
}
