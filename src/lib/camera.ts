/**
 * Camera details for the photo viewer's frame (DESIGN.md › Photo viewer).
 * Left of the strip: brand | model. Right: exposure line, lens beneath.
 * Everything comes from each photo's EXIF; nothing is typed per photo.
 */
export interface Exif {
	make?: string;
	model?: string;
	lensModel?: string;
	focalLength?: number;
	focalLength35?: number;
	fNumber?: number;
	exposureTime?: number;
	iso?: number;
}

export interface FrameInfo {
	/** 'fujifilm' shows the Fujifilm logo; anything else is shown as text. */
	brand?: string;
	model?: string;
	exposure?: string;
	lens?: string;
}

const LENS_MAX = 24;
// Fixed-lens cameras with tiny sensors: show the 35mm-equivalent focal length and no lens line.
const FIXED_LENS_MAKES = /^(apple|google|samsung|dji)$/i;

/** EXIF ExposureTime in seconds → "1/60s" (or "2s" / "0.8s" for long exposures). */
export function formatShutter(seconds: number | undefined): string | undefined {
	if (!seconds || seconds <= 0) return undefined;
	if (seconds >= 0.4) return `${Number(seconds.toFixed(1))}s`;
	return `1/${Math.round(1 / seconds)}s`;
}

/** Long lens names are cut after the aperture: "17-70mm F/2.8 DiIII-A VC RXD B070X" → "17-70mm F/2.8". */
export function shortLens(lens: string): string {
	if (lens.length <= LENS_MAX) return lens;
	const m = /^(.*?F\/?\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)/i.exec(lens);
	return m ? m[1]!.trim() : lens;
}

/** What the frame's strip shows for a photo, or undefined when the photo has no camera data. */
export function frameInfo(exif: Exif): FrameInfo | undefined {
	let make = exif.make?.trim();
	let model = exif.model?.trim();
	// Some exports have no Make and fold it into the model ("FUJIFILM X-M5").
	if (model && /^fujifilm\s+/i.test(model)) {
		make = make || 'FUJIFILM';
		model = model.replace(/^fujifilm\s+/i, '');
	}
	if (make && model && model.toLowerCase().startsWith(make.toLowerCase() + ' ')) model = model.slice(make.length + 1);

	const lensText = exif.lensModel?.trim();
	const fixedLens = (!!make && FIXED_LENS_MAKES.test(make)) || (!!lensText && !!model && lensText.includes(model));

	const focal = fixedLens ? (exif.focalLength35 ?? exif.focalLength) : exif.focalLength;
	const exposure = [
		focal ? `${Math.round(focal)}mm` : undefined,
		exif.fNumber ? `f/${exif.fNumber.toFixed(1)}` : undefined,
		formatShutter(exif.exposureTime),
		exif.iso ? `ISO${exif.iso}` : undefined,
	]
		.filter(Boolean)
		.join(' ');

	const info: FrameInfo = {
		brand: make ? (/^fujifilm$/i.test(make) ? 'fujifilm' : make) : undefined,
		model,
		exposure: exposure || undefined,
		lens: !fixedLens && lensText ? shortLens(lensText) : undefined,
	};
	return info.brand || info.model || info.exposure ? info : undefined;
}
