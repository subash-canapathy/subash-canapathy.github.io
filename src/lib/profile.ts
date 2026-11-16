import type { ImageMetadata } from 'astro';
import { type CollectionEntry, getCollection, getEntry } from 'astro:content';
import { FALLBACK_LINKS } from '../consts';

export type Role = CollectionEntry<'roles'>;
export type Company = CollectionEntry<'companies'>['data'];

/** profile.yaml, with link fallbacks filled in. */
export async function getProfile() {
	const entry = await getEntry('profile', 'profile');
	if (!entry) throw new Error('src/content/profile/profile.yaml is missing: the Home hero and footer read from it.');
	const data = entry.data;
	return {
		...data,
		links: {
			linkedin: data.links.linkedin ?? FALLBACK_LINKS.linkedin,
			github: data.links.github ?? FALLBACK_LINKS.github,
			/** Only set once the real URL is in profile.yaml; the Instagram button is hidden until then. */
			instagram: data.links.instagram,
		},
	};
}

/* Company logos: src/assets/logos/<key>.svg|png */
const logoFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/logos/*.{svg,png,webp,jpg}', { eager: true });
const logos = new Map(
	Object.entries(logoFiles).map(([path, mod]) => [path.split('/').pop()!.replace(/\.\w+$/, ''), mod.default]),
);
// Wide wordmarks sit closer to the tile edge (DESIGN.md › Company logo tile).
const WIDE = new Set(['aws', 'comcast', 'emc']);

export function logoFor(company: Company) {
	const src = logos.get(company.logo);
	if (!src) throw new Error(`Logo "${company.logo}" (company "${company.id}") not found in src/assets/logos/. Add ${company.logo}.svg or ${company.logo}.png.`);
	return { src, wide: WIDE.has(company.logo), alt: `${company.name} logo` };
}

/* Dates */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ym = (s: string) => ({ y: Number(s.slice(0, 4)), m: Number(s.slice(5, 7)) });
/** "2024-09" → "Sep 2024" */
export const monthYear = (s: string) => `${MONTHS[ym(s).m - 1]} ${ym(s).y}`;
const nowYm = () => {
	const d = new Date();
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
/** "Sep 2024 – now" */
export const dateRange = (start: string, end: string | null) => `${monthYear(start)} – ${end ? monthYear(end) : 'now'}`;
/** "2 yrs 2 mos" */
export function duration(start: string, end: string | null): string {
	const a = ym(start);
	const b = ym(end ?? nowYm());
	const months = Math.max(1, (b.y - a.y) * 12 + (b.m - a.m));
	const y = Math.floor(months / 12);
	const m = months % 12;
	return [y ? `${y} yr${y > 1 ? 's' : ''}` : '', m ? `${m} mo${m > 1 ? 's' : ''}` : ''].filter(Boolean).join(' ');
}
/** "2024 – now", "2019 – 2021" */
export const yearRange = (start: string, end: string | null) => {
	const s = start.slice(0, 4);
	const e = end ? end.slice(0, 4) : 'now';
	return s === e ? s : `${s} – ${e}`;
};

export interface CareerGroup {
	company: Company; // the employer shown on the rail (the parent, when there is one)
	roles: Role[];
	start: string;
	end: string | null;
}

/**
 * Everything the Profile page, Home highlights and the resume need, validated.
 * Throws with a readable message when the content files disagree with each other.
 */
export async function getCareer() {
	const profile = await getProfile();
	const companies = (await getCollection('companies')).map((c) => c.data);
	const byId = new Map(companies.map((c) => [c.id, c]));
	const roles = (await getCollection('roles')).sort((a, b) => b.data.start.localeCompare(a.data.start));

	const companyOf = (role: Role) => {
		const c = byId.get(role.data.company);
		if (!c) throw new Error(`Role "${role.id}": company "${role.data.company}" is not in src/content/profile/companies.yaml.`);
		return c;
	};
	const employerOf = (role: Role) => {
		const c = companyOf(role);
		if (!c.parent) return c;
		const parent = byId.get(c.parent);
		if (!parent) throw new Error(`Company "${c.id}": parent "${c.parent}" is not in companies.yaml.`);
		return parent;
	};

	for (const c of companies) logoFor(c);
	for (const key of ['featured', 'highlight'] as const) {
		const seen = new Map<number, string>();
		for (const r of roles) {
			const order = r.data[key]?.order;
			if (order === undefined) continue;
			if (seen.has(order)) throw new Error(`Roles "${seen.get(order)}" and "${r.id}" both have ${key}.order ${order}. Each order number can be used once.`);
			seen.set(order, r.id);
		}
	}
	const current = roles.filter((r) => r.data.end === null);
	for (const r of current) {
		if (r.data.title !== profile.title) {
			throw new Error(`Current role "${r.id}" has title "${r.data.title}" but profile.yaml says "${profile.title}". Keep the two identical (the title is shown exactly as held).`);
		}
	}

	const main = roles.filter((r) => Number(r.data.start.slice(0, 4)) >= profile.earlier_roles_before);
	const earlier = roles.filter((r) => Number(r.data.start.slice(0, 4)) < profile.earlier_roles_before);

	// Consecutive roles at the same employer share one rail entry.
	const groups: CareerGroup[] = [];
	for (const role of main) {
		const employer = employerOf(role);
		const last = groups.at(-1);
		if (last && last.company.id === employer.id) {
			last.roles.push(role);
			last.start = role.data.start;
		} else {
			groups.push({ company: employer, roles: [role], start: role.data.start, end: role.data.end });
		}
	}

	const featured = roles.filter((r) => r.data.featured).sort((a, b) => a.data.featured!.order - b.data.featured!.order);
	const highlights = roles.filter((r) => r.data.highlight).sort((a, b) => a.data.highlight!.order - b.data.highlight!.order);

	return { profile, companies, roles, groups, earlier, featured, highlights, companyOf, employerOf };
}
