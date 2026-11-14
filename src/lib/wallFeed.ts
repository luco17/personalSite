import { env } from "cloudflare:workers";
import { wallFeedPath, type WallSiteEntry } from "@/lib/wall";

// The feed is a static asset fixed per deployment, so a warm isolate can reuse it.
let cached: WallSiteEntry[] | undefined;

export const loadWallSiteEntries = async (origin: URL): Promise<WallSiteEntry[]> => {
  if (cached) return cached;
  try {
    const url = new URL(wallFeedPath, origin);
    // Built sites serve the feed as a static asset; the dev server renders it on request.
    const response = await (import.meta.env.DEV ? fetch(url) : env.ASSETS.fetch(url));
    if (!response.ok) throw new Error(`Wall feed returned ${response.status}`);
    const entries: WallSiteEntry[] = await response.json();
    // Dev re-renders the feed on each request so new content shows without a restart.
    if (!import.meta.env.DEV) cached = entries;
    return entries;
  } catch (error: unknown) {
    console.error("Wall site entries could not be loaded", error);
    return [];
  }
};
