---
title: Super Minimal Strength Logging with Hono TSX, Workers and D1
date: 2026-05-24
description: "A pared-back strength logger built with Hono TSX, Cloudflare Workers and D1."
---

I've built many workout logging ideas over the years and have finally honed in on a pared-back shape:
- Only track strength (use my Garmin to track Cardio)
- No concept of a workout, no concept of a superset
- When you log, you're just logging a lift
- DB cloud so I never lose my history!

## Stack
- Cloudflare Worker for hosting and request handling
- Hono with JSX for routing and server-rendered HTML
- D1
- Cloudflare Access that I auth behind
- static CSS and JavaScript

There is no separate API server, no client-side framework, no auth library and
no database server to run. The Worker entrypoint is `src/index.tsx`, Hono routes
fetch from D1, and the response is JSX rendered straight to HTML.

The route shape is pleasingly direct:

```tsx
homeRoutes.get("/", async (c) => {
  const search = c.req.query("q") ?? "";
  const items = await recentCompletions(c.env.DB, c.var.userEmail, search);
  return c.html(<HomePage items={items} search={search} />);
});
```

The mental model is: read request data from Hono, query D1, pass the result into a TSX view, return HTML.

Hono's JSX support is a convenient way to build HTML on the server. It also handles dynamic interaction without abandoning SSR. 

For example, the home page renders a complete page for normal requests, while
the live search endpoint renders only the `HomeResults` fragment:

```tsx
homeRoutes.get("/home/entries", async (c) => {
  const search = c.req.query("q") ?? "";
  const items = await recentCompletions(c.env.DB, c.var.userEmail, search);
  return c.html(<HomeResults items={items} search={search} />);
});
```

The client fetches that fragment as the user types and swaps it into the page.
The same component is used for the full page and the partial update.

The query layer is just TypeScript functions around prepared SQL statements:

```ts
export async function recentCompletions(
  db: D1Database,
  userEmail: string,
  search: string,
): Promise<CompletionWithSets[]> {
  const rs = await db
    .prepare(
      `SELECT c.id, c.exercise_id, e.name AS exercise_name, c.performed_on, c.notes
       FROM exercise_completion c
       JOIN exercise e ON e.id = c.exercise_id
       WHERE c.user_id = ?
       ORDER BY c.performed_on DESC, c.id DESC
       LIMIT ?`,
    )
    .bind(userEmail, 20)
    .all<CompletionRow>();

  return attachSets(db, rs.results ?? []);
}
```
Cloudflare Access removes most of the auth code: the Worker trusts the Access
email header and uses that value to scope D1 queries.

The result is very minimalist. The full app is:

- a few Hono route files
- TSX view functions
- a small SQL query layer
- one D1 database
- static assets served by the same Worker
