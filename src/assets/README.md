# Site assets

Files here go through Astro's image pipeline (resized, compressed, fingerprinted) when a page
imports them. Anything that must keep an exact URL (favicon, share image) goes in `public/` instead.

| Path | What | Used by |
|---|---|---|
| `portrait.png` | Ink caricature, ink lines on transparency (960px) | `Portrait.astro`: Home (240 / 88px), Profile |
| `logos/<key>.svg` or `.png` | Company logos, keyed as in `src/content/profile/companies.yaml` | Profile timeline and Featured work tiles (white tile in both themes) |

Logo keys: `microsoft`, `m365-copilot`, `amazon`, `aws`, `comcast`, `emc`. To add a company, drop
`<key>.svg` (preferred) or a transparent `<key>.png` here and reference the key from `companies.yaml`.

Rules: the portrait is never inverted or filtered in dark mode (the disc around it changes instead).
Logos keep their own colours on a white tile.

Prepared 2026-11-15 from PM's originals: the caricature's paper background was made transparent;
the Microsoft square's grey backing was removed; the AWS and EMC images had a baked-in checkerboard,
cleared to transparency. AWS, EMC, Comcast and Amazon are raster; swap in official SVGs when available.
