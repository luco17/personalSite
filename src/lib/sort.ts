// Sort content entries newest first.
export const byDateDesc = (
  a: { data: { date: Date } },
  b: { data: { date: Date } },
): number => b.data.date.valueOf() - a.data.date.valueOf();
