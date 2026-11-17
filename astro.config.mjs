// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// Preview URL until cutover; switch SITE_URL (or this default) to https://subash.org at cutover (PLAN §9).
const site = process.env.SITE_URL ?? 'https://subash-canapathy.github.io';

// Only real pages go in the sitemap: not the style guide, the print page or the old-URL redirect pages.
/** @param {string} pathname */
const listed = (pathname) =>
	pathname === '/' || /^\/(articles|profile|photography)\//.test(pathname);
// Articles marked `unlisted: true` stay out of the sitemap too.
const unlisted = [
	'/profile/print/',
	...fs
		.readdirSync('src/content/articles', { withFileTypes: true })
		.filter((d) => d.isDirectory() && !d.name.startsWith('_'))
		.filter((d) => {
			const file = path.join('src/content/articles', d.name, 'index.md');
			return fs.existsSync(file) && /^unlisted:\s*true\b/m.test(fs.readFileSync(file, 'utf8').split(/^---$/m)[1] ?? '');
		})
		.map((d) => `/articles/${d.name}/`),
];

export default defineConfig({
	site,
	output: 'static',
	trailingSlash: 'always',
	build: { format: 'directory' },
	integrations: [
		sitemap({
			filter: (page) => {
				const pathname = new URL(page).pathname;
				return listed(pathname) && !unlisted.includes(pathname);
			},
		}),
	],
	// Code blocks take their colours from the design tokens (src/styles/prose.css).
	markdown: { shikiConfig: { theme: 'css-variables' } },
	// Newsreader + Inter for the site (PLAN §5); Nunito for the resume PDF only
	// (src/pages/profile/print/). Downloaded at build time and self-hosted from /_astro/.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Newsreader',
			cssVariable: '--font-serif',
			weights: [400, 500],
			styles: ['normal', 'italic'],
			subsets: ['latin'],
			display: 'swap',
			fallbacks: ['Georgia', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Inter',
			cssVariable: '--font-sans',
			weights: [400, 500, 600],
			styles: ['normal'],
			subsets: ['latin'],
			display: 'swap',
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Nunito',
			cssVariable: '--font-resume-sans',
			weights: [400, 600, 700, 800],
			styles: ['normal', 'italic'],
			subsets: ['latin'],
			display: 'block',
			fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
		},
	],
});
