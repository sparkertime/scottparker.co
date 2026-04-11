# scottparker.co

Personal blog built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Prerequisites

- [mise](https://mise.jdx.dev/) — manages the Node.js version via `.tool-versions`
- After installing mise: `mise install` to get the right Node version

## Local development

```bash
npm install       # first time only
npm run dev       # start local dev server at http://localhost:4321
```

The site hot-reloads on file changes.

## Writing a new post

```bash
npm run new-post
```

This launches an interactive CLI that asks for a title, description, tags, and (for reviews) type, rating, and optional Letterboxd URL. It creates a pre-filled `.md` file in the right directory.

## Writing a post manually

Create a file in `src/content/posts/YYYY-MM-DD-your-title.md`:

```yaml
---
title: "Your Post Title"
description: "One-line teaser"
date: "2026-04-04"
tags: ["tag1", "tag2"]
headerImage: "https://example.com/some-image.jpg"
---

Your content here.
```

For a review, create `src/content/reviews/YYYY-MM-DD-title.md`:

```yaml
---
title: "Movie Title"
description: "Brief take"
date: "2026-04-04"
type: movie          # movie | book | game | tv | boardgame | other
rating: 4            # 1-5 integer
letterboxd: "https://letterboxd.com/hellosparker/film/..."   # optional
tags: ["film"]
---
```

## Header images

Set `headerImage` in frontmatter to either:

- A **URL** (`https://...`) — it will be downloaded locally before each build and the frontmatter rewritten to the local path automatically.
- A **local path** (`/images/headers/my-image.jpg`) — used as-is.

To download header images manually without building:

```bash
npm run fetch-headers
```

## Embedding images in a post

Use the `<Figure>` component in any `.mdx` post (available automatically, no import needed):

```mdx
<Figure src="/images/my-image.png" caption="Optional caption" />
```

Default max-height is 500px. For a tall image (like a full infographic):

```mdx
<Figure src="/images/tall-image.png" caption="Caption" maxHeight="none" />
```

For `.md` files, use standard markdown: `![alt](/images/foo.png)`

## Building

```bash
npm run build     # outputs to dist/
npm run preview   # preview the built site locally
```

## Deploying

Push to `master` — GitHub Actions builds and deploys automatically.

First-time setup: in your repo settings go to **Settings → Pages → Source** and select **GitHub Actions**.

## Tags and reviews

- Tags are browseable at `/tags/`
- All reviews are at `/reviews/` with filters by type, rating, and year
- RSS feed at `/feed.xml`

## One-time migration (already done)

The original Jekyll posts were migrated with:

```bash
node scripts/migrate-posts.mjs
cp -r images/ public/images/
```

This is documented for reference only — do not run again.
