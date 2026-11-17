# subash.org

The source for [subash.org](https://subash.org), the personal website of Subash Canapathy. It has three parts:

- **Articles** on engineering leadership, AI and building teams.
- **Profile**: career history, work highlights and a downloadable resume PDF.
- **Photography**: street and travel photo albums.

## How it is built

The site is built with [Astro](https://astro.build) from Markdown and YAML files in `src/content/`, and
published to GitHub Pages by a GitHub Actions workflow on every push to `master`. The resume PDF is generated
during the build from the same profile data as the Profile page.

How I update content is in [AUTHORING.md](AUTHORING.md).

## Contributions

This is a personal repository. It exists only so I can maintain my own website, and it is public only
because GitHub Pages serves it from here.

**I do not accept contributions.** Pull requests and issues will be closed without review. If you spot a
problem on the site, or want to get in touch, use [subash.org/connect](https://subash.org/connect/).

## Licence

The code is under the MIT licence. The content (articles, photographs, portrait, profile text and resume)
is © Subash Canapathy, all rights reserved. See [LICENSE](LICENSE).
