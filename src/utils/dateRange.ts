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
