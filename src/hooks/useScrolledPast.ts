import { useEffect, useState } from "react";

/**
 * True while the window is scrolled more than `threshold` px down. A boolean
 * flip only: React bails out when it is unchanged, so callers never re-render
 * per frame while scrolling. Lenis drives the native window scroll in root
 * mode, so scrollY tracks it directly.
 */
const useScrolledPast = (threshold: number): boolean => {
   const [past, setPast] = useState(
      () => globalThis.window != null && window.scrollY > threshold,
   );

   useEffect(() => {
      const onScroll = () => setPast(window.scrollY > threshold);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
   }, [threshold]);

   return past;
};

export default useScrolledPast;
