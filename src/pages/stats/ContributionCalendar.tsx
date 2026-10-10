import {
   useEffect,
   useLayoutEffect,
   useMemo,
   useRef,
   useState,
   type CSSProperties,
} from "react";
import { useInView } from "motion/react";
import useMotionPreference from "@hooks/useMotionPreference";
import {
   CALENDAR_COPY,
   DAY_LABELS,
   LEVELS,
   buildCalendar,
   describeCalendar,
   formatBusiest,
   formatDayTip,
   formatDays,
   loadContributions,
   readCachedContributions,
   type CalendarCell,
   type CalendarSummary,
   type ContributionDay,
} from "./calendarData";
import "./calendar.css";

type LoadState =
   | { status: "loading" }
   | { status: "ready"; days: ContributionDay[] }
   | { status: "error" };

/** pending: loaded but not yet on screen; wave: revealing; static: Reduced. */
type Reveal = "pending" | "wave" | "static";

// The skeleton draws a full year so the card keeps its size when data lands.
const SKELETON_WEEKS = 53;
const SKELETON_KEYS = Array.from(
   { length: SKELETON_WEEKS * 7 },
   (_, i) => `skeleton-${i}`,
);
const TIP_GAP = 8;

const initialState = (username: string): LoadState => {
   const days = readCachedContributions(username);
   return days ? { status: "ready", days } : { status: "loading" };
};

const revealFor = (reduced: boolean, inView: boolean): Reveal => {
   if (reduced) return "static";
   return inView ? "wave" : "pending";
};

const cellIndex = (target: EventTarget | null): number | null => {
   const cell =
      target instanceof Element
         ? target.closest<HTMLElement>("[data-i]")
         : null;
   return cell ? Number(cell.dataset.i) : null;
};

// --col/--row drive the diagonal reveal delay; the first cell starts on its
// weekday row and the rest flow down the columns after it.
const cellStyle = (cell: CalendarCell, lead: number): CSSProperties =>
   ({
      "--col": cell.col,
      "--row": cell.row,
      gridRowStart: cell.index === 0 && lead > 0 ? lead + 1 : undefined,
   }) as CSSProperties;

interface Fact {
   label: string;
   value?: string;
}

/** Placeholders while loading; the busiest day drops out of an empty year. */
const factsFor = (summary?: CalendarSummary): Fact[] => {
   const facts: Fact[] = [
      {
         label: CALENDAR_COPY.current,
         value: summary && formatDays(summary.currentStreak),
      },
   ];
   if (!summary || summary.busiest) {
      facts.push({
         label: CALENDAR_COPY.busiest,
         value: summary?.busiest ? formatBusiest(summary.busiest) : undefined,
      });
   }
   return facts;
};

interface ContributionCalendarProps {
   username: string;
}

/** A year of GitHub contributions as a 53-week heatmap. Cells fill the width
 *  on desktop and keep a tappable minimum on phones, where the grid scrolls
 *  inside the card starting at the newest week. Data loads live; on any
 *  failure the heatmap stays out of the card. */
const ContributionCalendar = ({
   username,
}: Readonly<ContributionCalendarProps>) => {
   const { reducedMotion } = useMotionPreference();
   const [state, setState] = useState<LoadState>(() => initialState(username));
   const [active, setActive] = useState<number | null>(null);
   const rootRef = useRef<HTMLDivElement>(null);
   const scrollerRef = useRef<HTMLDivElement>(null);
   const gridRef = useRef<HTMLDivElement>(null);
   const tipRef = useRef<HTMLDivElement>(null);
   const inView = useInView(rootRef, { once: true, amount: 0.3 });

   useEffect(() => {
      if (state.status !== "loading") return;
      let live = true;
      loadContributions(username).then(
         (days) => {
            if (live) setState({ status: "ready", days });
         },
         () => {
            if (live) setState({ status: "error" });
         },
      );
      return () => {
         live = false;
      };
   }, [username, state.status]);

   const model = useMemo(
      () => (state.status === "ready" ? buildCalendar(state.days) : null),
      [state],
   );

   // Start at the newest week, and fade whichever edge has more to scroll.
   useLayoutEffect(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const syncFades = () => {
         const end = scroller.scrollWidth - scroller.clientWidth - 1;
         scroller.toggleAttribute("data-fade-start", scroller.scrollLeft > 1);
         scroller.toggleAttribute("data-fade-end", scroller.scrollLeft < end);
      };
      const onScroll = () => {
         syncFades();
         setActive(null);
      };
      scroller.scrollLeft = scroller.scrollWidth;
      syncFades();
      scroller.addEventListener("scroll", onScroll, { passive: true });
      const observer = new ResizeObserver(syncFades);
      observer.observe(scroller);
      return () => {
         scroller.removeEventListener("scroll", onScroll);
         observer.disconnect();
      };
   }, [model]);

   // Hover shows the tip on fine pointers; on touch a tap opens it and a
   // second tap on the same day closes it.
   useEffect(() => {
      const grid = gridRef.current;
      if (!grid || !model) return;
      let pointerType = "mouse";
      const onDown = (event: PointerEvent) => {
         pointerType = event.pointerType;
      };
      const onMove = (event: PointerEvent) => {
         if (event.pointerType !== "touch") setActive(cellIndex(event.target));
      };
      const onLeave = (event: PointerEvent) => {
         if (event.pointerType !== "touch") setActive(null);
      };
      const onClick = (event: MouseEvent) => {
         if (pointerType !== "touch") return;
         const index = cellIndex(event.target);
         setActive((current) => (current === index ? null : index));
      };
      grid.addEventListener("pointerdown", onDown);
      grid.addEventListener("pointermove", onMove);
      grid.addEventListener("pointerleave", onLeave);
      grid.addEventListener("click", onClick);
      return () => {
         grid.removeEventListener("pointerdown", onDown);
         grid.removeEventListener("pointermove", onMove);
         grid.removeEventListener("pointerleave", onLeave);
         grid.removeEventListener("click", onClick);
      };
   }, [model]);

   // A tap anywhere outside the grid closes an open tip.
   useEffect(() => {
      if (active === null) return;
      const close = (event: PointerEvent) => {
         if (!gridRef.current?.contains(event.target as Node)) setActive(null);
      };
      document.addEventListener("pointerdown", close);
      return () => document.removeEventListener("pointerdown", close);
   }, [active]);

   // Place the tip above its cell, clamped to the heatmap width (which is the
   // card content width), and mark the cell.
   useLayoutEffect(() => {
      const tip = tipRef.current;
      const root = rootRef.current;
      const cell = gridRef.current?.querySelector<HTMLElement>(
         `[data-i="${active}"]`,
      );
      if (!tip || !root || !cell) return;
      const box = root.getBoundingClientRect();
      const rect = cell.getBoundingClientRect();
      const centered =
         rect.left + rect.width / 2 - box.left - tip.offsetWidth / 2;
      const x = Math.max(0, Math.min(centered, box.width - tip.offsetWidth));
      const y = rect.top - box.top - tip.offsetHeight - TIP_GAP;
      tip.style.transform = `translate(${x}px, ${y}px)`;
      cell.dataset.active = "";
      return () => {
         delete cell.dataset.active;
      };
   }, [active, model]);

   const cells = useMemo(() => {
      if (!model) return null;
      const lastIndex = model.cells.length - 1;
      return model.cells.map((cell) => (
         <span
            key={cell.date}
            className="cal-cell"
            data-i={cell.index}
            data-level={cell.level}
            data-today={cell.index === lastIndex || undefined}
            style={cellStyle(cell, model.lead)}
         />
      ));
   }, [model]);

   if (state.status === "error" || model?.cells.length === 0) return null;

   const summary = model?.summary;
   const activeCell = active === null ? undefined : model?.cells[active];
   const bodyStyle = {
      "--weeks": model?.weeks ?? SKELETON_WEEKS,
   } as CSSProperties;

   return (
      <div ref={rootRef} className="cal" aria-busy={!model}>
         <div
            className="cal-body"
            role="img"
            aria-label={
               summary ? describeCalendar(summary) : CALENDAR_COPY.loading
            }
            style={bodyStyle}
         >
            <div className="cal-days" aria-hidden="true">
               {DAY_LABELS.map(({ row, label }) => (
                  <span key={label} style={{ gridRow: row + 1 }}>
                     {label}
                  </span>
               ))}
            </div>
            <div ref={scrollerRef} className="cal-scroller">
               <div className="cal-months" aria-hidden="true">
                  {model?.months.map(({ col, label }) => (
                     <span key={col} style={{ gridColumnStart: col + 1 }}>
                        {label}
                     </span>
                  ))}
               </div>
               <div
                  ref={gridRef}
                  className="cal-grid"
                  data-reveal={model ? revealFor(reducedMotion, inView) : null}
                  data-loading={model ? undefined : ""}
                  aria-hidden="true"
               >
                  {cells ??
                     SKELETON_KEYS.map((key) => (
                        <span key={key} className="cal-cell" />
                     ))}
               </div>
            </div>
         </div>

         <div className="cal-foot">
            <dl className="cal-facts">
               {factsFor(summary).map((fact) => (
                  <div key={fact.label}>
                     <dt>{fact.label}</dt>
                     <dd>
                        {fact.value ?? (
                           <span className="skeleton cal-fact-skeleton" />
                        )}
                     </dd>
                  </div>
               ))}
            </dl>
            <div className="cal-legend" aria-hidden="true">
               <span>{CALENDAR_COPY.less}</span>
               {LEVELS.map((level) => (
                  <span key={level} className="cal-swatch" data-level={level} />
               ))}
               <span>{CALENDAR_COPY.more}</span>
            </div>
         </div>

         {activeCell && (
            <div ref={tipRef} className="cal-tip" aria-hidden="true">
               {formatDayTip(activeCell)}
            </div>
         )}
      </div>
   );
};

export default ContributionCalendar;
