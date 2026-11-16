#!/usr/bin/env node
// Adds photos to the site:  npm run photos:add -- ~/Pictures/export/*.jpg
//
// For each file it: fixes rotation, resizes to 2500px on the long edge, keeps the camera details
// (camera, lens, exposure, date), removes the GPS location, and saves the result as
// src/content/photos/<year>/<month>/<name>.jpg using the date the photo was taken.
// Your original files are not changed.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { exifDate, readExif, stripGps } from './lib/exif.mjs';

const MAX_EDGE = 2500;
const root = path.resolve('src/content/photos');
const inputs = process.argv.slice(2);

if (inputs.length === 0) {
	console.log('Usage: npm run photos:add -- <photo files>\nExample: npm run photos:add -- ~/Pictures/export/*.jpg');
	process.exit(1);
}

const added = [];
for (const input of inputs) {
	if (!/\.(jpe?g|png|webp|tiff?|heic)$/i.test(input)) {
		console.warn(`skipped  ${input} (not a photo file)`);
		continue;
	}
	const original = fs.readFileSync(input);
	const before = /\.jpe?g$/i.test(input) ? readExif(original) : {};
	const date = exifDate(before.dateTimeOriginal) ?? fs.statSync(input).mtime;
	const year = String(date.getUTCFullYear());
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const name = path
		.basename(input)
		.replace(/\.[^.]+$/, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	const dir = path.join(root, year, month);
	const file = path.join(dir, `${name}.jpg`);
	const rel = `./${year}/${month}/${name}.jpg`;
	if (fs.existsSync(file)) {
		console.warn(`skipped  ${rel} (already there; rename the file if this is a different photo)`);
		continue;
	}

	const buf = await sharp(original)
		.rotate() // apply the camera's rotation flag
		.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
		.keepExif()
		.jpeg({ quality: 86, mozjpeg: true })
		.toBuffer();
	const hadGps = stripGps(buf);
	const after = readExif(buf);
	if (after.hasGps) throw new Error(`${input}: could not remove the GPS location. Export the photo without location and try again.`);

	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(file, buf);
	const camera = [after.make, after.model].filter(Boolean).join(' ') || 'no camera data';
	console.log(`added    ${rel}  (${Math.round(buf.length / 1024)} KB, ${camera}${hadGps ? ', location removed' : ''})`);
	added.push(rel);
}

if (added.length) {
	console.log('\nThese photos now show in the camera roll. To put any of them in an album, add the path under');
	console.log('that album in src/content/photos/albums.yaml, for example:\n');
	for (const rel of added) console.log(`      - ${rel}`);
	console.log('\nThen: git add src/content/photos && git commit -m "Add photos" && git push');
}
