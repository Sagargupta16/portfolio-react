import { lazy, Suspense, useEffect, useState } from "react";
import ErrorBoundary from "@components/common/ErrorBoundary";
import { setPaletteOpen, usePaletteOpen } from "@utils/paletteState";

const CommandPalette = lazy(() => import("./CommandPalette"));

/* Truthy on purpose (a falsy fallback renders ErrorBoundary's full panel): a
   failed palette chunk leaves the shortcut inert instead of blanking the page
   through the root boundary. */
const OMIT_PALETTE = <></>;

/* Always mounted and tiny: owns the Cmd/Ctrl+K shortcut and loads the palette
   chunk (cmdk) the first time it opens, then keeps it mounted. */
const CommandPaletteHost = () => {
   const open = usePaletteOpen();
   const [loaded, setLoaded] = useState(false);

   useEffect(() => {
      const onKey = (event: KeyboardEvent) => {
         if (
            event.key?.toLowerCase() === "k" &&
            (event.metaKey || event.ctrlKey)
         ) {
            event.preventDefault();
            setPaletteOpen(!open);
         }
      };
      globalThis.addEventListener("keydown", onKey);
      return () => globalThis.removeEventListener("keydown", onKey);
   }, [open]);

   if (open && !loaded) setLoaded(true);
   if (!loaded) return null;

   return (
      <ErrorBoundary fallback={OMIT_PALETTE}>
         <Suspense fallback={null}>
            <CommandPalette open={open} />
         </Suspense>
      </ErrorBoundary>
   );
};

export default CommandPaletteHost;
