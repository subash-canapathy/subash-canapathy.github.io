# subash.org

Personal site of Subash Canapathy: articles, profile (with resume PDF) and photography.
Static site built with [Astro](https://astro.build) and deployed to GitHub Pages by GitHub Actions.

## Publish an article

1. `git pull`
2. Copy `src/content/articles/_template/` to `src/content/articles/<slug>/`.
   The folder name becomes the URL: `/articles/<slug>/`.
3. Fill in the front matter at the top of `index.md` (title, description, date, tags; first tag is the
   primary label). Write the article below it in plain Markdown.
4. Put images in the article's `images/` folder and reference them relatively:
   `![Alt text](./images/figure.png "Caption")`. Add `{wide}` at the end of a caption for an 896px figure.
5. `git add . && git commit -m "Add <title>" && git push`

The site rebuilds and deploys in a couple of minutes. A missing or misspelled front-matter field fails
the build with a readable message, and the live site stays as it was.

Unfinished pieces: keep them in `drafts/` (never committed) or set `draft: true`.

## Update the profile

- Page-level content: `src/content/profile/profile.yaml`
- Employers: `src/content/profile/companies.yaml` (logos in `src/assets/logos/<key>.svg`)
- Roles: one folder per role in `src/content/profile/roles/`. Copy `src/content/profile/_templates/role.md`.

The Profile page, the Home page's Career Highlights and the resume PDF all regenerate from these files.

## Local preview (optional)

Requires Node 22.

```sh
npm install
npm run dev        # http://localhost:4321
npm run check      # type and content checks
npm run build      # production build into dist/
```

`/styleguide/` shows every component in light and dark mode (not linked, not indexed).

## Licence

Code: MIT (see `LICENSE`). Content (articles, photos, portrait, profile text, resume) © Subash Canapathy.
