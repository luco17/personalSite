# Site review and proposed changes

4 September 2026 · Branch: `codex/site-review` · Proposed locally; not deployed

The site should stay small, personal and mostly static. Its main opportunity is a clearer reading experience, rather than a new framework or a visual overhaul. I recommend folding Links into the Wall, keeping the existing content categories, and adding a few deliberate navigation details.

Three subagents reviewed content and the Wall, discoverability, and design. The main review covered performance, integrated the changes and checked the built site. All changes below are proposals for review.

## Priority findings

| Ref | Finding | Proposal in this branch |
| --- | --- | --- |
| F1 | `astro check` was checking **zero source files**. The TypeScript configuration included only an absent generated declaration file. | Include the site sources and generate Cloudflare types before checking. The final check covers 25 files. |
| C1 | Links and Wall divide much the same activity: reading short notes and discoveries. | Merge all 85 saved links into the Wall; remove Links from navigation; redirect its old URL. |
| C2 | Timestamp-only pagination could drop entries sharing a boundary timestamp. Older appeared even on the final page. | Use timestamp plus ID, merge before pagination, and show Older only when another entry exists. |
| P1 | Static-page images went through a runtime transformation endpoint. | Resize at build time and serve ordinary versioned assets. |
| D1 | Every Wall archive page pointed its canonical at the latest Wall. | Give valid archive pages their own canonical URLs. Keep ordinary crawlable pagination. |
| V1 | The back-arrow bounce ignored reduced motion and keyboard focus. | Respect motion preferences and provide keyboard parity, visible focus and a skip link. |
| D2 | Readers had no subscription feed. | Add RSS for posts, TIL and published book notes. |

## Links belong in the Wall

**C1 — One stream, with honest dates.** The 85 saved links cover December 2023 to July 2026. Their source only records months, so they appear as “July 2026 · Link”, without an invented day. Internally they sort at the start of that month, preserving their existing ID order. This places them after precisely dated notes from most of the same month; it does not claim that this was their exact discovery order.

Keep `src/data/links.yaml` as the source. There is no D1 import, migration or second copy of the links. New entries still use the existing YAML workflow, documented in `AGENTS.md`. `/links` and `/links/` redirect to `/wall/` with HTTP 301. The retired route is removed from the sitemap.

**C2 — Pagination has to follow the combined stream.** Each request fetches at most 51 visible note candidates, merges them with the saved links, and renders 50 entries. A timestamp-and-ID cursor handles ties. Negative internal link IDs distinguish links from database notes and preserve the old curation order. Legacy timestamp-only bookmarks still work; invalid cursors redirect to the latest Wall.

The existing local database contains 125 visible notes. Together with the 85 links, this produces five pages of **50, 50, 50, 50 and 10 entries**, with every entry appearing once. The first page includes a saved link. This is a local snapshot, last updated on 27 August, not a fresh production export.

**C3 — The availability trade-off is real.** Links previously had a wholly static page. The combined stream depends on the database for its complete ordering. During a D1 failure, the page now returns 503 with `no-store` and `Retry-After`, displays available saved links with a warning, and suppresses Older. That prevents partial results from generating misleading pagination. It means some older links are temporarily unreachable during a database outage. No database writes were made.

**C4 — Four possible editorial duplicates remain.** The local notes already contain URLs also saved under these YAML IDs:

| ID | Saved title |
| --- | --- |
| 4 | Agentic Engineering Patterns |
| 9 | 3 constraints before I build anything |
| 10 | The Company as a Machine for Doing Stuff |
| 12 | myNoise |

Both copies are retained because a named bookmark and a contextual note can serve different purposes. Review those four editorially. Automatic deduplication would complicate the stream and might remove useful context.

## Speed

**P1 — Build-time images are a useful simplification.** All current images belong to static pages. The Cloudflare adapter now uses `imageService: 'compile'`, producing nine image variants at build time. The homepage keeps its dimensions, responsive density choices and high fetch priority. Article images keep their dimensions and lazy loading. [Astro Cloudflare image services](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#imageservice)

| Observation | Current site / baseline | Proposed build |
| --- | --- | --- |
| Homepage HTML, gzip | 1.9 KB | 2.3 KB |
| Homepage 130px portrait | Sampled live endpoint: 12,904 bytes | Static asset: 1,380 bytes |
| Homepage 260px / 390px variants | Runtime URLs | 3,354 / 5,330 bytes |
| First-party browser JavaScript | 2,542 bytes raw; about 1.1 KB gzip | Same bundle |
| Image delivery | Runtime `/_image` URLs | Hashed `/_astro/` files |

The extra HTML/CSS is roughly 0.4 KB compressed on the homepage. The portrait comparison is between the sampled live 130px URL and the built 130px asset; it is not a measured improvement in page rendering time. Some already compressed screenshots become slightly larger when re-encoded. The useful change is predictable static delivery, not a claim that every image gets smaller.

**P2 — The existing delivery foundation is good.** The homepage and article pages are prerendered HTML. There are no custom font downloads, hydrated UI frameworks or animation packages. The first-party script handles prefetching; the sampled Plausible script was about 1.3 KB compressed and already deferred. The adapter already adds one-year immutable caching for hashed assets, so no duplicate caching layer was added.

Static navigation retains hover prefetching. Wall uses tap prefetching, avoiding speculative database reads when a pointer merely rests over its navigation link. [Astro prefetch behaviour](https://docs.astro.build/en/guides/prefetch/)

**P3 — These are observations, not Core Web Vitals.** Individual live requests from this machine returned the homepage's first byte in about 119 ms and the Wall's in about 213 ms. The homepage showed a Cloudflare cache HIT; the Wall carried its existing short cache header. That header alone does not establish edge-cache behaviour. These single samples say little about slower devices, cold caches or visitors elsewhere.

Chrome DevTools trace tools were unavailable. No Lighthouse score, LCP, INP, CLS or field-performance result is claimed. Real Core Web Vitals need browser/field measurements; request timings are not a substitute. [Web Vitals measurement](https://web.dev/articles/vitals)

**P4 — Do not optimise the wrong asset.** The roughly 708 KB Open Graph image is social-preview metadata, not a displayed page image. It does not explain normal page rendering cost. A separate compression pass may help sharing clients, but is lower priority than content and navigation.

## Web fundamentals and discoverability

**D1 — Use consistent, meaningful URLs.** Static navigation now uses trailing slashes, matching the generated sitemap and avoiding the live static-page redirect observed at `/posts`. Both live Wall slash variants work; the proposal consistently uses `/wall/`. Archive canonicals retain only their validated cursor. Normal page canonicals discard tracking parameters. [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

**D2 — Add a small subscription surface.** `/rss.xml` contains **65 items: eight posts, 13 TIL and 44 published book notes**. Posts and TIL show a visible subscription link, and pages advertise the feed for reader autodiscovery. It uses the official Astro RSS helper at build time and adds no browser code. Wall database entries and external bookmarks are not in this feed; this keeps static publishing independent of D1. Book dates remain catalogue dates, rather than inferred publication dates. [Astro RSS](https://docs.astro.build/en/recipes/rss/)

**D3 — Preserve publication boundaries.** Books without `link: true` still appear in the catalogue without publishing their notes. RSS applies the same filter. All matching post and TIL files publish at build time: there is no general draft/scheduling switch. No currently future-dated post or TIL was found. A new publishing system would be disproportionate here.

**D4 — Improve semantics without changing the prose.** Article pages now use `article` and `header`; posts/TIL have machine-readable dates and publication metadata. The duplicated H1 in the Noticing TIL was removed. Every generated HTML page has one main landmark and one H1. The shared layout uses `en-GB`, provides a skip link, and tells the browser that light and dark colour schemes are supported. Decorative back arrows are hidden from assistive technology.

**D5 — Stop repeating generic descriptions on individual articles.** All 13 TIL and one post had no authored summary and inherited identical site copy. These pages now omit description fields, allowing search engines to choose visible text. Existing post and book summaries remain. TIL supports optional `description` frontmatter. Add concise authored summaries to the pieces you most want people to find or share; generating or parsing substitute copy would add little value. [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet)

**D6 — Error handling should be explicit.** The 404 page adds `noindex` and omits its canonical. A missing route returned actual HTTP 404 in the built preview. The Wall failure path now signals temporary unavailability rather than returning a cacheable successful page. The D1-failure branch was inspected in source; no outage was induced.

**D7 — Keep the good crawlability foundation.** Native anchors, server-rendered content, robots.txt, social metadata and the sitemap were already present. All generated internal page links checked successfully. No `llms.txt`, keyword pages or speculative structured data was added. Google says its AI search features use ordinary search fundamentals and require no special AI text file; that is not a guarantee of inclusion, or a statement about every AI service. [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)

**D8 — Small editorial cleanup remains.** Some older pieces start sections at H3 despite having no intervening H2, including `bonuses.md`, `theConsolationsOfPhilosophy.md`, `mythicalManMonth.md` and `theArtOfStatistics.md`. Normalise those when editing the pieces. External link rot and authenticated Search Console indexing were not comprehensively audited.

## Understated design

**V1 — The implemented flourish is deliberately small.** A one-pixel underline draws beneath a navigation item in 160 ms on hover or keyboard focus. A thicker stationary underline marks the current page or section. Text stays still. With reduced motion, the underline appears immediately. This is a proposal for your judgement, not an accepted design decision.

**V2 — Keep the back-arrow character.** The existing bounce remains, gains keyboard-focus support and stops animating when reduced motion is requested. Ordinary underline transitions follow the same preference. The site gains no animation library or new browser JavaScript. [W3C reduced-motion technique](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)

**V3 — Quiet layout details carry much of the improvement.** Navigation has larger hit areas and a visible focus treatment. Paragraphs and lists use a consistent 1.5 line height. Long URLs wrap. Wall metadata uses a darker grey in light mode, and pagination has larger targets and equivalent hover/focus feedback. The portrait now has the concrete alt text “Lucien O”.

Try the following separately after reviewing the branch:

| Ref | Idea | Why it earns its place |
| --- | --- | --- |
| V4 | Small directional springs on Older / More recent arrows | Reuses the back-link vocabulary and reinforces direction. Keep the labels still. |
| V5 | A soft target tint for a shared Wall entry | Helps readers locate the item they opened. Build stable permalinks first; current fragment IDs alone do not survive entries moving between pages. |
| V6 | A quiet quotation-mark or rule accent on Quotes | Adds a distinctive static detail to a text-heavy page without another animation. |
| V7 | Tabular numerals and consistent spacing for dates | A small typographic improvement that helps archive scanning. Trial on one list first. |

I would try V4 next. Avoid combining all of these at once; the plainness is part of the site's appeal.

## Validation and delivery

**F1 — Build checks now inspect the application.** `tsconfig.json` includes the sources rather than only an absent generated file. `npm run build` first runs the existing Wrangler type generator, then Astro check and build. Deprecated schema imports were updated. The generated declaration remains ignored. [Cloudflare TypeScript types](https://developers.cloudflare.com/workers/languages/typescript/)

**F2 — A tooling dependency was patched.** `fast-uri` was updated from 3.1.5 to 3.1.6 in the lockfile. It arrived through the Astro check/language-server dependency chain; this does not establish an exploitable public-site issue. `npm audit` reports zero known vulnerabilities after the update.

Validation completed:

- Build and Astro check, covering 25 files with zero errors, warnings or hints.
- Generated-output inspection across 73 HTML pages: one H1/main, working skip targets, image dimensions/alt text, no runtime image URLs and no missing internal page targets.
- RSS XML parsing and reconciliation of all 65 unique item URLs with generated public pages. Sitemap contains the Wall and excludes the retired Links route and 404.
- Actual SQL plus pagination-helper checks using an in-memory SQLite fixture, including 125 notes sharing a timestamp, 125 links sharing a month, hidden notes, exact/partial/empty pages and invalid/legacy cursors.
- Five-page traversal against both local development and the built preview: all 210 local entries appear once; the final page has no Older link; archive canonicals match the requested cursor.
- Built-preview HTTP checks for 301 Links redirect, 302 invalid-cursor recovery, 404 missing page and 200 RSS.
- Browser review of the built homepage, Wall, fitness table and illustrated article. Desktop and 375px/320px layouts showed no horizontal page overflow; keyboard Skip to content moved focus into main; current-section styling appeared on article pages.
- Dark mode was visually reviewed in the available browser. Light-mode and reduced-motion rules were inspected in source, not independently emulated. This is not a full accessibility conformance audit.
- `git diff --check` and dependency audit.

The development server briefly hit stale Vite SSR chunks during configuration/dependency rebuilds. Validation then used a clean build and the production preview. No workaround was added to application code. Existing syntax-highlighting notices for `gitconfig` and `gitignore` code fences remain harmless build notices.

No production settings or data changed. The branch is ready for review; the navigation flourish and archive organisation still need your visual/editorial judgement before deployment.
