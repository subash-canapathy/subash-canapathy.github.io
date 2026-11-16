// Site-wide constants. Personal links live in src/content/profile/profile.yaml (`links`);
// these are fallbacks used until PM supplies the real URLs.
export const SITE_TITLE = 'Subash Canapathy';
export const SITE_DESCRIPTION =
	'Articles, profile and photography of Subash Canapathy, Partner Director of Engineering at Microsoft.';

export const FALLBACK_LINKS = {
	linkedin: 'https://www.linkedin.com/in/subashcanapathy/',
	github: 'https://github.com/subash-canapathy',
} as const;

// Primary navigation (PLAN §4): Home · Articles · Profile · Photography.
export const NAV = [
	{ label: 'Home', href: '/' },
	{ label: 'Articles', href: '/articles/' },
	{ label: 'Profile', href: '/profile/' },
	{ label: 'Photography', href: '/photography/' },
] as const;
