export type WallNote = {
  id: number;
  content: string;
  created_at: string;
};

export type WallCursor = { created_at: string; id: number };

export const wallPageSize = 50;

export const parseWallCursor = (params: URLSearchParams): WallCursor | null => {
  const value = params.get("before");
  if (!value) return null;

  // Accept existing timestamp-only bookmarks as well as the new tied-ID cursor.
  if (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/.test(value)) {
    return null;
  }
  const timestamp = value.replace("T", " ").slice(0, 19);
  const date = new Date(`${timestamp.replace(" ", "T")}Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 19).replace("T", " ") !== timestamp
  ) {
    return null;
  }

  const rawId = params.get("id");
  const id = rawId === null ? Number.MIN_SAFE_INTEGER : Number(rawId);
  if (
    rawId !== null &&
    (!/^-?\d+$/.test(rawId) || !Number.isSafeInteger(id) || id === 0)
  ) {
    return null;
  }
  return { created_at: timestamp, id };
};

export const wallPostsQuery = `
  SELECT id, content, created_at
  FROM entries
  WHERE hidden_at IS NULL
    AND instr(lower(content), lower(?)) > 0
    AND (? IS NULL OR created_at < ? OR (created_at = ? AND id < ?))
  ORDER BY created_at DESC, id DESC
  LIMIT ?
`;

export const wallUrl = (entry: WallCursor | null = null, query = "") => {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (entry) {
    params.set("before", entry.created_at);
    params.set("id", String(entry.id));
  }
  return params.size ? `/wall/?${params}` : "/wall/";
};

export type WallSiteEntry = {
  id: number;
  kind: "post" | "til" | "book";
  title: string;
  href: string | null;
  created_at: string;
};

export type WallItem =
  | ({ type: "note" } & WallNote)
  | ({ type: "site" } & WallSiteEntry);

// Built at build time by src/pages/wall-feed.json.ts, so the Worker never bundles content bodies.
export const wallFeedPath = "/wall-feed.json";

const kindLabels: Record<WallSiteEntry["kind"], string> = {
  post: "post",
  til: "TIL",
  book: "book",
};

export const wallSiteEntryLabel = (entry: WallSiteEntry) =>
  `Added new ${kindLabels[entry.kind]}:`;

// Stable negative IDs keep site entries apart from D1 IDs in the pagination cursor.
export const wallSiteEntryId = (key: string) => {
  let hash = 0x811c9dc5;
  for (const char of key) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193);
  }
  return -((hash >>> 0) % 0x7fffffff) - 1;
};

export const compareWallItems = (a: WallCursor, b: WallCursor) =>
  a.created_at === b.created_at
    ? b.id - a.id
    : a.created_at < b.created_at
      ? 1
      : -1;

export const isBeforeCursor = (item: WallCursor, cursor: WallCursor | null) =>
  !cursor || compareWallItems(cursor, item) < 0;
