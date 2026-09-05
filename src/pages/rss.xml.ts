import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const [posts, notes, books] = await Promise.all([
    getCollection("posts"),
    getCollection("til"),
    getCollection("books", ({ data }) => data.link),
  ]);

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
    })),
    ...notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.date,
      link: `/til/${note.id}/`,
    })),
    ...books.map((book) => ({
      title: book.data.title,
      description: `Notes on ${book.data.title} by ${book.data.author}.`,
      pubDate: book.data.date,
      link: `/books/${book.id}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: "LOD — posts and notes",
    description: "Articles, things I learned, and published book notes from LOD.",
    site: site!,
    items,
    customData: "<language>en-gb</language>",
  });
};
