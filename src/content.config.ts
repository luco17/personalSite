import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob, file } from "astro/loaders";

const books = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/books" }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.date(),
    // Publish switch: only books with link: true get a notes page and an index link.
    link: z.boolean().default(false),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
  }),
});

const til = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/til" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
  }),
});

const quotes = defineCollection({
  loader: file("src/data/quotes.yaml"),
  schema: z.object({
    text: z.string(),
    attribution: z.string(),
  }),
});

const links = defineCollection({
  loader: file("src/data/links.yaml"),
  schema: z.object({
    title: z.string(),
    url: z.url(),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  }),
});

export const collections = { books, posts, til, quotes, links };
