#!/usr/bin/env node
// Removes the GPS location from every photo under src/content/photos/ (in place, no re-encoding).
// Run with: npm run photos:strip-gps
import fs from 'node:fs';
import path from 'node:path';
import { readExif, stripGps } from './lib/exif.mjs';

const root = path.resolve('src/content/photos');
const walk = (dir) =>
	fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

let changed = 0;
for (const file of fs.existsSync(root) ? walk(root) : []) {
	if (!/\.jpe?g$/i.test(file)) continue;
	const buf = fs.readFileSync(file);
	if (!readExif(buf).hasGps) continue;
	stripGps(buf);
	if (readExif(buf).hasGps) {
		console.error(`could not clean ${path.relative(root, file)}: export it again without location`);
		process.exitCode = 1;
		continue;
	}
	fs.writeFileSync(file, buf);
	console.log(`location removed: ${path.relative(root, file)}`);
	changed++;
}
console.log(changed ? `Done: ${changed} photo(s) cleaned.` : 'No photo contains a location. Nothing to do.');
