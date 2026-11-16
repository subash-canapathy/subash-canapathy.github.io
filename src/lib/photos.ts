/**
 * The photo library: every image under src/content/photos/, newest first, plus the albums
 * from albums.yaml. Camera details and capture dates are read from each file's EXIF at build time.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { exifDate, readExif } from '../../scripts/lib/exif.mjs';
import { type FrameInfo, frameInfo } from './camera';

export interface Photo {
	/** Path under src/content/photos/, e.g. "2026/10/gastown-rain.jpg" */
	id: string;
	src: ImageMetadata;
	date: Date;
	frame?: FrameInfo;
	alt: string;
}
export interface Album {
	id: string;
	title: string;
	layout: 'masonry' | 'square';
	photos: Photo[];
	cover?: Photo;
}

const PHOTOS_DIR = path.join(process.cwd(), 'src/content/photos');
const MAX_EDGE = 3200; // px
const MAX_BYTES = 4 * 1024 * 1024;

const files = import.meta.glob<{ default: ImageMetadata }>('../content/photos/**/*.{jpg,jpeg,JPG,JPEG,png,webp}', { eager: true });

const norm = (p: string) => p.replace(/^\.?\//, '');

let cache: Photo[] | undefined;

export function getPhotos(): Photo[] {
	if (cache) return cache;
	const problems: string[] = [];
	const photos = Object.entries(files).map(([key, mod]) => {
		const id = key.replace('../content/photos/', '');
		const file = path.join(PHOTOS_DIR, id);
		const buf = fs.readFileSync(file);
		const exif = /\.jpe?g$/i.test(id) ? readExif(buf) : {};
		const src = mod.default;
		if (exif.hasGps) problems.push(`${id}: contains GPS location. This repo is public; run "npm run photos:strip-gps".`);
		if (Math.max(src.width, src.height) > MAX_EDGE || buf.length > MAX_BYTES) {
			problems.push(`${id}: ${src.width}×${src.height}, ${(buf.length / 1048576).toFixed(1)} MB is too large. Add photos with "npm run photos:add <file>" (it resizes to 2500px).`);
		}
		const date = exifDate(exif.dateTimeOriginal) ?? fs.statSync(file).mtime;
		const frame = frameInfo(exif);
		const year = date.getUTCFullYear();
		return { id, src, date, frame, alt: `Photograph by Subash Canapathy, ${year}` } satisfies Photo;
	});
	if (problems.length) {
		throw new Error(`Photos in src/content/photos/ need attention:\n  - ${problems.join('\n  - ')}`);
	}
	cache = photos.sort((a, b) => b.date.getTime() - a.date.getTime() || a.id.localeCompare(b.id));
	return cache;
}

export async function getAlbums(): Promise<Album[]> {
	const photos = getPhotos();
	const byId = new Map(photos.map((p) => [p.id, p]));
	// Albums appear in the order they are written in albums.yaml.
	const raw = fs.readFileSync(path.join(PHOTOS_DIR, 'albums.yaml'), 'utf8');
	const order = [...raw.matchAll(/^([A-Za-z0-9_-]+):/gm)].map((m) => m[1]);
	const entries = (await getCollection('albums')).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
	return entries.map((entry) => {
		const find = (ref: string, what: string) => {
			const photo = byId.get(norm(ref));
			if (!photo) throw new Error(`albums.yaml › ${entry.id}: ${what} "${ref}" is not a file in src/content/photos/. Check the path and spelling.`);
			return photo;
		};
		const inAlbum = [...new Set(entry.data.photos.map(norm))]
			.map((ref) => find(ref, 'photo'))
			.sort((a, b) => b.date.getTime() - a.date.getTime());
		const cover = entry.data.cover ? find(entry.data.cover, 'cover') : inAlbum[0];
		return { id: entry.id, title: entry.data.title, layout: entry.data.layout, photos: inAlbum, cover };
	});
}
