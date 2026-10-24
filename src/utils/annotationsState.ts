import { createStore } from "./createStore";

/* On/off flag for the "how it's built" annotations, shared by the nav toggle,
   the command palette and the pin layer. */

const annotations = createStore(false);

export const setAnnotationsOn = (next: boolean) => annotations.set(next);

export const toggleAnnotations = () => setAnnotationsOn(!annotations.get());

export const useAnnotationsOn = annotations.useValue;
