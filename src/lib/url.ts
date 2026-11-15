/**
 * Site-internal link, with Astro's base path and the trailing slash the site uses
 * (`trailingSlash: 'always'`). Use for every internal href so a base path or domain
 * change never means hunting through templates.
 *   url('/')               → '/'
 *   url('/articles')       → '/articles/'
 *   url('/rss.xml')        → '/rss.xml'   (files keep no slash)
 *   url('/profile/#work')  → '/profile/#work'
 */
export function url(path: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	const [pathPart = '/', hash] = path.split('#');
	let p = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
	const isFile = /\.[a-z0-9]+$/i.test(p);
	if (!isFile && !p.endsWith('/')) p += '/';
	return `${base}${p}${hash !== undefined ? `#${hash}` : ''}`;
}

/** True when `href` is the current page or (for section roots) a page under it. */
export function isCurrent(href: string, pathname: string): boolean {
	const clean = (s: string) => (s.endsWith('/') ? s : `${s}/`);
	const h = clean(href);
	const p = clean(pathname);
	if (h === clean(url('/'))) return p === h;
	return p === h || p.startsWith(h);
}
