import { useSyncExternalStore } from "react";

/* Open/closed flag for the command palette, shared by the global Cmd/Ctrl+K
   listener, the nav triggers and the palette itself. */

let open = false;
const listeners = new Set<() => void>();

export const setPaletteOpen = (next: boolean) => {
   if (open === next) return;
   open = next;
   for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
   listeners.add(listener);
   return () => listeners.delete(listener);
};

export const usePaletteOpen = () =>
   useSyncExternalStore(
      subscribe,
      () => open,
      () => false,
   );
