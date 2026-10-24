import { createStore } from "./createStore";

/* Tiny shared flag: is the opening splash still covering the page?
   IntroSplash flips it; the hero holds its entrance until it clears, so the
   choreography plays as the curtain lifts instead of hidden underneath it. */

const introDone = createStore(true);

// Runs during IntroSplash's first render, before the hero subscribes, so it
// stays silent rather than waking listeners mid-render.
export const markIntroActive = () => introDone.set(false, false);

export const markIntroDone = () => introDone.set(true);

/** True once no splash is covering the page (always true when none ran). */
export const useIntroDone = introDone.useValue;
