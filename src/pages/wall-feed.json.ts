import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import {
  compareWallItems,
  wallSiteEntryId,
  type WallSiteEntry,
} from "@/lib/wall";

export const prerender = true;

// End of day, so new content leads that day's notes.
const toCreatedAt = (date: Date) => date.toISOString().slice(0, 10) + " 23:59:59";

export const GET: APIRoute = async () => {
  const [posts, til, books] = await Promise.all([
    getCollection("posts"),
    getCollection("til"),
    getCollection("books"),
  ]);

  const entries: WallSiteEntry[] = [
    ...posts.map((entry) => ({
      kind: "post" as const,
      id: entry.id,
      title: entry.data.title,
      href: `/posts/${entry.id}/`,
      date: entry.data.date,
    })),
    ...til.map((entry) => ({
      kind: "til" as const,
      id: entry.id,
      title: entry.data.title,
      href: `/til/${entry.id}/`,
      date: entry.data.date,
    })),
    ...books.map((entry) => ({
      kind: "book" as const,
      id: entry.id,
      title: entry.data.title,
      // Books without published notes have no page to link to.
      href: entry.data.link ? `/books/${entry.id}/` : null,
      date: entry.data.date,
    })),
  ]
    .map(({ kind, id, title, href, date }) => ({
      id: wallSiteEntryId(`${kind}/${id}`),
      kind,
      title,
      href,
      created_at: toCreatedAt(date),
    }))
    .sort(compareWallItems);

  return Response.json(entries);
};
