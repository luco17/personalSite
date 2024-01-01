import { z, defineCollection } from "astro:content";

const bookCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.date(),
    link: z.boolean(),
  }),
});

export const collections = {
  books: bookCollection,
};
