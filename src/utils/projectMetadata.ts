const MONTHS: Record<string, number> = {
   January: 0,
   February: 1,
   March: 2,
   April: 3,
   May: 4,
   June: 5,
   July: 6,
   August: 7,
   September: 8,
   October: 9,
   November: 10,
   December: 11,
};

/** Parse the "September 2026" dates shared by project cards and the hero;
 *  null when the month name or the year is not recognised. */
export const tryParseProjectDate = (dateStr: string): Date | null => {
   const [month, year] = dateStr.split(" ");
   const y = Number(year);
   const m = MONTHS[month];
   // typeof (not a truthiness test) so a valid "January" (index 0) counts.
   if (typeof m !== "number" || !Number.isFinite(y) || y === 0) return null;
   return new Date(y, m);
};

/** The sort key for a project date. An unparseable one becomes 1900, older
 *  than every real project, so it lands last in a newest-first list; use
 *  tryParseProjectDate to tell the two apart. */
export const parseProjectDate = (dateStr: string): Date =>
   tryParseProjectDate(dateStr) ?? new Date(0, 0);

/** Exclude empty links and the "#" placeholder. URL validation runs in validate:data. */
export const hasProjectUrl = (url: string | undefined): url is string =>
   !!url && url !== "#";
