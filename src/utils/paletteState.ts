import { createStore } from "./createStore";

/* Open/closed flag for the command palette, shared by the global Cmd/Ctrl+K
   listener, the nav triggers and the palette itself. */

const palette = createStore(false);

export const setPaletteOpen = (next: boolean) => palette.set(next);

export const usePaletteOpen = palette.useValue;
