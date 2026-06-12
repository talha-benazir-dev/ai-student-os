/** YYYY-MM-DD in the user's local timezone */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convert an ISO timestamp to a local calendar date key */
export function localDateKeyFromISO(isoString: string): string {
  return localDateKey(new Date(isoString));
}

/** Start of local day, N days before today (for query lower bounds) */
export function startOfLocalDayDaysAgo(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

/** Build an ordered list of local date keys for the last N days (inclusive of today) */
export function localDateRange(days: number): string[] {
  const keys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1 - i));
    keys.push(localDateKey(d));
  }
  return keys;
}
