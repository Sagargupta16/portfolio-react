import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";

/* Phone version of the footer email control: drag the knob to the end of the
   track to open the mail app (slide-to-unlock, from aashuu.me). It is still a
   real mailto link, so a tap or the keyboard opens it the ordinary way; a
   drag that lands short springs back. Desktop keeps press-and-hold copy. */

const KNOB = 44;
const PAD = 4;
const COMMIT = 0.85;
const SPRING = { type: "spring", stiffness: 520, damping: 38 } as const;

const SlideToContact = ({ href }: { href: string }) => {
   const trackRef = useRef<HTMLAnchorElement>(null);
   const draggedRef = useRef(false);
   const [maxX, setMaxX] = useState(0);
   const [sent, setSent] = useState(false);
   const x = useMotionValue(0);
   const labelOpacity = useTransform(x, [0, Math.max(maxX * 0.6, 1)], [1, 0]);
   const fill = useTransform(x, (v) => (maxX ? (v + KNOB) / (maxX + KNOB) : 0));

   useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      const measure = () => setMaxX(track.clientWidth - KNOB - PAD * 2);
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(track);
      return () => observer.disconnect();
   }, []);

   const onDragEnd = () => {
      if (x.get() >= maxX * COMMIT) {
         void animate(x, maxX, SPRING);
         setSent(true);
         globalThis.location.href = href;
         setTimeout(() => {
            setSent(false);
            void animate(x, 0, SPRING);
         }, 1400);
      } else {
         void animate(x, 0, SPRING);
      }
   };

   return (
      <a
         ref={trackRef}
         href={href}
         className="slide-contact"
         aria-label="Email me"
         onClick={(e) => {
            // The drag already opened mail; swallow the click it leaves behind.
            if (draggedRef.current) {
               e.preventDefault();
               draggedRef.current = false;
            }
         }}
      >
         <motion.span
            aria-hidden="true"
            className="slide-contact-fill"
            style={{ scaleX: fill }}
         />
         <motion.span
            aria-hidden="true"
            className="slide-contact-label"
            style={{ opacity: labelOpacity }}
         >
            slide to email me
            <ArrowRight size={13} />
         </motion.span>
         {sent && (
            <span className="slide-contact-sent" aria-live="polite">
               Opening mail
            </span>
         )}
         <motion.span
            aria-hidden="true"
            className="slide-contact-knob"
            drag="x"
            dragConstraints={{ left: 0, right: maxX }}
            dragElastic={0.04}
            dragMomentum={false}
            style={{ x }}
            onDragStart={() => {
               draggedRef.current = true;
            }}
            onDragEnd={onDragEnd}
         >
            <Mail size={18} />
         </motion.span>
      </a>
   );
};

export default SlideToContact;
