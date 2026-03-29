# Personal Site

## Purpose

Personal website built with Astro. It is mainly a place for:
- posts
- books
- links
- a few static pages

The site is intentionally simple: mostly server-rendered pages, plain HTML, and CSS.

## Quick Map

- `src/pages/`: top-level pages
- `src/pages/links.astro`: manually maintained links page
- `src/content/posts/`: post content
- `src/content/books/`: book notes
- `src/content.config.ts`: content collection schema

## Content Rules

- Use the current request date by default unless told otherwise.
- Use UK English in prose and documentation.
- Keep copy concise and direct.

## Links

- Add new links to `src/pages/links.astro`.
- First look for a section matching the request month and year.
- If that section does not exist, assume the link belongs in the request month and create the section.
- Match the existing HTML structure and month ordering.
