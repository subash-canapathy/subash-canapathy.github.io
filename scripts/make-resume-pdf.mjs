#!/usr/bin/env node
// Prints dist/profile/print/ to dist/SubashCanapathy-Resume.pdf with headless Chrome, then removes
// the print page from dist/. Runs automatically after `astro build` (see package.json).
// Needs Chrome or Chromium. If none is found: locally it skips with a note; in CI it fails.
import { execFile, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const dist = path.resolve('dist');
const printDir = path.join(dist, 'profile', 'print');
const out = path.join(dist, 'SubashCanapathy-Resume.pdf');

if (!fs.existsSync(path.join(printDir, 'index.html'))) {
	console.log('[resume] dist/profile/print/ not found; nothing to print.');
	process.exit(0);
}

const candidates = [
	process.env.CHROME_PATH,
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/Applications/Chromium.app/Contents/MacOS/Chromium',
	'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
	'google-chrome',
	'google-chrome-stable',
	'chromium',
	'chromium-browser',
].filter(Boolean);
const chrome = candidates.find((c) => (c.includes('/') ? fs.existsSync(c) : spawnSync('which', [c]).status === 0));

const finish = () => fs.rmSync(printDir, { recursive: true, force: true });

if (!chrome) {
	finish();
	const msg = '[resume] Chrome not found, so the resume PDF was not made. Install Google Chrome or set CHROME_PATH.';
	if (process.env.CI) {
		console.error(msg);
		process.exit(1);
	}
	console.warn(msg + ' (The live site builds it in CI.)');
	process.exit(0);
}

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
	let file = path.join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
	if (!file.startsWith(dist)) return res.writeHead(403).end();
	if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
	if (!fs.existsSync(file)) return res.writeHead(404).end();
	res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
	fs.createReadStream(file).pipe(res);
});

server.listen(0, '127.0.0.1', () => {
	const { port } = server.address();
	const args = [
		'--headless=new',
		'--disable-gpu',
		'--no-sandbox',
		'--no-pdf-header-footer',
		'--virtual-time-budget=5000',
		`--print-to-pdf=${out}`,
		`http://127.0.0.1:${port}/profile/print/`,
	];
	// Async on purpose: this process is also the web server Chrome reads the page from.
	execFile(chrome, args, { timeout: 90000 }, (err, _stdout, stderr) => {
		server.close();
		finish();
		if (err || !fs.existsSync(out)) {
			console.error('[resume] Chrome could not print the resume:', err?.message ?? stderr);
			process.exitCode = 1;
			return;
		}
		console.log(`[resume] wrote ${path.relative(process.cwd(), out)} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
	});
});
