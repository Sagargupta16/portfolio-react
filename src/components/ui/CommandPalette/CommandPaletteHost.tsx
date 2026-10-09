import { lazy, Suspense, useEffect, useState } from "react";
import { setPaletteOpen, usePaletteOpen } from "@utils/paletteState";

const CommandPalette = lazy(() => import("./CommandPalette"));

/* Always mounted and tiny: owns the Cmd/Ctrl+K shortcut and loads the palette
   chunk (cmdk) the first time it opens, then keeps it mounted. */
const CommandPaletteHost = () => {
   const open = usePaletteOpen();
   const [loaded, setLoaded] = useState(false);

   useEffect(() => {
      const onKey = (event: KeyboardEvent) => {
         if (
            event.key.toLowerCase() === "k" &&
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
      <Suspense fallback={null}>
         <CommandPalette open={open} />
      </Suspense>
   );
};

export default CommandPaletteHost;
