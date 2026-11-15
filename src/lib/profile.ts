import { getEntry } from 'astro:content';
import { FALLBACK_LINKS } from '../consts';

/** profile.yaml, with link fallbacks filled in. */
export async function getProfile() {
	const entry = await getEntry('profile', 'profile');
	if (!entry) {
		throw new Error('src/content/profile/profile.yaml is missing: the Home hero and footer read from it.');
	}
	const data = entry.data;
	return {
		...data,
		links: {
			linkedin: data.links.linkedin ?? FALLBACK_LINKS.linkedin,
			github: data.links.github ?? FALLBACK_LINKS.github,
			instagram: data.links.instagram ?? FALLBACK_LINKS.instagram,
		},
	};
}
