// Content schemas for the whole site, in one place. A missing or misspelled field fails
// `npm run check` / `npm run build` with a readable message, so a broken push never reaches the live site.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// "2024-01" (year-month). Role durations are computed from these.
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM in quotes, for example "2024-01"');

/* Articles: src/content/articles/<slug>/index.md (folder name = URL slug) */
const articles = defineCollection({
	// Every bundle's index.md, except folders starting with "_" (the template).
	loader: glob({ base: './src/content/articles', pattern: ['**/index.md', '!_*/**'] }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().min(1),
				description: z.string().min(1).max(220, 'Keep the description to one line (220 characters max)'),
				date: z.coerce.date(),
				updated: z.coerce.date().optional(),
				// First tag = the article's primary label.
				tags: z.array(z.string().min(1)).min(1, 'Give the article at least one tag'),
				hero: image().optional(),
				hero_alt: z.string().optional(),
				pinned: z.boolean().default(false),
				draft: z.boolean().default(false),
				// Old Medium URL: the build generates a redirect page at its path.
				medium_url: z.url().optional(),
				original: z.object({ publication: z.string().min(1), url: z.url() }).optional(),
			})
			.strict()
			.refine((a) => !a.hero || !!a.hero_alt, { message: 'hero_alt is required when hero is set', path: ['hero_alt'] }),
});

/* Profile */
const hats = ['Coach', 'Strategist', 'Builder', 'Operator'] as const;

const profile = defineCollection({
	loader: glob({ base: './src/content/profile', pattern: 'profile.yaml' }),
	schema: z
		.object({
			name: z.string().min(1),
			title: z.string().min(1), // exactly as held
			employer: z.string().min(1),
			location: z.string().optional(),
			links: z
				.object({ linkedin: z.url().optional(), github: z.url().optional(), instagram: z.url().optional() })
				.default({}),
			summary: z.array(z.string().min(1)).default([]),
			home_intro: z.string().min(1),
			tagline: z.string().min(1),
			tagline_highlight: z.string().min(1),
			impact: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).default([]),
			ai_transformation: z
				.object({
					text: z.string().min(1),
					practices: z.array(
						z.object({ name: z.string().min(1), article: z.string().min(1), title: z.string().optional() }),
					),
				})
				.optional(),
			working_style: z
				.array(
					z.object({
						hat: z.enum(hats),
						covers: z.string().min(1),
						percent: z.number().int().min(5).max(100).multipleOf(5, 'Working-style percents are multiples of 5'),
						line: z.string().optional(),
					}),
				)
				.refine((rows) => rows.length === 0 || rows.reduce((sum, r) => sum + r.percent, 0) === 100, {
					message: 'Working-style percents must add up to 100',
				})
				.default([]),
			competencies: z.record(z.string(), z.array(z.string().min(1))).default({}),
			earlier_roles_before: z.number().int().default(2016),
			education: z.array(z.object({ degree: z.string(), school: z.string(), years: z.string().optional() })).default([]),
			patents: z
				.array(
					z.object({
						title: z.string(),
						company: z.string(),
						number: z.string().optional(),
						date: yearMonth.optional(),
						url: z.url().optional(),
					}),
				)
				.default([]),
			languages: z.array(z.object({ name: z.string(), level: z.string().optional() })).default([]),
		})
		.strict()
		.refine((p) => p.tagline.includes(p.tagline_highlight), {
			message: 'tagline_highlight must be a phrase that appears in tagline',
			path: ['tagline_highlight'],
		}),
});

const companies = defineCollection({
	loader: file('src/content/profile/companies.yaml'),
	schema: z
		.object({
			id: z.string().min(1),
			name: z.string().min(1),
			logo: z.string().min(1), // key → src/assets/logos/<key>.svg|.png
			url: z.url().optional(),
			parent: z.string().optional(),
		})
		.strict(),
});

const roles = defineCollection({
	loader: glob({ base: './src/content/profile/roles', pattern: ['**/index.md', '!_*/**'] }),
	schema: ({ image }) =>
		z
			.object({
				id: z.string().min(1),
				title: z.string().min(1),
				company: z.string().min(1), // id from companies.yaml
				start: yearMonth,
				end: yearMonth.nullable().default(null),
				location: z.string().optional(),
				scope: z.string().min(1),
				outcome: z.string().min(1),
				scale: z.record(z.string(), z.string()).optional(),
				open: z.boolean().default(false),
				featured: z
					.object({
						order: z.number().int().min(1).max(3),
						title: z.string(),
						line: z.string().optional(),
						artifact: z.number().int().min(0).default(0),
					})
					.optional(),
				highlight: z.object({ order: z.number().int().min(1).max(4), label: z.string(), line: z.string() }).optional(),
				resume: z
					.object({ include: z.boolean().default(true), bullets: z.array(z.string()).max(4).optional() })
					.default({ include: true }),
				artifacts: z
					.array(
						z.discriminatedUnion('type', [
							z.object({ type: z.literal('video'), title: z.string(), url: z.url(), duration: z.string().optional() }),
							z.object({ type: z.literal('page'), title: z.string(), url: z.url(), screenshot: image() }),
							z.object({ type: z.literal('post'), title: z.string(), url: z.url() }),
							z.object({ type: z.literal('talk'), title: z.string(), url: z.url() }),
							z.object({ type: z.literal('article'), article: z.string().min(1) }),
						]),
					)
					.default([]),
			})
			.strict()
			.refine((r) => r.end === null || r.start <= r.end, { message: 'start must not be after end', path: ['end'] }),
});

/* Photography: src/content/photos/albums.yaml (the photos themselves are found by folder) */
const albums = defineCollection({
	loader: file('src/content/photos/albums.yaml'),
	schema: z
		.object({
			title: z.string().min(1),
			cover: z.string().optional(), // ./2026/10/photo.jpg; defaults to the album's newest photo
			layout: z.enum(['masonry', 'square']).default('masonry'),
			photos: z.array(z.string()).default([]),
		})
		.strict(),
});

export const collections = { articles, profile, companies, roles, albums };
