// Content schemas for the whole site, in one place (PLAN §5a, §8a).
// A missing or misspelled field fails `astro build` / `astro check` with a readable message,
// so the live site is never touched by a broken push.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// "2024-01" (year-month). Role durations are computed from these.
const yearMonth = z
	.string()
	.regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM, for example 2024-01');

/* ------------------------------------------------------------------ */
/* Articles: src/content/articles/<slug>/index.md (folder = URL slug) */
/* ------------------------------------------------------------------ */
const articles = defineCollection({
	// Every bundle's index.md, except folders starting with "_" (the template).
	loader: glob({ base: './src/content/articles', pattern: ['**/index.md', '!_*'] }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().min(1),
				description: z.string().min(1).max(220, 'Keep the description to one line (220 characters max)'),
				date: z.coerce.date(),
				updated: z.coerce.date().optional(),
				// First tag = the article's primary label (Home eyebrows, Article eyebrow).
				tags: z.array(z.string().min(1)).min(1, 'Give the article at least one tag'),
				hero: image().optional(),
				hero_alt: z.string().optional(),
				pinned: z.boolean().default(false),
				draft: z.boolean().default(false),
				// Old Medium URL: the build generates a redirect stub at its path (PLAN §9).
				medium_url: z.url().optional(),
				original: z
					.object({
						publication: z.string().min(1),
						url: z.url(),
					})
					.optional(),
			})
			.strict()
			.refine((a) => !a.hero || !!a.hero_alt, {
				message: 'hero_alt is required when hero is set',
				path: ['hero_alt'],
			}),
});

/* ------------------------------------------------------------------ */
/* Profile (PLAN §8a)                                                  */
/* ------------------------------------------------------------------ */

const hats = ['Coach', 'Strategist', 'Builder', 'Operator'] as const;

// src/content/profile/profile.yaml: one entry (id "profile").
// Fields still waiting on PM content are optional for now; they become required in Phase 4.
const profile = defineCollection({
	loader: glob({ base: './src/content/profile', pattern: 'profile.yaml' }),
	schema: z
		.object({
			name: z.string().min(1),
			title: z.string().min(1), // exactly as held
			employer: z.string().min(1),
			location: z.string().optional(),
			links: z
				.object({
					linkedin: z.url().optional(),
					github: z.url().optional(),
					instagram: z.url().optional(),
				})
				.default({}),
			summary: z.array(z.string().min(1)).optional(),
			home_intro: z.string().min(1),
			tagline: z.string().min(1),
			tagline_highlight: z.string().min(1),
			impact: z
				.array(
					z.object({
						value: z.string().min(1),
						label: z.string().min(1),
						roles: z.array(z.string()).optional(),
					}),
				)
				.optional(),
			ai_transformation: z
				.object({
					text: z.string().min(1),
					practices: z.array(z.object({ name: z.string().min(1), article: z.string().min(1) })),
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
				.refine((rows) => rows.reduce((sum, r) => sum + r.percent, 0) === 100, {
					message: 'Working-style percents must add up to 100',
				})
				.optional(),
			competencies: z.record(z.string(), z.array(z.string().min(1))).optional(),
			earlier_roles_before: z.number().int().default(2016),
			education: z
				.array(z.object({ school: z.string(), degree: z.string(), years: z.string().optional() }))
				.optional(),
			patents: z
				.array(
					z.object({
						title: z.string(),
						company: z.string(),
						number: z.string().optional(),
						date: z.coerce.date().optional(),
						url: z.url().optional(),
					}),
				)
				.optional(),
			languages: z.array(z.string()).optional(),
		})
		.strict()
		.refine((p) => p.tagline.includes(p.tagline_highlight), {
			message: 'tagline_highlight must be a phrase that appears in tagline',
			path: ['tagline_highlight'],
		}),
});

// src/content/profile/companies.yaml: a list; each item needs an `id`.
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

// src/content/profile/roles/<yyyy-mm>-<company>-<slug>/index.md
const roles = defineCollection({
	loader: glob({ base: './src/content/profile/roles', pattern: ['**/index.md', '!_*'] }),
	schema: ({ image }) =>
		z
			.object({
				id: z.string().min(1),
				title: z.string().min(1),
				company: z.string().min(1), // id from companies.yaml (checked when the Profile page builds)
				start: yearMonth,
				end: yearMonth.nullable().default(null),
				location: z.string().optional(),
				scope: z.string().min(1),
				outcome: z.string().min(1),
				scale: z.record(z.string(), z.string()).optional(),
				open: z.boolean().default(false),
				featured: z
					.object({ order: z.number().int().min(1).max(3), title: z.string(), artifact: z.number().int().min(0).default(0) })
					.optional(),
				highlight: z
					.object({ order: z.number().int().min(1).max(4), label: z.string(), line: z.string() })
					.optional(),
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
			.refine((r) => r.end === null || r.start <= r.end, {
				message: 'start must not be after end',
				path: ['end'],
			}),
});

export const collections = { articles, profile, companies, roles };
