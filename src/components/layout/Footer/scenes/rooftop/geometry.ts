/* Where the painting sits in the stage box, and the lines measured on it.

   The lines are fractions of the painting's height (footer lab
   art/scene/rooftop.json): the parapet's top edge at 0.608, its foot (the
   floor line) at 0.78. The stage shows a band of the painting whose bottom is
   always the 0.95 line, so the floor sits at the same place for the cast at
   every width.

   The lab draft drew the painting clamp(400px, 41.68vw, 560px) tall (full
   width from 960 px up to 1344 px) and showed 0.25 to 0.95 of it in a box
   0.7 of that tall. The stage box here is a fixed 360 px (300 px on phones),
   so the painting grows when the draft's would not fill it: the band never
   starts above 0.2, which keeps the painting's top edge out of sight. */

/** The painting's own aspect ratio (2560 x 1067). */
export const ART_RATIO = 2560 / 1067;
export const BAND_BOTTOM = 0.95;
export const WALL_FOOT = 0.78;
export const WALL_TOP = 0.608;
const BAND_MAX = 0.75;
// The draft's sky fade: transparent at 0.25, opaque 0.16 lower.
const SKY_FADE_FROM = 0.25;
const SKY_FADE = 0.16;
// The plane's lane, as a fraction of the painting's height.
const FLIGHT = 0.285;

export interface Fit {
   /** The 768 px breakpoint: eight friends at and above it, four below. */
   wide: boolean;
   /** The stage box in CSS px. */
   width: number;
   height: number;
   /** The painting's height and width in CSS px. */
   ih: number;
   artWidth: number;
   /** The painting's top edge, px from the stage's top (zero or less). */
   top: number;
   /** The sky fade, as fractions of the painting's height. */
   fadeFrom: number;
   fadeTo: number;
   /** The plane's lane, px from the stage's top. */
   flightTop: number;
   /** Wider than the painting: px of dark on each side, else 0. */
   edge: number;
}

export function fitFor(width: number, height: number, wide: boolean): Fit {
   const drawn = Math.min(560, Math.max(400, width * 0.4168));
   const ih = Math.max(drawn, height / BAND_MAX);
   const artWidth = ih * ART_RATIO;
   const bandTop = BAND_BOTTOM - height / ih;
   const fadeFrom = Math.min(bandTop, SKY_FADE_FROM);
   return {
      wide,
      width,
      height,
      ih,
      artWidth,
      top: height - BAND_BOTTOM * ih,
      fadeFrom,
      fadeTo: fadeFrom + SKY_FADE,
      flightTop: Math.max(4, (FLIGHT - bandTop) * ih),
      edge: Math.max(0, (width - artWidth) / 2),
   };
}
