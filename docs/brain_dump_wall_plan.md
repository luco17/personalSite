# Plan: Augment Personal Site with Brain Dump & Wall Features

## Summary

Add three features to the personal site:
1. **Telegram webhook** → posts to a "brain dump" D1 table (combined into main site)
2. **CLAUDE.md integration** → agentic search/retrieval of brain dump
3. **Wall page** → year/month pages aggregating posts, books, and brain dump

**Key Architecture Decisions:**
- **Rendering**: SSR via Cloudflare Workers with `prerender = false` for wall + telegram routes
- **Wall structure**: Year pages with month sub-sections (`/wall/2026/`)
- **Database**: Cloudflare D1 for brain dump (prod only, no dev DB)
- **Timezone**: Always UTC for storage; convert at display time only
- **Search**: cmd+f on page (no special search UI); Claude handles agentic search
- **Caching**: Edge cache 60-120s for wall pages (optional, protects against crawlers)
- **Auth**: Public access
- **Links migration**: Seed existing links as brain dumps, remove static links.astro
- **Deployment**: Single worker (Telegram webhook combined into site)

---

## Security & Safety Model

### SQL Injection Prevention
**Parameterized queries are the primary safety mechanism**, not append-only triggers. All database access uses prepared statements with bound parameters:

```typescript
// SAFE: Parameterized query
db.prepare('INSERT INTO brain_dump (content, source) VALUES (?, ?)').bind(content, 'telegram').run();

// SAFE: Parameterized query with user input
db.prepare('SELECT * FROM brain_dump WHERE content LIKE ?').bind(`%${searchTerm}%`).all();
```

### Soft Deletes (Recommended over Strict Append-Only)
Instead of strict append-only triggers that block all updates, use soft deletes:
- Add `is_hidden` column (default 0) to hide entries without deleting
- Agent can INSERT and `UPDATE is_hidden = 1`, but not DELETE
- Accidental secrets can be hidden instantly
- Data remains in DB for audit/recovery
- Recoverable: just set `is_hidden = 0` to restore

### Search vs. Writes Distinction
- **Search (reads)**: Flexible agentic search via Claude is acceptable
- **Writes (inserts)**: Constrained to known patterns with parameterized queries

### Source Overload Convention
`source` is intentionally overloaded as either origin or type:
- Origins: `telegram`, `claude`, `manual`
- Types: `link`, `quote`
If origin needs to be preserved for links/quotes later, add an `origin` column or append `via: telegram` to content.

### Accepted Risks
- Operational policy: raw SQL via `wrangler d1 execute` is for **reads**; writes should use approved inserts (or a small helper script/API). If raw SQL is used for writes, the risk is accepted.
- Production-only D1 means no dev/test separation (accepted for simplicity)
- If edits are needed later, implement a redaction/audit-table approach

### Future: Full Audit Trail (Optional Enhancement)
If you need to track who/when entries were hidden:
```sql
-- Add audit columns
ALTER TABLE brain_dump ADD COLUMN hidden_at TEXT;
ALTER TABLE brain_dump ADD COLUMN hidden_by TEXT;

-- Or create separate audit table for full history
CREATE TABLE brain_dump_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER,
    action TEXT,  -- 'hidden', 'restored'
    performed_at TEXT DEFAULT (datetime('now')),
    performed_by TEXT
);
```

---

## Phase 1: Infrastructure Setup

### 1.1 Create D1 Database

```sql
-- schema.sql
CREATE TABLE brain_dump (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT (datetime('now')),  -- Always UTC
    content TEXT NOT NULL,
    source TEXT DEFAULT 'telegram' CHECK (source IN ('telegram', 'claude', 'manual', 'link', 'quote')),
    is_hidden INTEGER DEFAULT 0  -- Soft delete: 1 = hidden from wall
);

CREATE INDEX idx_brain_dump_created ON brain_dump(created_at DESC);
CREATE INDEX idx_brain_dump_visible ON brain_dump(is_hidden, created_at DESC);

-- Block hard deletes (use soft delete instead)
CREATE TRIGGER brain_dump_no_delete BEFORE DELETE ON brain_dump BEGIN
    SELECT RAISE(ABORT, 'Use UPDATE is_hidden = 1 instead of DELETE');
END;
```

### 1.2 Configure Astro for Cloudflare SSR

Modify `astro.config.mjs`:
```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true }
  }),
  prefetch: true
});
```

Add `wrangler.toml` (prod only):
```toml
name = "personal-site"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"

[[d1_databases]]
binding = "DB"
database_name = "personal-site-db"
database_id = "<to-be-created>"
```

---

## Phase 2: Telegram Webhook (Combined into Site)

### 2.1 Create Telegram API Route

Create `src/pages/api/telegram.ts`:

```typescript
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Validate Telegram secret
  const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
  if (secret !== import.meta.env.TELEGRAM_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const update = await request.json() as any;
    const rawText = (update.message?.text || update.message?.caption || '').substring(0, 10000);

    if (rawText) {
      const db = locals.runtime.env.DB;
      const { content, source } = parseMessage(rawText);

      await db.prepare(
        'INSERT INTO brain_dump (content, source) VALUES (?, ?)'
      ).bind(content, source).run();
    }

    // Always return 200 to prevent Telegram retries
    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('Telegram webhook error:', e);
    // Still return 200 to prevent retry loops
    return new Response('ok', { status: 200 });
  }
};

/**
 * Parse Telegram message for commands.
 *
 * Formats:
 *   /link Title
 *   https://url.com
 *   → Stored as: "[Link] Title\nhttps://url.com"
 *
 *   /quote Attribution
 *   "Quote text here"
 *   → Stored as: "[Quote] Quote text here\n~ Attribution"
 *
 *   Plain text
 *   → Stored as-is with source='telegram'
 */
function parseMessage(text: string): { content: string; source: string } {
  if (text.startsWith('/link ')) {
    const rest = text.slice(6).trim();
    const [title, ...urlLines] = rest.split('\n');
    const url = urlLines.join('\n').trim();
    return {
      content: `[Link] ${title.trim()}\n${url}`,
      source: 'link'
    };
  }

  if (text.startsWith('/quote ')) {
    const rest = text.slice(7).trim();
    const [attribution, ...quoteLines] = rest.split('\n');
    const quoteText = quoteLines.join('\n').trim();
    return {
      content: `[Quote] ${quoteText}\n~ ${attribution.trim()}`,
      source: 'quote'
    };
  }

  // Default: plain brain dump
  return { content: text, source: 'telegram' };
}
```

**Why the secret check is required:** the helper script only registers the secret with Telegram. Telegram includes it in the `X-Telegram-Bot-Api-Secret-Token` header on every webhook call. The worker must validate that header to prevent arbitrary POSTs from inserting content.

### 2.2 Optional: Message Deduplication

To prevent duplicate entries on Telegram retries, add `message_id` tracking:

```sql
-- Add to schema.sql
ALTER TABLE brain_dump ADD COLUMN telegram_message_id INTEGER;
CREATE UNIQUE INDEX idx_telegram_message ON brain_dump(telegram_message_id) WHERE telegram_message_id IS NOT NULL;
```

```typescript
// In telegram.ts
const messageId = update.message?.message_id;
await db.prepare(
  'INSERT OR IGNORE INTO brain_dump (content, source, telegram_message_id) VALUES (?, ?, ?)'
).bind(content, 'telegram', messageId).run();
```

### 2.3 Environment Setup
1. Create Telegram bot via @BotFather
2. Generate secret: `openssl rand -hex 32`
3. Store in Cloudflare: `wrangler secret put TELEGRAM_SECRET`
4. Set webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-site.pages.dev/api/telegram",
       "secret_token": "<your-secret>"
     }'
   ```

---

## Phase 3: Links Migration to Brain Dump

### 3.1 Create Migration Script

Create `scripts/migrate-links.ts` to seed existing links as brain dumps:

```typescript
// Run with: npx wrangler d1 execute personal-site-db --remote --file=links-seed.sql

// Generate SQL from links.astro data
// Each link becomes a brain dump entry with source='link' and appropriate date

const links = [
  { title: "Lessons Learned Shipping 500 Units...", url: "https://...", date: "2026-02-01" },
  // ... extract all links from links.astro
];

// Generate INSERT statements
for (const link of links) {
  console.log(`INSERT INTO brain_dump (created_at, content, source) VALUES ('${link.date}T12:00:00', '[Link] ${link.title}\n${link.url}', 'link');`);
}
```

### 3.2 Migrate Quotes

Create `scripts/migrate-quotes.ts`:

```typescript
// Extract quotes from quotes.astro and generate INSERT statements
const quotes = [
  { text: "Behind readiness to anticipate insult lies a fear of deserving ridicule", attribution: "Alain De Boton" },
  { text: "A commentary on a book written by someone else...", attribution: "de Montaigne" },
  // ... all quotes from quotes.astro
];

// Generate INSERT statements (no date info, use migration date)
const migrationDate = new Date().toISOString().slice(0, 19);
for (const q of quotes) {
  const content = `[Quote] ${q.text}\n~ ${q.attribution}`;
  console.log(`INSERT INTO brain_dump (created_at, content, source) VALUES ('${migrationDate}', '${content.replace(/'/g, "''")}', 'quote');`);
}
```

### 3.3 Remove Static Pages

After migration:
- Delete `src/pages/links.astro` - links now in brain_dump with `source='link'`
- Delete `src/pages/quotes.astro` - quotes now in brain_dump with `source='quote'`

---

## Phase 4: Wall Page Implementation

### 4.1 Page Structure

```
src/pages/wall/
├── index.astro        # Redirect to current year
└── [year].astro       # Year page with month sections
```

### 4.2 Year Page with Month Sections

`src/pages/wall/[year].astro`:

```typescript
---
export const prerender = false;

import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';

const { year } = Astro.params;
const yearNum = parseInt(year || new Date().getUTCFullYear().toString());

// Validate year is reasonable
if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
  return Astro.redirect('/wall/');
}

// Get posts from content collection (build-time data)
const posts = (await getCollection('posts'))
  .filter(p => new Date(p.data.date).getUTCFullYear() === yearNum)
  .map(p => ({
    type: 'post' as const,
    title: p.data.title,
    date: new Date(p.data.date),
    url: `/posts/${p.id}`,
    content: null
  }));

// Get books from content collection (build-time data)
const books = (await getCollection('books'))
  .filter(b => new Date(b.data.date).getUTCFullYear() === yearNum)
  .map(b => ({
    type: 'book' as const,
    title: `${b.data.title} by ${b.data.author}`,
    date: new Date(b.data.date),
    url: b.data.link ? `/books/${b.id}` : null,
    content: null
  }));

// Get brain dump from D1 (SSR - live data, excluding hidden entries)
const db = Astro.locals.runtime.env.DB;
const brainDumps = await db.prepare(`
  SELECT id, created_at, content, source
  FROM brain_dump
  WHERE strftime('%Y', created_at) = ?
    AND is_hidden = 0
  ORDER BY created_at DESC
`).bind(year).all();

// Map source to display type
function getDisplayType(source: string): 'link' | 'quote' | 'brain_dump' {
  if (source === 'link') return 'link';
  if (source === 'quote') return 'quote';
  return 'brain_dump';
}

function stripPrefix(content: string, prefix: string) {
  return content.startsWith(prefix) ? content.slice(prefix.length).trim() : content;
}

function parseLinkContent(content: string) {
  const cleaned = stripPrefix(content, '[Link] ');
  const [title, url] = cleaned.split('\n');
  return { title: (title || '').trim(), url: (url || '').trim() };
}

function parseQuoteContent(content: string) {
  const cleaned = stripPrefix(content, '[Quote] ');
  const [text, attribution] = cleaned.split('\n~ ');
  return { text: (text || '').trim(), attribution: (attribution || '').trim() };
}

const brainDumpItems = brainDumps.results.map(b => {
  const type = getDisplayType(b.source as string);
  const date = new Date(b.created_at + 'Z');

  if (type === 'link') {
    const { title, url } = parseLinkContent(b.content as string);
    return { type, title, url, content: null, attribution: null, date };
  }

  if (type === 'quote') {
    const { text, attribution } = parseQuoteContent(b.content as string);
    return { type, title: null, url: null, content: text, attribution, date };
  }

  return { type, title: null, url: null, content: b.content, attribution: null, date };
});

// Merge and sort (newest first)
const allContent = [...posts, ...books, ...brainDumpItems]
  .sort((a, b) => b.date.getTime() - a.date.getTime());

// Group by month
const months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

function groupByMonth(items: typeof allContent) {
  const groups: Record<string, typeof allContent> = {};
  for (const item of items) {
    const monthName = months[item.date.getUTCMonth()];
    if (!groups[monthName]) groups[monthName] = [];
    groups[monthName].push(item);
  }
  return groups;
}

const groupedByMonth = groupByMonth(allContent);

// Get available years for navigation
const yearsResult = await db.prepare(`
  SELECT DISTINCT strftime('%Y', created_at) as year FROM brain_dump ORDER BY year DESC
`).all();
const dbYears = yearsResult.results.map(r => parseInt(r.year as string));
const postYears = posts.map(p => p.date.getUTCFullYear());
const bookYears = books.map(b => b.date.getUTCFullYear());
const allYears = [...new Set([...dbYears, ...postYears, ...bookYears])].sort((a, b) => b - a);

// Set cache header (60-120 seconds)
Astro.response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
---

<Layout title={`Wall - ${year}`}>
  <main>
    <h2>Wall - {year}</h2>

    <nav class="year-nav">
      {allYears.map(y => (
        <a href={`/wall/${y}/`} class:list={{ active: y === yearNum }}>{y}</a>
      ))}
    </nav>

    {Object.entries(groupedByMonth).length === 0 ? (
      <p>No content for {year}.</p>
    ) : (
      Object.entries(groupedByMonth).map(([month, items]) => (
        <section class="month-section">
          <h3>{month}</h3>
          {items.map(item => (
            <article class={`wall-item wall-item--${item.type}`}>
              <span class="type-badge">{item.type.replace('_', ' ')}</span>
              {item.type === 'brain_dump' ? (
                <p class="brain-dump-content">{item.content}</p>
              ) : item.type === 'link' ? (
                item.url ? (
                  <a href={item.url}>{item.title || item.url}</a>
                ) : (
                  <span>{item.title}</span>
                )
              ) : item.type === 'quote' ? (
                <blockquote class="quote-content">
                  <p>{item.content}</p>
                  {item.attribution && <footer>~ {item.attribution}</footer>}
                </blockquote>
              ) : item.url ? (
                <a href={item.url}>{item.title}</a>
              ) : (
                <span>{item.title}</span>
              )}
              <time datetime={item.date.toISOString()}>
                {item.date.toLocaleDateString('en-GB')}
              </time>
            </article>
          ))}
        </section>
      ))
    )}
  </main>
</Layout>
```

**Optional: strip redundant prefixes when rendering**
If you keep `[Link]` / `[Quote]` in stored content, remove them at display time to avoid duplicate labels (badge + content). The parsing helpers above do this.

### 4.3 Wall Index Redirect

`src/pages/wall/index.astro`:

```typescript
---
export const prerender = false;

const currentYear = new Date().getUTCFullYear();
return Astro.redirect(`/wall/${currentYear}/`);
---
```

### 4.4 Styling

Add to `global.css`:
```css
/* Wall page styles */
.year-nav {
  margin-bottom: 1.5em;
}

.year-nav a {
  margin-right: 1em;
  text-decoration: none;
}

.year-nav a.active {
  font-weight: bold;
  text-decoration: underline;
}

.month-section {
  margin-bottom: 2em;
}

.wall-item {
  margin: 1em 0;
  padding: 0.5em 0;
  border-bottom: 1px solid #eee;
}

.type-badge {
  display: inline-block;
  font-size: 0.75em;
  padding: 0.2em 0.5em;
  border-radius: 3px;
  margin-right: 0.5em;
  text-transform: capitalize;
}

.wall-item--post .type-badge { background: #e3f2fd; color: #1565c0; }
.wall-item--book .type-badge { background: #f3e5f5; color: #7b1fa2; }
.wall-item--link .type-badge { background: #e8f5e9; color: #2e7d32; }
.wall-item--quote .type-badge { background: #fce4ec; color: #c2185b; }
.wall-item--brain_dump .type-badge { background: #fff3e0; color: #e65100; }

.brain-dump-content,
.link-content {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0.5em 0;
}

.quote-content {
  white-space: pre-wrap;
  font-style: italic;
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 3px solid #ccc;
}

@media (prefers-color-scheme: dark) {
  .wall-item { border-color: #333; }
  .wall-item--post .type-badge { background: #1a237e; color: #90caf9; }
  .wall-item--book .type-badge { background: #4a148c; color: #ce93d8; }
  .wall-item--link .type-badge { background: #1b5e20; color: #a5d6a7; }
  .wall-item--quote .type-badge { background: #880e4f; color: #f48fb1; }
  .wall-item--brain_dump .type-badge { background: #bf360c; color: #ffcc80; }
  .quote-content { border-left-color: #666; }
}
```

### 4.5 Future: Month-Level Pagination (Optional)

If volume grows, split `/wall/[year]/` into month pages (e.g. `/wall/2026/02/`) or add pagination per month section.

---

## Phase 5: CLAUDE.md Integration

Update `.claude/CLAUDE.md`:

```markdown
# Personal Site Brain Dump

## Database Access

Query brain dump via wrangler:
```bash
wrangler d1 execute personal-site-db --remote --command "SQL"
wrangler d1 execute personal-site-db --remote --json --command "SQL"
```

## Schema

brain_dump — Append-only (enforced by triggers)
- id (INTEGER, auto)
- created_at (TEXT, UTC, auto)
- content (TEXT)
- source ('telegram' | 'claude' | 'manual' | 'link' | 'quote')

## Finding Things

You have full SQL access. Search like a senior engineer searches code:

- Start broad: `SELECT * FROM brain_dump ORDER BY id DESC LIMIT 20`
- Substring: `WHERE content LIKE '%keyword%'`
- Date ranges: `WHERE created_at > '2026-01-01'`
- By source: `WHERE source = 'link'`
- Combine filters as needed

**REGEXP is not available** - use LIKE or GLOB patterns.

Run multiple queries to explore and refine. Don't try to get everything in one shot.

## Adding Entries

```sql
INSERT INTO brain_dump (content, source) VALUES ('text here', 'claude');
```

## Hiding Entries

To hide a mistake or accidental secret:
```sql
UPDATE brain_dump SET is_hidden = 1 WHERE id = 42;
```

To restore a hidden entry:
```sql
UPDATE brain_dump SET is_hidden = 0 WHERE id = 42;
```

To see all hidden entries:
```sql
SELECT * FROM brain_dump WHERE is_hidden = 1 ORDER BY created_at DESC;
```

## Corrections

To add a correction referencing an original entry:
```sql
INSERT INTO brain_dump (content, source)
VALUES ('[CORRECTION to entry 42] corrected text here', 'claude');
```

## Security Note

- DELETE is blocked by trigger (use soft delete instead)
- Data remains in DB for audit/recovery even when hidden
- Parameterised queries prevent SQL injection
```

---

## Phase 6: Navigation Update

Update `Nav.astro` to include Wall link:

```astro
<a href="/wall/" data-astro-prefetch>Wall</a>
```

Update existing pages to add `export const prerender = true`:
- `src/pages/index.astro`
- `src/pages/posts/index.astro`
- `src/pages/posts/[id].astro`
- `src/pages/books/index.astro`
- `src/pages/books/[id].astro`
- etc.

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `schema.sql` | D1 database schema with append-only triggers |
| `wrangler.toml` | Cloudflare Workers config (prod only) |
| `src/pages/api/telegram.ts` | Telegram webhook endpoint |
| `src/pages/wall/index.astro` | Wall redirect to current year |
| `src/pages/wall/[year].astro` | Year page with month sections (SSR) |
| `scripts/migrate-links.ts` | Script to seed links as brain dumps |
| `scripts/migrate-quotes.ts` | Script to seed quotes as brain dumps |

### Modified Files
| File | Changes |
|------|---------|
| `astro.config.mjs` | Add Cloudflare adapter, `output: 'server'` |
| `package.json` | Add `@astrojs/cloudflare` dependency |
| `src/components/Nav.astro` | Add Wall link |
| `src/styles/global.css` | Add wall styling |
| `.claude/CLAUDE.md` | Add brain dump instructions |
| Existing pages | Add `export const prerender = true` |

### Removed Files
| File | Reason |
|------|--------|
| `src/pages/links.astro` | Links migrated to brain_dump table |
| `src/pages/quotes.astro` | Quotes migrated to brain_dump table |

---

## Verification Plan

### 1. D1 Setup
```bash
npx wrangler d1 create personal-site-db
# Note the database_id, update wrangler.toml
npx wrangler d1 execute personal-site-db --remote --file=schema.sql
```

### 2. Verify soft delete works
```bash
# Insert test entry
npx wrangler d1 execute personal-site-db --remote \
  --command "INSERT INTO brain_dump (content) VALUES ('test entry')"

# Hide it (should succeed)
npx wrangler d1 execute personal-site-db --remote \
  --command "UPDATE brain_dump SET is_hidden = 1 WHERE id = 1"

# Hard delete should fail
npx wrangler d1 execute personal-site-db --remote \
  --command "DELETE FROM brain_dump WHERE id = 1"
# Expected error: "Use UPDATE is_hidden = 1 instead of DELETE"

# Restore it
npx wrangler d1 execute personal-site-db --remote \
  --command "UPDATE brain_dump SET is_hidden = 0 WHERE id = 1"
```

### 3. Migrate links and quotes
```bash
# Generate and run links migration
npx ts-node scripts/migrate-links.ts > links-seed.sql
npx wrangler d1 execute personal-site-db --remote --file=links-seed.sql

# Generate and run quotes migration
npx ts-node scripts/migrate-quotes.ts > quotes-seed.sql
npx wrangler d1 execute personal-site-db --remote --file=quotes-seed.sql

# Verify both
npx wrangler d1 execute personal-site-db --remote \
  --command "SELECT source, COUNT(*) FROM brain_dump GROUP BY source"
```

### 4. Telegram bot setup
```bash
# Store secret
wrangler secret put TELEGRAM_SECRET

# Deploy site
npm run build && npx wrangler pages deploy dist

# Set webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-site.pages.dev/api/telegram", "secret_token": "<SECRET>"}'

# Test: send message to bot, verify in D1
npx wrangler d1 execute personal-site-db --remote \
  --command "SELECT * FROM brain_dump ORDER BY id DESC LIMIT 5"
```

### 5. Wall page tests (curl)
```bash
# Should return HTML with year nav and month sections
curl -s https://your-site.pages.dev/wall/2026/ | grep -E "(Wall - 2026|January|February)"

# Should include brain dump entries
curl -s https://your-site.pages.dev/wall/2026/ | grep "brain.dump"

# Should have cache header
curl -I https://your-site.pages.dev/wall/2026/ | grep -i cache-control
```

### 6. Year navigation
- Verify `/wall/` redirects to current year
- Verify year links work
- Verify empty years show "No content" message
