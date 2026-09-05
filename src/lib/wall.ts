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
