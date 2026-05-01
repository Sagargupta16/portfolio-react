/**
 * Split a "YYYY - YYYY" or "Aug 2024 - Present" style range into start / end.
 * Returns the whole string as `start` if no delimiter is found -- callers
 * should never access `end` without checking for undefined.
 */
export const splitDateRange = (
   range: string,
): { start: string; end?: string } => {
   const parts = range.split(" - ");
   const start = parts[0] ?? range;
   const end = parts.length > 1 ? parts[parts.length - 1] : undefined;
   return { start, end };
};

/**
 * True when a date range ends in "Present" (case-insensitive, trimmed).
 * Used by timeline cards to surface a live "active" indicator on current roles.
 */
export const isPresent = (range: string): boolean => {
   const { end } = splitDateRange(range);
   return end?.trim().toLowerCase() === "present";
};
