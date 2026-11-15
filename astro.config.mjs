// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// Preview URL until cutover; switch SITE_URL (or this default) to https://subash.org at cutover (PLAN §9).
const site = process.env.SITE_URL ?? 'https://subash-canapathy.github.io';

// Pages that exist only for review or for the PDF build: never in the sitemap.
const unlisted = ['/styleguide/', '/profile/print/'];

export default defineConfig({
	site,
	output: 'static',
	trailingSlash: 'always',
	build: { format: 'directory' },
	integrations: [
		sitemap({
			filter: (page) => !unlisted.some((p) => new URL(page).pathname === p),
		}),
	],
	// Newsreader + Inter only (PLAN §5). Downloaded at build time and self-hosted from /_astro/.
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
	],
});
