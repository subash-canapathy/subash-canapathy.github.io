// Minimal EXIF reader for JPEG files: just the tags the site uses. No dependencies.
// Shared by the site build (src/lib/photos.ts) and the photo scripts in scripts/.

const TAGS_IFD0 = { 0x010f: 'make', 0x0110: 'model', 0x0112: 'orientation' };
const TAGS_EXIF = {
	0x829a: 'exposureTime',
	0x829d: 'fNumber',
	0x8827: 'iso',
	0x9003: 'dateTimeOriginal',
	0x920a: 'focalLength',
	0xa405: 'focalLength35',
	0xa433: 'lensMake',
	0xa434: 'lensModel',
};
const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

/** Locate the EXIF (TIFF) block and the XMP packet inside a JPEG buffer. */
function findSegments(buf) {
	const out = { tiff: -1, tiffLength: 0, xmp: '' };
	if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return out;
	let p = 2;
	while (p + 4 <= buf.length && buf[p] === 0xff) {
		const marker = buf[p + 1];
		if (marker === 0xda || marker === 0xd9) break; // image data starts
		const len = buf.readUInt16BE(p + 2);
		if (marker === 0xe1) {
			const head = buf.toString('latin1', p + 4, p + 4 + 29);
			if (head.startsWith('Exif\0\0') && out.tiff < 0) {
				out.tiff = p + 10;
				out.tiffLength = len - 8;
			} else if (head.startsWith('http://ns.adobe.com/xap/1.0/')) {
				out.xmp = buf.toString('latin1', p + 4, p + 2 + len);
			}
		}
		p += 2 + len;
	}
	return out;
}

function reader(buf, tiff) {
	const le = buf.toString('latin1', tiff, tiff + 2) === 'II';
	const u16 = (o) => (le ? buf.readUInt16LE(tiff + o) : buf.readUInt16BE(tiff + o));
	const u32 = (o) => (le ? buf.readUInt32LE(tiff + o) : buf.readUInt32BE(tiff + o));
	const i32 = (o) => (le ? buf.readInt32LE(tiff + o) : buf.readInt32BE(tiff + o));
	return { le, u16, u32, i32 };
}

/** Walk one IFD; calls fn(tag, type, count, valueOffset, entryOffset). Offsets are relative to the TIFF header. */
function walkIfd(r, ifdOffset, limit, fn) {
	if (!ifdOffset || ifdOffset + 2 > limit) return;
	const n = r.u16(ifdOffset);
	for (let i = 0; i < n; i++) {
		const e = ifdOffset + 2 + i * 12;
		if (e + 12 > limit) return;
		const tag = r.u16(e);
		const type = r.u16(e + 2);
		const count = r.u32(e + 4);
		const size = (TYPE_SIZE[type] ?? 1) * count;
		const valueOffset = size <= 4 ? e + 8 : r.u32(e + 8);
		if (valueOffset + size > limit) continue;
		fn(tag, type, count, valueOffset, e);
	}
}

function readValue(buf, tiff, r, type, count, o) {
	switch (type) {
		case 2: // ASCII
			return buf.toString('latin1', tiff + o, tiff + o + count).replace(/\0.*$/s, '').trim();
		case 3:
			return r.u16(o);
		case 4:
			return r.u32(o);
		case 5: {
			const den = r.u32(o + 4);
			return den ? r.u32(o) / den : undefined;
		}
		case 10: {
			const den = r.i32(o + 4);
			return den ? r.i32(o) / den : undefined;
		}
		default:
			return undefined;
	}
}

/**
 * Read the camera details from a JPEG buffer.
 * Returns {} when the file has no EXIF. `hasGps` is true when the file carries a location
 * (EXIF GPS block or GPS fields in XMP).
 */
export function readExif(buf) {
	const seg = findSegments(buf);
	const result = { hasGps: /GPSLatitude|GPSLongitude/.test(seg.xmp) };
	if (seg.tiff < 0) return result;
	const tiff = seg.tiff;
	const limit = Math.min(seg.tiffLength, buf.length - tiff);
	const r = reader(buf, tiff);
	let exifIfd = 0;
	let gpsIfd = 0;
	walkIfd(r, r.u32(4), limit, (tag, type, count, o) => {
		if (tag === 0x8769) exifIfd = r.u32(o);
		else if (tag === 0x8825) gpsIfd = r.u32(o);
		else if (TAGS_IFD0[tag]) result[TAGS_IFD0[tag]] = readValue(buf, tiff, r, type, count, o);
	});
	walkIfd(r, exifIfd, limit, (tag, type, count, o) => {
		if (TAGS_EXIF[tag]) result[TAGS_EXIF[tag]] = readValue(buf, tiff, r, type, count, o);
	});
	if (gpsIfd && gpsIfd + 2 <= limit && r.u16(gpsIfd) > 0) result.hasGps = true;
	for (const k of Object.keys(result)) if (result[k] === undefined || result[k] === '') delete result[k];
	return result;
}

/** "2024:03:27 16:08:30" → Date (treated as UTC so sorting is stable everywhere). */
export function exifDate(s) {
	const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(s ?? '');
	if (!m) return undefined;
	const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
	return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Remove the location from a JPEG buffer in place: zeroes the EXIF GPS block and blanks GPS
 * fields in XMP. The image data is untouched (no re-encoding). Returns true if anything changed.
 */
export function stripGps(buf) {
	let changed = false;
	const seg = findSegments(buf);
	if (seg.tiff >= 0) {
		const tiff = seg.tiff;
		const limit = Math.min(seg.tiffLength, buf.length - tiff);
		const r = reader(buf, tiff);
		let gpsIfd = 0;
		walkIfd(r, r.u32(4), limit, (tag, _t, _c, o) => {
			if (tag === 0x8825) gpsIfd = r.u32(o);
		});
		if (gpsIfd && gpsIfd + 2 <= limit) {
			const n = r.u16(gpsIfd);
			walkIfd(r, gpsIfd, limit, (_tag, type, count, o) => {
				const size = (TYPE_SIZE[type] ?? 1) * count;
				if (size > 4) buf.fill(0, tiff + o, tiff + o + size);
			});
			if (n > 0) {
				buf.fill(0, tiff + gpsIfd, tiff + gpsIfd + 2 + n * 12);
				changed = true;
			}
		}
	}
	// XMP: blank the values of any GPS attribute or element (same byte length, so offsets stay valid).
	let p = 2;
	while (p + 4 <= buf.length && buf[p] === 0xff && buf[p + 1] !== 0xda) {
		const len = buf.readUInt16BE(p + 2);
		if (buf[p + 1] === 0xe1 && buf.toString('latin1', p + 4, p + 32).startsWith('http://ns.adobe.com/xap/1.0/')) {
			const xmp = buf.toString('latin1', p + 4, p + 2 + len);
			const cleaned = xmp
				.replace(/(exif:GPS\w+=")([^"]*)(")/g, (_m, a, v, c) => a + ' '.repeat(v.length) + c)
				.replace(/(<exif:GPS\w+>)([^<]*)(<)/g, (_m, a, v, c) => a + ' '.repeat(v.length) + c)
				.replace(/exif:GPS/g, 'exif:Xps');
			if (cleaned !== xmp) {
				buf.write(cleaned, p + 4, 'latin1');
				changed = true;
			}
		}
		p += 2 + len;
	}
	return changed;
}
