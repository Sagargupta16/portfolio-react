import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { fadeInUp } from "@utils/animations";
import { MONO_FONT, TEXT_MUTED } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import AnimatedCounter from "@components/ui/AnimatedCounter";
import { CAPTION_STYLE } from "./statsTokens";

interface WideProfileCardProps {
   area: string;
   icon: ReactNode;
   label: string;
   color: string;
   meta?: string;
   href: string;
   linkLabel: string;
   children: ReactNode;
}

/** A platform card that carries numbers and charts. Only its View link is
 *  interactive, so the card itself does not lift or tint on hover. */
export const WideProfileCard = ({
   area,
   icon,
   label,
   color,
   meta,
   href,
   linkLabel,
   children,
}: Readonly<WideProfileCardProps>) => {
   const { isMobile } = useBreakpoint();

   return (
      <motion.article
         variants={fadeInUp}
         style={{
            gridArea: area,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            padding: isMobile ? "18px 16px" : "22px",
            borderRadius: 20,
            border: "1px solid rgb(255 255 255 / 0.06)",
            background: "var(--color-bg-card)",
            minWidth: 0,
         }}
      >
         <header
            style={{
               display: "flex",
               alignItems: "center",
               gap: 8,
               minWidth: 0,
            }}
         >
            {icon}
            <h4
               style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  flexShrink: 0,
               }}
            >
               {label}
            </h4>
            {meta && (
               <span
                  style={{
                     fontFamily: MONO_FONT,
                     fontSize: 11,
                     color: TEXT_MUTED,
                     minWidth: 0,
                     overflow: "hidden",
                     textOverflow: "ellipsis",
                     whiteSpace: "nowrap",
                  }}
               >
                  {meta}
               </span>
            )}
            <a
               href={href}
               target="_blank"
               rel="noopener noreferrer"
               aria-label={linkLabel}
               style={{
                  marginLeft: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 0",
                  fontSize: 11,
                  color,
                  flexShrink: 0,
               }}
            >
               View
               <ArrowUpRight
                  size={14}
                  className="action-arrow action-arrow--external"
                  aria-hidden="true"
               />
            </a>
         </header>
         {children}
      </motion.article>
   );
};

interface MetricsProps {
   items: { value: string; label: string }[];
}

/** A row of counters with captions, three across at every width; numbers
 *  line up along the top even when a caption wraps. */
export const Metrics = ({ items }: Readonly<MetricsProps>) => {
   const { isMobile } = useBreakpoint();

   return (
      <dl
         style={{
            display: "grid",
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            gap: 12,
            margin: 0,
         }}
      >
         {items.map((item) => (
            <div
               key={item.label}
               style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  minWidth: 0,
               }}
            >
               <dt style={{ ...CAPTION_STYLE, order: 1 }}>{item.label}</dt>
               <dd style={{ margin: 0, whiteSpace: "nowrap" }}>
                  <AnimatedCounter value={item.value} compact={isMobile} />
               </dd>
            </div>
         ))}
      </dl>
   );
};
