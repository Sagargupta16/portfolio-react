# Organization logo sources

These images are used beside the corresponding experience and education records.

| Asset                    | Source                                                                                          | Preparation                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `ikarus3d.webp`          | [Ikarus 3D header logo](https://d3cv7syas17klq.cloudfront.net/miscellaneous/Header_Logo_D.webp) | Crop the blue symbol from the supplied header logo and resize to 192 pixels wide. |
| `nitw.svg`               | Hand-built vector redraw of the NIT Warangal crest (reference below)                            | Simplified trace, text converted to outlines, optimized with SVGO.                |
| `davv.svg`               | Hand-built vector redraw of the Devi Ahilya Vishwavidyalaya seal (reference below)              | Simplified trace, text converted to outlines, optimized with SVGO.                |
| `happy-days-school.svg`  | The school's own vector logo (reference below)                                                  | Vector paths copied out of the school's PDF, optimized with SVGO.                 |
| `kids-garden-school.svg` | Vector trace of the Kids Garden School, Shivpuri emblem (reference below)                       | Traced color layers, motto typeset as outlines, optimized with SVGO.              |

All marks are trademarks of their institutions and appear here only to identify where the degrees and
classes were completed.

## Crest redraws (2026-10-10)

Neither university publishes a vector crest, and Wikimedia Commons has none: the English Wikipedia
articles use low-resolution non-free PNGs. Both SVGs are therefore simplified redraws traced by hand
from the official raster marks. They keep the layout, colors and inscriptions of the originals but are
not the institutions' own artwork.

| Asset      | Traced from                                                                                                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nitw.svg` | [nitw.ac.in header logo](https://www.nitw.ac.in/images/logo-170x172.png) (colors) and [Wikipedia's file](https://en.wikipedia.org/wiki/File:National_Institute_of_Technology,_Warangal_logo.png) (shape, 286 x 349). Motto: "कर्मणैव हि संसिद्धिः". |
| `davv.svg` | [dauniv.ac.in logo](https://www.dauniv.ac.in/newassets/images/davvLogo.png) (400 x 404). Inscriptions: "देवी अहिल्या विश्वविद्यालय, इन्दौर" and "धियो यो नः प्रचोदयात्".                                                                            |

Inscriptions are drawn as outlines so the files need no fonts: Arimo Bold for the NITW lettering and
Noto Sans Devanagari for the Devanagari text (both SIL Open Font License 1.1, which permits embedding
glyph outlines in artwork).

## School logos (2026-10-10)

- `happy-days-school.svg`: Happy Days School, Kathamill Colony, Shivpuri (M.P.). The website only serves
  a 137 x 77 PNG ([happy_days_school_logo.png](https://www.happydaysschool.org/images/happy_days_school_logo.png)),
  but the cover of the school's
  [2025-26 planner PDF](https://www.happydaysschool.org/download_center/Final-Planner.pdf) carries the
  logo as vector artwork. Its 21 vector shapes (rainbow, clouds, children, lettering, "विमुक्तये विद्या",
  "Education to Change Lives...") are copied unchanged, so this is the school's own drawing, not a
  redraw. The mark is wider than tall, so it is registered with `wide: true`.
- `kids-garden-school.svg`: Kids Garden School, Pohari-Darroni Link Road, Shivpuri (M.P.) 473551. Traced
  from the 1290 x 1290 profile picture of the school's Facebook page
  ([kidsgardenschoolshivpuri](https://www.facebook.com/kidsgardenschoolshivpuri/)). The same emblem
  (sun, five children, ribbons, green banner) is the school's logo on its
  [Vidyapun listing](https://www.vidyapun.com/schools/5408-kids-garden-school), whose address and
  website match. The motto "तेजस्वि नावधीतमस्तु" is typeset in Noto Sans Devanagari as outlines.
  The school's current website ([kidsgardenshivpuri.com](https://kidsgardenshivpuri.com/)) shows a
  different maroon tree-and-book mark ("Since - 2004"); this file uses the emblem from the Facebook
  page and the listing instead.

The old Kids Garden WebP was the logo of "Kids' Garden Primary School, Gaushala Road, Siwan" (Bihar),
a different school, and is no longer used.

Register organization names in `src/utils/orgLogos.tsx`. Set `wide: true` for wide marks so they remain readable inside the existing icon frames.
