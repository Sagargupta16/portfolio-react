import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { getContactOptions } from "@data/contact";
import { MONO_FONT, TEXT_SECONDARY } from "@/constants/theme";
import useMotionPreference from "@hooks/useMotionPreference";
import useBreakpoint from "@hooks/useBreakpoint";
import SlideToContact from "./SlideToContact";

/* The end of the page, said plainly: an end-of-scroll line, a press-and-hold
   control that copies his email (a ring fills while held; letting go early
   cancels), and "your visit, measured on you": this page's own Core Web
   Vitals read live from the visitor's browser via web-vitals (lazy chunk).
   Ideas from warmnfuzzy.tv, mattjinn.com and jamiemckaye.com. */

const HOLD_MS = 650;
const RING = 2 * Math.PI * 9;

type Rating = "good" | "needs-improvement" | "poor";
interface Reading {
   value: string;
   rating: Rating;
}
type MetricName = "LCP" | "INP" | "CLS" | "TTFB";
const METRICS: MetricName[] = ["LCP", "INP", "CLS", "TTFB"];
const RATING_COLOR: Record<Rating, string> = {
   good: "#22c55e",
   "needs-improvement": "#f59e0b",
   poor: "#f87171",
};

const format = (name: MetricName, value: number) => {
   if (name === "CLS") return value.toFixed(3);
   if (value >= 1000) return `${(value / 1000).toFixed(2)} s`;
   return `${Math.round(value)} ms`;
};

const useWebVitals = () => {
   const [readings, setReadings] = useState<
      Partial<Record<MetricName, Reading>>
   >({});
   useEffect(() => {
      let live = true;
      void import("web-vitals").then(({ onCLS, onINP, onLCP, onTTFB }) => {
         const report = (metric: {
            name: string;
            value: number;
            rating: Rating;
         }) => {
            if (!live) return;
            const name = metric.name as MetricName;
            setReadings((prev) => ({
               ...prev,
               [name]: {
                  value: format(name, metric.value),
                  rating: metric.rating,
               },
            }));
         };
         const opts = { reportAllChanges: true };
         onLCP(report, opts);
         onINP(report, opts);
         onCLS(report, opts);
         onTTFB(report, opts);
      });
      return () => {
         live = false;
      };
   }, []);
   return readings;
};

const HoldToCopy = ({ email }: { email: string }) => {
   const { reducedMotion } = useMotionPreference();
   const progress = useMotionValue(0);
   const dashOffset = useTransform(progress, (p) => RING * (1 - p));
   const [copied, setCopied] = useState(false);
   const runRef = useRef<ReturnType<typeof animate> | null>(null);
   const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   useEffect(
      () => () => {
         runRef.current?.stop();
         if (resetRef.current) clearTimeout(resetRef.current);
      },
      [],
   );

   const copy = () => {
      void navigator.clipboard?.writeText(email).then(() => {
         setCopied(true);
         if (resetRef.current) clearTimeout(resetRef.current);
         resetRef.current = setTimeout(() => {
            setCopied(false);
            progress.set(0);
         }, 1800);
      });
   };

   const start = () => {
      if (copied) return;
      runRef.current?.stop();
      runRef.current = animate(progress, 1, {
         duration: reducedMotion ? 0 : HOLD_MS / 1000,
         ease: "linear",
         onComplete: copy,
      });
   };
   const cancel = () => {
      if (copied) return;
      runRef.current?.stop();
      animate(progress, 0, { duration: 0.2 });
   };

   return (
      <button
         type="button"
         className="hold-copy"
         onPointerDown={start}
         onPointerUp={cancel}
         onPointerLeave={cancel}
         onPointerCancel={cancel}
         onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
               e.preventDefault();
               start();
            }
         }}
         onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") cancel();
         }}
         onContextMenu={(e) => e.preventDefault()}
      >
         <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <circle
               cx="11"
               cy="11"
               r="9"
               fill="none"
               stroke="rgba(255,255,255,0.12)"
               strokeWidth="2"
            />
            <motion.circle
               cx="11"
               cy="11"
               r="9"
               fill="none"
               stroke="var(--color-accent-cyan)"
               strokeWidth="2"
               strokeLinecap="round"
               strokeDasharray={RING}
               style={{
                  strokeDashoffset: dashOffset,
                  rotate: -90,
                  originX: "50%",
                  originY: "50%",
               }}
            />
         </svg>
         <span aria-live="polite">
            {copied ? "Copied. Talk soon." : `Hold to copy ${email}`}
         </span>
      </button>
   );
};

const FooterEndNote = () => {
   const emailOption = getContactOptions().find((option) =>
      option.link.startsWith("mailto:"),
   );
   const email = emailOption?.value ?? "";
   const vitals = useWebVitals();
   const { isMobile } = useBreakpoint();

   return (
      <div className="footer-endnote">
         <p className="display-heading footer-endnote-line">
            You&apos;ve reached the bottom. Everything from here is an{" "}
            <em className="accent-serif">email</em>.
         </p>
         {/* Phones slide to open the mail app; desktop holds to copy. */}
         {email && isMobile && emailOption && (
            <SlideToContact href={emailOption.link} />
         )}
         {email && !isMobile && <HoldToCopy email={email} />}

         <div className="footer-vitals" aria-label="Your visit, measured live">
            <span
               style={{
                  fontFamily: MONO_FONT,
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: TEXT_SECONDARY,
               }}
            >
               Your visit, measured on you
            </span>
            {METRICS.map((name) => {
               const reading = vitals[name];
               return (
                  <span key={name} className="footer-vital">
                     <span
                        aria-hidden="true"
                        className="footer-vital-dot"
                        style={{
                           background: reading
                              ? RATING_COLOR[reading.rating]
                              : "rgba(255,255,255,0.18)",
                        }}
                     />
                     {name}{" "}
                     <span className="footer-vital-value">
                        {reading?.value ??
                           (name === "INP" ? "tap anything" : "...")}
                     </span>
                  </span>
               );
            })}
         </div>
      </div>
   );
};

export default FooterEndNote;
