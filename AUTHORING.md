# Authoring guide for subash.org

How I update the site: articles, photos, the Profile page and the resume PDF. For what this repository is,
see the [README](README.md).

| Action | Where to edit… |
|---|---|
| Publish or change an article | `src/content/articles/<article>/index.md` (+ its `images/` folder) |
| Add photos or change albums | `src/content/photos/` and `src/content/photos/albums.yaml` |
| Change the Profile, Home intro or resume | `src/content/profile/` |

Then you commit and push. GitHub builds the site and publishes it in about two minutes. If anything is wrong
(a misspelled field, a missing image), the build stops with a message saying what to fix, and the live site
stays exactly as it was.

---

## Contents

1. [One-time setup](#1-one-time-setup)
2. [The everyday loop: preview, check, publish](#2-the-everyday-loop-preview-check-publish)
3. [Write an article](#3-write-an-article)
4. [Add photos](#4-add-photos)
5. [Update the profile](#5-update-the-profile)
6. [The resume PDF](#6-the-resume-pdf)
7. [Site-wide settings](#7-site-wide-settings)
8. [When the build fails](#8-when-the-build-fails)
9. [Where things live](#9-where-things-live)

---

## 1. One-time setup

You need [Node.js](https://nodejs.org) 22 or newer and Git. Google Chrome is optional (it is only used to
make the resume PDF on your computer; the live site makes it on GitHub).

```sh
git clone https://github.com/subash-canapathy/subash-canapathy.github.io.git
cd subash-canapathy.github.io
npm install
```

`npm install` downloads Astro and friends into `node_modules/` (ignored by Git). Run it again whenever
`package.json` or `package-lock.json` changes, for example after pulling a dependency update.

---

## 2. The everyday loop: preview, check, publish

### Preview while you write

```sh
npm run dev
```

Open <http://localhost:4321>. The page reloads every time you save a file. Stop it with `Ctrl+C`.

While `npm run dev` is running you also see **drafts** (they are never published), and
<http://localhost:4321/styleguide/> shows every component in light and dark mode.

If a page looks stale or doubled after you add files, hard-refresh the browser (`Cmd+Shift+R`). If that does
not help, stop the dev server and start it again.

### Check before you push (optional but quick)

```sh
npm run check    # checks every content file and the code
npm run build    # builds the whole site into dist/, exactly as GitHub will
npm run preview  # serves dist/ at http://localhost:4321 so you can click through the real build
```

### Publish

```sh
git add -A
git commit -m "Publish: <what changed>"
git push
```

Pushing to `master` starts the **Deploy** workflow. Watch it under the repository's **Actions** tab on
GitHub. A green tick means the site is live; a red cross means the build stopped. Open the failed run to read
the message (see [When the build fails](#8-when-the-build-fails)). Nothing changes on the live site until a
build succeeds.

To try something without publishing it, push a branch and open a pull request instead. The **Check**
workflow builds it (and attaches the built site as a download) without deploying.

The site also rebuilds itself on the 1st of every month, so durations like "2 yrs 3 mos" on the Profile stay
current.

---

## 3. Write an article

### 3.1 Create the article folder

Every article is a folder. The folder name becomes the address:
`src/content/articles/trust-by-default/` → `subash.org/articles/trust-by-default/`.

1. Copy the template folder:
   ```sh
   cp -R src/content/articles/_template src/content/articles/my-new-article
   ```
   Use lowercase words joined by hyphens for the folder name. Do not rename it after publishing (that would
   change the address and break links).
2. Open `src/content/articles/my-new-article/index.md`.
3. Fill in the block between the two `---` lines at the top (the "front matter", see below).
4. Write the article underneath it, in Markdown.
5. Put the article's images in `src/content/articles/my-new-article/images/`.

**Formatting reference:** a complete example of every element (headings, lists, images, wide figures,
quotes, tables, code) is published, unlisted, at
**<https://subash-canapathy.github.io/articles/formatting-reference/>** (`subash.org/articles/formatting-reference/`
once the domain moves; <http://localhost:4321/articles/formatting-reference/> in `npm run dev`). Its source is
`src/content/articles/formatting-reference/index.md`. Copy from it freely.

### 3.2 The front matter

```yaml
---
title: "Trust by default: Building social capital at work"
description: "On the growing disconnect from established structures, and why trust has to be the default."
date: 2022-01-24
tags: [Leadership, Culture, Trust]
hero: ./images/hero.png
hero_alt: "Two hands passing a baton"
pinned: false
draft: false
medium_url: "https://subash.org/trust-by-default-building-social-capital-at-work-1446e874ad81"
original:
  publication: "Towards AI"
  url: "https://pub.towardsai.net/…"
---
```

| Field | Required | What it does |
|---|---|---|
| `title` | yes | The article title. Use quotes if it contains a colon. |
| `description` | yes | One line (220 characters max). Shown on cards, in the article list, in RSS and when the link is shared. |
| `date` | yes | Publication date, `YYYY-MM-DD`. Articles are listed newest first by this date. |
| `tags` | yes | At least one. **The first tag is the article's label** on Home, the article page and cards. Each tag gets a page at `/articles/tag/<tag>/`. Spell a tag the same way every time; two spellings (e.g. "Agentic SDLC" and "Agentic sdlc") stop the build. |
| `hero` | no | A banner image shown above the text, from the article's `images/` folder. Leave it out to have no banner. |
| `hero_alt` | with `hero` | A short description of the hero image for screen readers. Required when `hero` is set. |
| `pinned` | no | `true` puts the article in the "Pinned" card at the top of the Articles page. Only one article can be pinned; the build stops if two are. |
| `draft` | no | `true` keeps the article off the live site. It still shows in `npm run dev`, marked "Draft". New articles from the template start as drafts. Set `false` to publish. |
| `unlisted` | no | `true` publishes the article at its address but leaves it out of everything else: Home, the Articles list, tag pages, "Keep reading", RSS and the sitemap, and tells search engines not to index it. Only people with the link find it. See 3.6. |
| `medium_url` | no | The article's old address on subash.org from the Medium days. The build creates a page at that old address that sends readers (and Google) to the new one. |
| `original` | no | Adds "Originally published in *publication*." under the title, linking to `url`. |
| `updated` | no | A later date if you revised the article (`YYYY-MM-DD`). |

Tags, dates, attribution, the hero and the Contents box all come from this block. **Do not repeat them in
the text.**

Images used on cards and share previews: the `hero`, or, when there is no hero, the first image in the text.
Articles without any image get a plain typographic card.

### 3.3 Writing the text

Plain Markdown. A blank line separates paragraphs.

| You write | You get |
|---|---|
| `**bold**`, `*italic*` | **bold**, *italic* |
| `[link text](https://example.com)` | a link |
| `## Section title` | a section heading. Every `##` heading is listed in the article's collapsed **Contents** box, so name them like a table of contents. |
| `### Smaller heading` | a sub-heading (not in Contents) |
| `- item` or `1. item` | bulleted or numbered list. `- **Lead-in:** rest of the sentence` gives the bold lead-in style. |
| `> A quote` | a quote with the rounded rule on the left |
| `---` on its own line | a horizontal rule |
| `` `code` `` | inline code |
| a table (see below) | a table that scrolls sideways on phones |
| a fenced code block (see below) | a code block with a language label and a Copy button |

**Images and captions.** Save the file in the article's `images/` folder and refer to it with `./images/`:

```md
![What the image shows, for screen readers](./images/spec-hydration.png "The caption under the image")
```

- The text in square brackets is the alt text (describe the image).
- The text in quotes is the **caption** shown under the image. Leave it out for no caption.
- End the caption with `{wide}` to let a detailed diagram break out of the reading column to full width
  (896 px on a desktop):
  `![Outline](./images/ieee-830.png "IEEE 830's outline, mapped to what an agent needs. {wide}")`
- PNG, JPG, WebP and GIF all work. The site resizes and compresses images itself, so add them at their
  natural size (up to about 2000 px wide is plenty).
- A wrong path stops the build with a message naming the file, so a broken image never goes live.
- Images keep their own colours in dark mode.

**Tables:**

```md
| § | Section | Draws from |
|---|---|---|
| 1 | Problem and appetite | Shape Up pitch |
| 2 | Context and existing system | IEEE 830 |
```

**Code blocks:** three backticks, then the language, then the code, then three backticks:

````md
```ts
export function hello() {
  return 'world';
}
```
````

Use `md`, `ts`, `js`, `json`, `yaml`, `sh`, `py` and so on. The language name shows in the bar above the code.

**Downloads** (a template file the reader can save): put the file in `public/files/` and link to it as
`[Download the template](/files/agentic-spec-template.md)`. Files in `public/` are published exactly as
they are, at that address.

### 3.4 Publish it

1. `npm run dev` and read it at `http://localhost:4321/articles/<folder-name>/`.
2. Set `draft: false`.
3. `git add -A && git commit -m "Publish: <title>" && git push`.

Once it is live (and not unlisted), the Home page, the Articles list, the tag pages, "Keep reading" on other articles, the RSS
feed and the sitemap all update by themselves.

### 3.5 Change or remove an article

The six articles that used to live on Medium were moved here on 2026-11-15 with their Medium publish dates,
text, images and captions. Each has a `medium_url`, so its old subash.org address keeps working. Edit them
like any other article.


- **Fix a typo or edit:** edit `index.md`, commit, push.
- **Unpublish:** set `draft: true`, commit, push. (Deleting the folder also works, but any links to it break.)
- **Pin a different article:** set `pinned: false` on the current one and `pinned: true` on the new one.

### 3.6 Hidden (unlisted) articles

For a page you want to share by link only (a reference, a page for one audience), set `unlisted: true`
and `draft: false`. The article goes live at `/articles/<folder-name>/`, but no list, feed, tag page or
search engine shows it. Its tags are shown as plain text, not links. Set `unlisted: false` later to list it
normally.

The formatting reference is published this way:
<https://subash-canapathy.github.io/articles/formatting-reference/>.

### 3.7 Keeping unfinished writing private

This repository is public, so anything you commit (even with `draft: true`) can be read on GitHub. For
writing you are not ready to show anyone, use the `drafts/` folder at the top of the repository. Git ignores
it completely. Move the article into `src/content/articles/` when you are ready.

---

## 4. Add photos

The Photography page has two parts: four **albums** at the top, and the **camera roll** below, which shows
every photo newest first. Tapping any photo opens it full screen in a paper "print" frame, with the camera
details underneath.

### 4.1 Add photos with one command

Export the photos you want from your editor (any size; JPEG is best), then:

```sh
npm run photos:add -- ~/Pictures/export/*.jpg
```

For each photo this:

- turns it the right way up and resizes it to 2500 px on the long edge;
- **keeps** the camera details (camera, lens, focal length, aperture, shutter speed, ISO, date taken);
- **removes the GPS location**, so the public repository never contains where a photo was taken;
- saves it as `src/content/photos/<year>/<month>/<name>.jpg`, using the date the photo was taken.

Your original files are not changed. The command prints the path of each photo it added, ready to paste
into an album.

The photos now appear in the camera roll. Commit and push to publish:

```sh
git add src/content/photos
git commit -m "Add photos"
git push
```

> You can also copy files into `src/content/photos/<year>/<month>/` by hand. The build refuses photos that
> still contain a GPS location or are larger than 3200 px / 4 MB, and tells you to run
> `npm run photos:strip-gps` or `npm run photos:add`.

### 4.2 Put photos in albums

Albums are listed in one file, `src/content/photos/albums.yaml`. To put a photo in an album, add its path
(relative to `src/content/photos/`) under that album's `photos:`:

```yaml
vancouver:
  title: Vancouver
  cover: ./2026/10/dscf5898-2.jpg     # optional; the album's newest photo is used if left out
  photos:
    - ./2026/10/dscf5898-2.jpg
    - ./2026/10/dscf5921.jpg

monochrome:
  title: Monochrome
  layout: square                      # optional; an even grid of square crops instead of the masonry
  photos:
    - ./2024/04/dscf1747.jpg          # the same photo can be in several albums; it is stored once
```

- **Album order on the page** = the order in this file.
- **Photo order inside an album** = newest first, by the date the photo was taken (not the order you list them).
- The part before the colon (`vancouver`) is the album's address: `/photography/vancouver/`. Keep it lowercase with hyphens.
- An album with no photos shows on the Photography page as "Soon" and gets no page.
- A path that does not exist, or a `cover` that is not a photo in the folder, stops the build with a message naming the album.

To **add a new album**, add a new block like the ones above. To **remove a photo**, delete its line from
`albums.yaml` and delete the file from `src/content/photos/`.

### 4.3 What the photo frame shows

Everything in the frame comes from the photo's own camera data; there is nothing to type.

- **Left:** the Fujifilm logo for Fujifilm cameras (any other make, such as Apple, Google or DJI, is written
  as text), then the camera model exactly as the camera records it (`X-T5`, `X-M5`).
- **Right:** `29mm f/4.0 1/1300s ISO400`, and the lens name underneath. Long lens names are shortened after
  the aperture (`17-70mm F/2.8 DiIII-A VC RXD B070X` → `17-70mm F/2.8`).
- **Phones and drones** (Apple, Google, Samsung, DJI): no lens line, and the focal length is the
  35 mm equivalent (`24mm`, not `6.8mm`).
- **No camera data** (scans, some edited exports): an even paper border all round, with no strip.

The rules live in `src/lib/camera.ts`. To show another brand's logo, add its official logo as
`src/assets/brands/<make>.svg` and extend the Fujifilm check in `src/components/PhotoGrid.astro`.

### 4.4 Size and limits

GitHub Pages allows a 1 GB site. Each published photo costs roughly 0.5–1 MB including the sizes the build
generates, so a few hundred photos fit comfortably. Keep originals in Google Photos; the site is a showcase.

---

## 5. Update the profile

Everything on the Profile page, the Home page's intro and **Career Highlights**, and the **resume PDF** comes
from `src/content/profile/`:

```
src/content/profile/
  profile.yaml          ← name, title, summary, work highlights intro, how I work, education, patents, languages
  companies.yaml        ← employers: name and logo
  roles/                ← one folder per role
    2024-09-microsoft-copilot/index.md
    2022-01-microsoft-viva/index.md
    …
  _templates/role.md    ← copy this to add a role
```

The resume PDF has its own section: [6. The resume PDF](#6-the-resume-pdf).

### Which file feeds which part of the page

Read the Profile page top to bottom; each row says where that part is stored and what to edit. "Role" means a
role's `index.md` in `src/content/profile/roles/` (see 5.2).

| Part of the page | Stored in | What to change |
|---|---|---|
| **Masthead:** name and title line | `profile.yaml` | `name`, `title`, `employer`. `title` must match your current role's `title`. |
| Masthead: paragraphs | `profile.yaml` | `summary` (one list item per paragraph) |
| Masthead: location, LinkedIn, GitHub | `profile.yaml` | `location`, `links` |
| Masthead: portrait | `src/assets/portrait.png` | replace the image file (same name) |
| Masthead: Resume PDF button | made by the build | see [section 6](#6-the-resume-pdf) |
| **Work highlights:** the band under the masthead | `profile.yaml` + `src/content/work/` | `highlights_intro` (`title`, `text`) for the intro; one folder per highlight in `src/content/work/` for the three cards (see 5.5) |
| **How I work:** Working style chart | `profile.yaml` | `working_style` (`hat`, `percent` in steps of 5, adding to 100; optional `line:`) |
| How I work: Executive competencies | `profile.yaml` | `competencies` (group name → list of pills) |
| **Experience:** company headings and logos | `companies.yaml` + `src/assets/logos/` | see 5.3 |
| Experience: each role card (collapsed) | role | `title`, `start`, `end`, `scope`, `location`, `outcome` |
| Experience: each role card (expanded) | role | the Markdown text below the `---` ("What I built"), `scale`, `artifacts` (5.4) |
| Experience: which card starts open | role | `open: true` |
| Experience: "Before …" (earlier roles) | `profile.yaml` + roles | `earlier_roles_before` sets the cut-off year; roles that started before it are folded in here |
| **Sidebar:** Education, Patents, Languages | `profile.yaml` | `education`, `patents`, `languages` |

The same files also feed the **Home page**:

| Part of Home | Stored in | What to change |
|---|---|---|
| Title line ("Partner Director of Engineering, Microsoft") and name | `profile.yaml` | `title`, `employer`, `name` |
| Tagline and its yellow highlight | `profile.yaml` | `tagline`, `tagline_highlight` (must be a phrase inside `tagline`) |
| Intro paragraph | `profile.yaml` | `home_intro` |
| Career Highlights (four items) | roles | a `highlight` block on up to four roles (`order` 1–4, `label`, `line`) |

After any change, save and look at <http://localhost:4321/profile/> (and `/` for Home) in `npm run dev`. If a
rule is broken (a duplicate `order`, percentages not adding to 100, a missing logo, a title mismatch), the
preview and the build stop with a message saying what's wrong.

### 5.1 `profile.yaml`

Open it and edit the text. Each field is commented. The main ones:

| Field | Where it shows |
|---|---|
| `name`, `title`, `employer` | Home title line, Profile masthead, resume header. **Keep `title` exactly as held**; the build checks that the current role's title matches it. |
| `location` | Profile masthead and resume header |
| `links.linkedin`, `links.github`, `links.instagram` | Buttons and footer links. LinkedIn points to your profile (`https://www.linkedin.com/in/subashcanapathy/`). **Instagram is a placeholder until you fill it in;** the Instagram button stays hidden until then. |
| `tagline`, `tagline_highlight` | Home page. `tagline_highlight` must be a phrase that appears in `tagline`; it gets the yellow highlighter. |
| `home_intro` | The paragraph under the tagline on Home |
| `summary` | The Profile masthead paragraphs, and the Summary in the resume. One list item per paragraph. |
| `working_style` | The 20-block "Working style" chart. Each `percent` is a multiple of 5 and they must add up to 100. Add `line:` to a row to replace its description. |
| `competencies` | The pill groups under "Executive competencies" (and a comma list in the resume) |
| `earlier_roles_before` | Roles that started before this year are folded into "Earlier roles" |
| `education`, `patents`, `languages` | The Profile page sidebar, and the bottom row of the resume |

A note on YAML: text with a colon (`:`), a `#`, or starting with a quote or `-` must be in quotes. Long text
can use `>-` and continue on indented lines underneath (see `home_intro`). Indentation matters: use spaces,
never tabs.

### 5.2 Roles

Each role is a folder in `src/content/profile/roles/` with an `index.md`. The folder name is only for
sorting (start date first); it never appears on the site.

```markdown
---
id: copilot                          # short, unique, never changes
title: Partner Director of Engineering
company: m365-copilot                # an id from companies.yaml
start: "2024-09"                     # YYYY-MM, in quotes
end: null                            # null = current role; otherwise "YYYY-MM"
location: Vancouver
scope: "AI Upskilling, People & Work Intelligence for M365 Copilot"
outcome: "Launched People Skills, Learning Agent and People Intelligence for WorkIQ."
scale:                               # optional "Scale & architecture" list, any labels, in order
  Org: "Three product teams, a workforce of 140"
  Regions: "North America, India, LATAM"
open: true                           # expanded when the Profile page opens
highlight:                           # optional: one of the four Home "Career Highlights"
  order: 1
  label: "Microsoft 365 Copilot"
  line: "…"
resume:
  include: true                      # false hides the role from the PDF only
  bullets:                           # up to 4 short bullets for the PDF
    - "…"
artifacts: []                        # see 5.4
---

- The "What I built" write-up shown when the role card is expanded. Plain Markdown;
  a few bullets or short paragraphs.
```

What each part feeds:

- **Collapsed role card:** `title`, dates (from `start`/`end`), `scope`, `location`, `outcome`.
- **Expanded card:** the Markdown text ("What I built"), `scale` and `artifacts`.
- **Dates and durations** ("Sep 2024 – now · 2 yrs 2 mos") are worked out from `start`/`end`.
- Consecutive roles at the same employer sit under one company on the timeline. A product tile such as
  `m365-copilot` counts as part of its parent (`microsoft`), see `companies.yaml`.
- **Home Career Highlights** show the roles with a `highlight` block, in `order` (use 1–4).
- Two roles with the same `highlight.order` stop the build.

**Starting a new job:**

1. Copy `src/content/profile/_templates/role.md` to `src/content/profile/roles/<yyyy-mm>-<company>-<name>/index.md`.
2. Fill it in, with `end: null`.
3. On the role you are leaving, set `end: "YYYY-MM"` and, if you like, move `open: true` and the
   `highlight` block across.
4. If the job title changed, update `title` in `profile.yaml` too (the build insists they match).
5. If the employer is new, see 5.3.

### 5.3 Companies and logos

`companies.yaml` lists each employer once:

```yaml
- { id: microsoft, name: Microsoft, logo: microsoft, url: "https://www.microsoft.com" }
- { id: m365-copilot, name: "Microsoft 365 Copilot", logo: m365-copilot, parent: microsoft }
```

`logo` is a file name in `src/assets/logos/`: `logo: microsoft` uses `src/assets/logos/microsoft.svg` (or
`.png`). To add a company, drop its official logo there (SVG preferred, or a PNG with a transparent
background) and add a line here. A missing logo file stops the build with a message saying which one.
Logos sit on a white tile in both light and dark mode.

### 5.4 Artifacts (videos, product pages, posts, talks, articles)

Add these to a role's `artifacts:` list (or a work highlight's, 5.5). They appear in the expanded role card
and at the bottom of a work highlight page.

```yaml
artifacts:
  - { type: video, title: "People Skills demo", url: "https://www.youtube.com/watch?v=…", duration: "3:12" }
  - { type: page,  title: "Amazon MWAA", url: "https://aws.amazon.com/managed-workflows-for-apache-airflow/", screenshot: ./shots/mwaa.png }
  - { type: post,  title: "Launch announcement", url: "https://aws.amazon.com/blogs/…" }
  - { type: talk,  title: "re:Invent talk", url: "https://…" }
  - { type: article, article: towards-frontier-teams-human-agent-ratios }
```

- `page` needs a `screenshot`: save it in a `shots/` folder inside the role's folder.
- `article` is the folder name of one of your articles; it links to it on this site.
- Videos are links (they open on YouTube); nothing is embedded, so the page stays fast.

---

### 5.5 Work highlights (the three project pages)

The band under the Profile masthead shows three cards, one per folder in `src/content/work/`, in `order`.
Each card opens its own page at `/work/<folder-name>/`; the Markdown below the `---` is that page's story.

```markdown
---
title: Amazon MWAA
company: aws                  # an id from companies.yaml (logo; the kicker shows the parent employer)
years: "2019 – 2021"          # shown on the card and the page
order: 2                      # 1–3, each used once
role: mwaa                    # optional: the role id this belongs to
hook: "One line for the card, 200 characters max."
takeaway: "Optional pull quote near the top of the page."
artifacts: []                 # same kinds as 5.4
---

The story: plain Markdown with ## headings.
```

A duplicate `order`, an unknown `company` or `role` stops the build with a message.

## 6. The resume PDF

The **Resume PDF** button on the Profile page downloads `/SubashCanapathy-Resume.pdf`. You never make or
upload this file yourself: the build writes it from the same profile files as the Profile page (section 5),
so the site and the resume can't drift apart.

### 6.1 How it is made

1. `src/pages/profile/print/index.astro` lays the resume out as a print page, using your profile data.
2. `npm run build` builds the site, then runs `scripts/make-resume-pdf.mjs`, which opens that page in headless
   Chrome, prints it to `dist/SubashCanapathy-Resume.pdf`, and removes the print page from the published site.
3. On GitHub this happens on every push, so the live PDF is always current. On your computer it happens only if
   Google Chrome (or Chromium/Edge) is installed; otherwise the build skips the PDF with a note and carries on.

### 6.2 Preview it while you edit

Run `npm run dev` and open <http://localhost:4321/profile/print/>. It updates as you save. Use the browser's
**Print → preview** to check page breaks. To see the exact PDF, run `npm run build` and open
`dist/SubashCanapathy-Resume.pdf`.

### 6.3 Edit the words in the resume

Every line in the PDF comes from the text files in `src/content/profile/`. Nothing is typed into the layout
file, so to change a paragraph or a bullet, edit the file below and rebuild (or preview it, 6.2).

| To change… | Open | Edit |
|---|---|---|
| Your name or the job title line | `profile.yaml` | `name`, `title`, `employer` |
| The contact line (icons under the title) | `profile.yaml` | `location`, `contact.email`, `contact.phone`, `links.linkedin` |
| The two summary paragraphs | `profile.yaml` | `summary` (one list item per paragraph) |
| Competencies | `profile.yaml` | `competencies` (one line per group) |
| Patents, Education, Languages | `profile.yaml` | `patents`, `education`, `languages` |
| A role's title or location | `roles/<folder>/index.md` | `title`, `location` |
| A company's name | `companies.yaml` | `name` |
| The italic line under a role | `roles/<folder>/index.md` | `scope` |
| A role's first bullet | `roles/<folder>/index.md` | `outcome` |
| A role's other bullets | `roles/<folder>/index.md` | `resume:` → `bullets:` (up to 4) |
| An "Earlier" one-liner (roles before `earlier_roles_before`) | `roles/<folder>/index.md` | `outcome` |
| Leave a role out of the PDF | `roles/<folder>/index.md` | `resume: { include: false }` |

Role folders are named by start date and company, for example `roles/2024-09-microsoft-copilot/` (current
role), `roles/2022-01-microsoft-viva/` and `roles/2019-10-aws-mwaa/`. The fields sit in the block between the
`---` lines at the top of each `index.md`.

Some of these fields appear on the Profile page as well: `summary`, `title`, `location`, `scope` and `outcome`.
Changing them changes the site too. `resume.bullets` and `contact` are used by the PDF only.

### 6.4 What goes into each part of the resume

The layout is a single column set in Nunito: a header with your name, title and contact line, then the summary,
competencies and experience, with education, patents and languages side by side at the end. Roles can break
across pages between bullets, never in the middle of one, and a role's heading always stays with its first bullets.

| Resume part | Where on the page | Comes from |
|---|---|---|
| Name and title line | header, left | `profile.yaml`: `name`, `title`, `employer` |
| Summary | under the header, no heading | `profile.yaml` → `summary` (one paragraph per list item) |
| Experience | after Competencies | each role: years from `start`/`end`, `title`, company (from `companies.yaml`, shown as "Employer · Product" for product tiles such as AWS), `location`, `scope` in italics, then `outcome` as the first bullet and up to 4 `resume.bullets` |
| Experience, earlier roles | "Earlier", one line each, at the end of Experience | roles that started before `earlier_roles_before`: title, company, location and `outcome`, no bullets |
| Education | bottom row, left | `profile.yaml` → `education` (`degree`, `school`, `years`) |
| Patents | own section before the bottom row, two per row (room for four on page 2) | `profile.yaml` → `patents` (`title`, `company`, `number`, year of `date`) |
| Contact | light line under the title, with icons | `location`, `contact.email`, `contact.phone` (both resume only), subash.org, `links.linkedin`. GitHub is left off the PDF. |
| Competencies | under the summary | `profile.yaml` → `competencies` (one line per group) |
| Languages | bottom row, right | `profile.yaml` → `languages` |

To leave a role out of the PDF but keep it on the Profile page, set `resume: { include: false }` in that
role's `index.md`. The Markdown write-up ("What I built"), `scale`, `artifacts`, `highlight` and
`working_style` are Profile-page only and never appear in the PDF.

### 6.5 Change the layout (or match a template)

The layout and the content are separate: **content** lives in `src/content/profile/` (section 5), **layout**
lives in one file, `src/pages/profile/print/index.astro`. Changing the layout never means retyping content.

In that file:

- **Order of sections:** the HTML between `<body>` and `</body>`. Move a whole `<section>…</section>` block to
  reorder; delete one to drop it.
- **Fonts, sizes, spacing, colours, rules:** the `<style is:global>` block at the bottom. The colours are
  variables at its top (`--ink`, `--muted`, `--accent`, `--rule`). The resume font (Nunito) is set in
  `astro.config.mjs` as `--font-resume-sans` and loads on this page only.
- **Paper size and margins:** `@page { size: Letter; margin: … }` in that style block; use `size: A4` for A4.
- **Page breaks:** add `break-before: page;` to a section's style to force it onto a new page, or
  `break-inside: avoid;` to keep a block together. Roles deliberately do not use it, so a long role flows onto
  the next page instead of leaving a gap; only single bullets and the role heading are kept whole.

To make it match a resume template you like: give Claude the template (PDF, Word file or a screenshot) and ask
it to restyle `src/pages/profile/print/index.astro` to match. Your data stays where it is; only the layout file
changes. If the template has a section the data doesn't have yet (say, "Board roles"), that needs a new field in
`profile.yaml` and a rule for it in `src/content.config.ts` as well.

### 6.6 Use your own PDF instead

If you'd rather upload a resume you made elsewhere:

1. Save it as `public/SubashCanapathy-Resume.pdf` (exactly that name).
2. In `package.json`, change the `build` line to `"build": "astro build"` (remove
   `&& node scripts/make-resume-pdf.mjs`). Without this step the build overwrites your file with the generated one.
3. Commit both and push.

From then on, updating the resume means replacing that file. To go back to the generated PDF, delete the file
and restore the `build` line.

### 6.7 If the PDF isn't made

- **On your computer:** "Chrome not found" means Chrome isn't installed where the script looks. Install Google
  Chrome, or point to another Chromium-based browser with
  `CHROME_PATH="/path/to/browser" npm run build`. The rest of the site still builds.
- **On GitHub:** a missing browser fails the build on purpose, so the live site never ships without a resume.
  The failed run's log ends with the `[resume]` message.

---

## 7. Site-wide settings

- **Personal links** (LinkedIn, GitHub, Instagram): `src/content/profile/profile.yaml` → `links`.
- **Site address:** `astro.config.mjs` → `site`. Change it to `https://subash.org` when the domain moves over
  (or set the `SITE_URL` environment variable in the workflows).
- **Navigation labels:** `src/consts.ts`. Photography only appears in the navigation once there is at least
  one photo.
- **Favicon and default share image:** `public/favicon.svg`, `public/favicon.ico`,
  `public/apple-touch-icon.png`, `public/og-default.png`. Files in `public/` are published exactly as they
  are, at the same name.
- **Colours, fonts, spacing:** `src/styles/tokens.css` (the design tokens from the design canvas).
- **Old Medium addresses:** besides each article's `medium_url`, `/about`, `/archive`, `/latest`, `/feed` and
  `/@subashcanapathy` redirect to the matching new page (`src/pages/[legacy].astro`). Anything else that
  does not exist shows the 404 page, which points to the article list.

---

## 8. When the build fails

`npm run check` / `npm run build` (and the GitHub Actions log) print what is wrong and in which file. The
usual ones:

| Message mentions | What to do |
|---|---|
| `title`/`description`/`date`/`tags` … `Required` | The article's front matter is missing that field, or it is misspelled. |
| `Unrecognized key` | A field name is misspelled (e.g. `tag:` instead of `tags:`). Fields are checked letter by letter. |
| `hero_alt is required when hero is set` | Add a `hero_alt` describing the hero image. |
| `Could not find requested image` / an image path | The `./images/...` path in the article does not match a file. Check spelling and capitals. |
| `Only one article can be pinned` | Set `pinned: false` on all but one article. |
| `Tag spelled two ways` | Use one spelling for the tag in every article. |
| `albums.yaml › <album>: photo "…" is not a file` | Fix the path in `albums.yaml` (it is relative to `src/content/photos/`, starting with `./`). |
| `contains GPS location` | Run `npm run photos:strip-gps`, then commit again. |
| `is too large` | Add the photo with `npm run photos:add` (it resizes it). |
| `Working-style percents must add up to 100` | Fix the percents in `profile.yaml`. |
| `Use YYYY-MM in quotes` | Role dates must look like `"2024-09"`, with the quotes. |
| `company "…" is not in companies.yaml` / `Logo "…" not found` | Add the company to `companies.yaml` and its logo to `src/assets/logos/`. |
| `has title … but profile.yaml says …` | The current role's `title` and `profile.yaml`'s `title` must match exactly. |
| `both have highlight.order` / `both have order` (work) | Give each role or work highlight a different order number. |
| YAML errors (`bad indentation`, `unexpected`) | Usually a missing quote around text with a colon, or a tab instead of spaces. |

---

## 9. Where things live

```
src/
  content/
    articles/              one folder per article (index.md + images/)
      _template/           copy this to start an article (never published)
      formatting-reference/  example of every element (draft, local preview only)
    photos/                photos by year/month + albums.yaml
    profile/               profile.yaml, companies.yaml, roles/, _templates/
  assets/
    portrait.png           the caricature (Home, Profile, article bylines)
    logos/                 company logos, by key
    brands/                camera brand logos (Fujifilm)
  components/              building blocks (nav, footer, buttons, cards, photo viewer…)
  layouts/Base.astro       the page shell every page uses
  lib/                     data helpers (articles, photos, profile, camera details)
  pages/                   one file per page or page pattern
  styles/                  tokens.css (design tokens), global.css, prose.css (article text)
  content.config.ts        the rules every content file is checked against
public/                    favicon, share image, any file you want published as-is
scripts/                   photos:add, photos:strip-gps, the resume PDF step
.github/workflows/         deploy.yml (publish on push), check.yml (pull requests)
drafts/                    your private drafts (ignored by Git; create it when you need it)
```

## Licence

Code: MIT (see `LICENSE`). Content (articles, photos, portrait, profile text, resume) © Subash Canapathy.
