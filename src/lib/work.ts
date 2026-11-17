import { type CollectionEntry, getCollection } from 'astro:content';
import { type Company, getCareer } from './profile';
import { url } from './url';

export type Work = CollectionEntry<'work'>;

/** /work/<slug>/ */
export const workUrl = (w: Work) => url(`/work/${w.id}/`);

/**
 * The Work highlights shown on the Profile page, in `order`, each with its company.
 * Throws with a readable message when the files disagree (unknown company or role, repeated order).
 */
export async function getWork() {
	const { companies, roles } = await getCareer();
	const byId = new Map(companies.map((c) => [c.id, c]));
	const items = (await getCollection('work')).sort((a, b) => a.data.order - b.data.order);
	const seen = new Map<number, string>();
	for (const w of items) {
		if (!byId.has(w.data.company)) throw new Error(`Work "${w.id}": company "${w.data.company}" is not in src/content/profile/companies.yaml.`);
		if (w.data.role && !roles.some((r) => r.data.id === w.data.role)) throw new Error(`Work "${w.id}": role "${w.data.role}" does not match any role id.`);
		if (seen.has(w.data.order)) throw new Error(`Work "${seen.get(w.data.order)}" and "${w.id}" both have order ${w.data.order}. Each order number can be used once.`);
		seen.set(w.data.order, w.id);
	}
	const companyOf = (w: Work): Company => byId.get(w.data.company)!;
	/** The employer named on the card: the company's parent when it has one (M365 Copilot → Microsoft). */
	const employerOf = (w: Work): Company => {
		const c = companyOf(w);
		return (c.parent && byId.get(c.parent)) || c;
	};
	return { items, companyOf, employerOf };
}
