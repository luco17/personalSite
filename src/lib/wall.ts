export type WallNote = {
  id: number;
  content: string;
  created_at: string;
};

export type WallLink = {
  id: number;
  title: string;
  url: string;
  month: string;
  created_at: string;
};

export type WallEntry = WallNote | WallLink;
export type WallCursor = { created_at: string; id: number };

export const wallPageSize = 50;

// Negative IDs keep saved links distinct from D1 notes, while preserving their
// original ascending curation order when several links share a month.
export const savedLink = (link: {
  id: string;
  data: { title: string; url: string; month: string };
}): WallLink => ({
  ...link.data,
  id: -Number(link.id),
  created_at: `${link.data.month}-01 00:00:00`,
});

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
    AND (? IS NULL OR created_at < ? OR (created_at = ? AND id < ?))
  ORDER BY created_at DESC, id DESC
  LIMIT ?
`;

export const wallPage = (
  notes: WallNote[],
  links: WallLink[],
  before: WallCursor | null,
) => {
  const entries: WallEntry[] = [...notes, ...links]
    .filter(
      (entry) =>
        !before ||
        entry.created_at < before.created_at ||
        (entry.created_at === before.created_at && entry.id < before.id),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);
  return {
    entries: entries.slice(0, wallPageSize),
    hasMore: entries.length > wallPageSize,
  };
};

export const wallCursorUrl = (entry: WallCursor) =>
  `/wall/?${new URLSearchParams({ before: entry.created_at, id: String(entry.id) })}`;
