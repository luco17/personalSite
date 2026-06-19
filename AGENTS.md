# Personal Site

## Purpose

Personal website built with Astro. It is mainly a place for:
- posts
- books
- links
- a few static pages

The site is intentionally simple: mostly static pages, plain HTML, and CSS.

## Quick Map

- `src/pages/`: top-level pages
- `src/content/posts/`: post content
- `src/content/books/`: book notes
- `src/content/til/`: TIL notes
- `src/data/links.yaml`: links data (rendered by `src/pages/links.astro`)
- `src/data/quotes.yaml`: quotes data (rendered by `src/pages/quotes.astro`)
- `src/content.config.ts`: content collection schemas

## Content Rules

- Use the current request date by default unless told otherwise.
- Use UK English in prose and documentation.
- Keep copy concise and direct.
- **TILs/Notes Style**: Keep drafts punchy, direct, and conversational. Ground them in real-world context. Avoid formal headers/bullet lists unless requested.

## Links

- Add new links to `src/data/links.yaml`.
- Append the entry at the end of the file with:
  - `id`: highest existing id plus one
  - `title`: link text
  - `url`: the link
  - `month`: the request month as `"YYYY-MM"`
- The links page groups and orders months automatically; within a month, entries render in id order.

## Quotes

- Add new quotes to `src/data/quotes.yaml`.
- Append the entry at the end of the file with `id` (highest plus one), `text` (include the quotation marks), and `attribution`.
- Quotes render in id order.

## Books

- One Markdown file per book in `src/content/books/` with `title`, `author`, and `date` frontmatter.
- Notes go in the body, but they are only published when the frontmatter sets `link: true`; omit the key otherwise (it defaults to false).
- Unpublished books still appear in the books index, without a link.

## Posts

- Posts may set an optional `description` in frontmatter; it feeds the meta description and the RSS feed.
