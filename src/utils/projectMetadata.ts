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

/** Parse the "September 2026" dates shared by project cards and the hero. */
export const parseProjectDate = (dateStr: string): Date => {
   const [month, year] = dateStr.split(" ");
   const y = Number(year);
   // ?? (not ||) so a valid "January" (index 0) isn't treated as missing.
   return new Date(Number.isFinite(y) ? y : 0, MONTHS[month] ?? 0);
};

/** Exclude empty links and the "#" placeholder. URL validation runs in validate:data. */
export const hasProjectUrl = (url: string | undefined): url is string =>
   !!url && url !== "#";
