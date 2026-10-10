/* Data and arithmetic for the contribution heatmap in the Stats GitHub card.
   The day counts come live from the public contributions API (the same source
   the old react-github-calendar widget used). The card headline keeps the
   weekly-synced totals, so the heatmap adds only what the sync does not carry:
   the grid itself, the current streak and the busiest day. */

export interface ContributionDay {
   /** ISO calendar date, YYYY-MM-DD. */
   date: string;
   count: number;
}

export type Level = 0 | 1 | 2 | 3 | 4;

export interface CalendarCell extends ContributionDay {
   level: Level;
   /** Position in the day list; the DOM keys tooltips by it. */
   index: number;
   /** Week column (0 = oldest) and weekday row (0 = Sunday). */
   col: number;
   row: number;
}

export interface MonthLabel {
   col: number;
   label: string;
}

export interface CalendarSummary {
   currentStreak: number;
   busiest: ContributionDay | null;
}

export interface CalendarModel {
   cells: CalendarCell[];
   /** Empty slots before the first day, so the first column starts on Sunday. */
   lead: number;
   weeks: number;
   months: MonthLabel[];
   summary: CalendarSummary;
}

export const CALENDAR_COPY = {
   label: "Daily GitHub contributions over the last year",
   current: "Current streak",
   busiest: "Busiest day",
   less: "Less",
   more: "More",
   loading: "Loading GitHub contributions",
} as const;

/** Weekday rows that carry a label (Sunday is row 0), as GitHub draws them. */
export const DAY_LABELS = [
   { row: 1, label: "Mon" },
   { row: 3, label: "Wed" },
   { row: 5, label: "Fri" },
] as const;

export const LEVELS: readonly Level[] = [0, 1, 2, 3, 4];

/** Columns a month label needs before the next one (or the grid end). */
const LABEL_SPAN = 3;
const DAYS_PER_WEEK = 7;
const DAY_MS = 86_400_000;
const API_URL = "https://github-contributions-api.jogruber.de/v4/";
const TIMEOUT_MS = 10_000;
const LOCALE = "en-US";

const DATE_FORMAT = new Intl.DateTimeFormat(LOCALE, {
   month: "short",
   day: "numeric",
   year: "numeric",
   timeZone: "UTC",
});
const SHORT_DATE_FORMAT = new Intl.DateTimeFormat(LOCALE, {
   month: "short",
   day: "numeric",
   timeZone: "UTC",
});
const MONTH_FORMAT = new Intl.DateTimeFormat(LOCALE, {
   month: "short",
   timeZone: "UTC",
});

/** Midnight UTC of an ISO date; calendar dates carry no time zone. */
const toUtc = (iso: string): number => {
   const [year, month, day] = iso.split("-").map(Number);
   return Date.UTC(year, month - 1, day);
};

const dayNumber = (iso: string): number => Math.round(toUtc(iso) / DAY_MS);

export const formatCount = (n: number): string => n.toLocaleString(LOCALE);

const plural = (n: number, one: string, many: string): string =>
   `${formatCount(n)} ${n === 1 ? one : many}`;

export const formatDays = (n: number): string => plural(n, "day", "days");

/** "12 contributions on Sep 29, 2026", singular for 1, "No contributions" for 0. */
export const formatDayTip = ({ date, count }: ContributionDay): string => {
   const when = DATE_FORMAT.format(toUtc(date));
   const what =
      count === 0
         ? "No contributions"
         : plural(count, "contribution", "contributions");
   return `${what} on ${when}`;
};

/** "1,926 on Mar 5". */
export const formatBusiest = ({ date, count }: ContributionDay): string =>
   `${formatCount(count)} on ${SHORT_DATE_FORMAT.format(toUtc(date))}`;

/** Five levels by quartile of the active days, so one huge day (an import, a
 *  bulk migration) does not flatten every other day into the palest green. */
export const bucketLevels = (counts: readonly number[]): Level[] => {
   const active = counts.filter((c) => c > 0).sort((a, b) => a - b);
   const quantile = (p: number) =>
      active[Math.floor(p * (active.length - 1))] ?? 0;
   const thresholds = [quantile(0.25), quantile(0.5), quantile(0.75)];
   return counts.map((c) => {
      if (c <= 0) return 0;
      return (1 + thresholds.filter((t) => c > t).length) as Level;
   });
};

/** Days that ran back from the last active day without a gap. A quiet last
 *  day does not break the run: today is not over yet. */
const currentStreak = (days: readonly ContributionDay[]): number => {
   let i = days.length - 1;
   if (days[i]?.count === 0) i -= 1;
   let streak = 0;
   let expected = i >= 0 ? dayNumber(days[i].date) : 0;
   while (i >= 0 && days[i].count > 0 && dayNumber(days[i].date) === expected) {
      streak += 1;
      expected -= 1;
      i -= 1;
   }
   return streak;
};

/** The busiest day, the first one on a tie; null when nothing was committed. */
const busiestDay = (
   days: readonly ContributionDay[],
): ContributionDay | null => {
   let busiest: ContributionDay | null = null;
   for (const day of days) {
      if (day.count > (busiest?.count ?? 0)) busiest = day;
   }
   return busiest;
};

/** What the heatmap adds to the synced headline numbers. The streak follows
 *  calendar dates, so a missing date breaks it. */
export const summarize = (
   days: readonly ContributionDay[],
): CalendarSummary => ({
   currentStreak: currentStreak(days),
   busiest: busiestDay(days),
});

/** A month is labelled over the first column whose first day falls in it,
 *  skipping a label that would crowd its neighbour or run off the end. */
const monthLabels = (
   cells: readonly CalendarCell[],
   weeks: number,
): MonthLabel[] => {
   const labels: MonthLabel[] = [];
   let lastMonth = "";
   for (const cell of cells) {
      if (cell.row !== 0 && cell.index !== 0) continue;
      const month = cell.date.slice(0, 7);
      if (month === lastMonth) continue;
      lastMonth = month;
      labels.push({
         col: cell.col,
         label: MONTH_FORMAT.format(toUtc(cell.date)),
      });
   }
   if (labels.length > 1 && labels[1].col - labels[0].col < LABEL_SPAN) {
      labels.shift();
   }
   return labels.filter((l) => l.col + LABEL_SPAN <= weeks);
};

export const buildCalendar = (
   days: readonly ContributionDay[],
): CalendarModel => {
   const levels = bucketLevels(days.map((d) => d.count));
   const lead = days.length > 0 ? new Date(toUtc(days[0].date)).getUTCDay() : 0;
   const cells = days.map((day, index) => ({
      ...day,
      level: levels[index],
      index,
      col: Math.floor((lead + index) / DAYS_PER_WEEK),
      row: (lead + index) % DAYS_PER_WEEK,
   }));
   const weeks = Math.ceil((lead + days.length) / DAYS_PER_WEEK);
   return {
      cells,
      lead,
      weeks,
      months: monthLabels(cells, weeks),
      summary: summarize(days),
   };
};

/** Screen-reader summary for the grid, which is drawn as one image. */
export const describeCalendar = ({
   currentStreak: current,
   busiest,
}: CalendarSummary): string => {
   const parts = [`${CALENDAR_COPY.current} ${formatDays(current)}`];
   if (busiest) {
      parts.push(
         `${CALENDAR_COPY.busiest.toLowerCase()} ${formatBusiest(busiest)}`,
      );
   }
   return `${CALENDAR_COPY.label}. ${parts.join(", ")}.`;
};

const isDay = (value: unknown): value is ContributionDay => {
   const day = value as Partial<ContributionDay> | null;
   return (
      typeof day?.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
      typeof day.count === "number" &&
      day.count >= 0
   );
};

/** Keeps the date and count of every well-formed day, oldest first. */
export const parseContributions = (body: unknown): ContributionDay[] => {
   const list = (body as { contributions?: unknown } | null)?.contributions;
   if (!Array.isArray(list)) {
      throw new TypeError("Unexpected contributions payload");
   }
   return list
      .filter(isDay)
      .map(({ date, count }) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
};

const fetchContributions = async (
   username: string,
): Promise<ContributionDay[]> => {
   const response = await fetch(
      `${API_URL}${encodeURIComponent(username)}?y=last`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
   );
   if (!response.ok) {
      throw new Error(`Contributions request failed (${response.status})`);
   }
   return parseContributions(await response.json());
};

// Module-level cache: the section remounts (lazy loading, error boundary
// retries) without refetching. A failed request is dropped so a later mount
// can try again.
const pending = new Map<string, Promise<ContributionDay[]>>();
const loaded = new Map<string, ContributionDay[]>();

export const readCachedContributions = (
   username: string,
): ContributionDay[] | undefined => loaded.get(username);

export const loadContributions = (
   username: string,
): Promise<ContributionDay[]> => {
   const existing = pending.get(username);
   if (existing) return existing;
   const request = fetchContributions(username).then(
      (days) => {
         loaded.set(username, days);
         return days;
      },
      (error: unknown) => {
         pending.delete(username);
         throw error;
      },
   );
   pending.set(username, request);
   return request;
};
