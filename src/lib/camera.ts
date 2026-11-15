/**
 * Camera details for the photo viewer's frame (CONTENT-LAYOUT.md §3).
 * Left of the strip: <brand logo> | <model>. Right: exposure line, lens beneath.
 * Values come from each photo's EXIF; nothing is typed per photo.
 */

/** Display names for camera models, keyed by the model exactly as EXIF reports it. */
export const MODEL_NAMES: Record<string, string> = {
	'X-H2S': 'XH2s',
};

export function displayModel(exifModel: string | undefined): string | undefined {
	const model = exifModel?.trim();
	if (!model) return undefined;
	return MODEL_NAMES[model] ?? model;
}

/** EXIF ExposureTime in seconds → "1/60s" (or "2s" / "0.5s" for long exposures). */
export function formatShutter(seconds: number | undefined): string | undefined {
	if (!seconds || seconds <= 0) return undefined;
	if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`;
	return `1/${Math.round(1 / seconds)}s`;
}

/** "23mm f/4.0 1/60s ISO800": the parts the photo has, in that order. */
export function exposureLine(exif: {
	focalLength?: number;
	fNumber?: number;
	exposureTime?: number;
	iso?: number;
}): string {
	return [
		exif.focalLength ? `${Math.round(exif.focalLength)}mm` : undefined,
		exif.fNumber ? `f/${exif.fNumber.toFixed(1)}` : undefined,
		formatShutter(exif.exposureTime),
		exif.iso ? `ISO${exif.iso}` : undefined,
	]
		.filter(Boolean)
		.join(' ');
}
