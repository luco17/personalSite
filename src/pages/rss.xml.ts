import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { byDateDesc } from "../lib/sort";

export async function GET(context: APIContext) {
  const posts = (await getCollection("posts")).sort(byDateDesc);
  return rss({
    title: "LOD - Posts",
    description: "The occasional article.",
    site: context.site ?? "https://lcod.uk",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/posts/${post.id}/`,
    })),
  });
}
