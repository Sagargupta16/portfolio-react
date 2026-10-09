import { useSyncExternalStore } from "react";

/* Which section the mascot is perched in: the last section to cross a thin
   band 35-40% down the viewport (the same band the nav highlight uses). One
   shared IntersectionObserver; each SectionHeader's Mascot registers its own
   section anchor, which stays mounted while the section's content lazy-loads. */

let active: string | null = null;
const listeners = new Set<() => void>();
let observer: IntersectionObserver | null = null;

const getObserver = () => {
   if (observer || typeof IntersectionObserver === "undefined") return observer;
   observer = new IntersectionObserver(
      (entries) => {
         for (const entry of entries) {
            if (!entry.isIntersecting || entry.target.id === active) continue;
            active = entry.target.id;
            for (const listener of listeners) listener();
         }
      },
      { rootMargin: "-35% 0px -60% 0px" },
   );
   return observer;
};

/** Starts tracking a section anchor by id; returns the cleanup. */
export const watchMascotSection = (id: string) => {
   const element = document.getElementById(id);
   const io = getObserver();
   if (!element || !io) return undefined;
   io.observe(element);
   return () => io.unobserve(element);
};

const subscribe = (listener: () => void) => {
   listeners.add(listener);
   return () => listeners.delete(listener);
};

export const useMascotSection = () =>
   useSyncExternalStore(
      subscribe,
      () => active,
      () => null,
   );
