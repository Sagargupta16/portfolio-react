# Organization logo sources

These images are used beside the corresponding experience and education records.

| Asset                    | Source                                                                                          | Preparation                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `ikarus3d.webp`          | [Ikarus 3D header logo](https://d3cv7syas17klq.cloudfront.net/miscellaneous/Header_Logo_D.webp) | Crop the blue symbol from the supplied header logo and resize to 192 pixels wide. |
| `nitw.svg`               | Hand-built vector redraw of the NIT Warangal crest (reference below)                            | Simplified trace, text converted to outlines, optimized with SVGO.                |
| `davv.svg`               | Hand-built vector redraw of the Devi Ahilya Vishwavidyalaya seal (reference below)              | Simplified trace, text converted to outlines, optimized with SVGO.                |
| `happy-days-school.svg`  | Monogram badge ("HD"), drawn for this site                                                      | Rounded shield in the site blue, Inter Bold initials as outlines.                 |
| `kids-garden-school.svg` | Monogram badge ("KG"), drawn for this site                                                      | Rounded shield in the site blue, Inter Bold initials as outlines.                 |

## Crest redraws (2026-10-10)

Neither institution publishes a vector crest, and Wikimedia Commons has none: the English Wikipedia
articles use low-resolution non-free PNGs. Both SVGs are therefore simplified redraws traced by hand
from the official raster marks. They keep the layout, colors and inscriptions of the originals but are
not the institutions' own artwork. The crests are trademarks of their institutions and appear here only
to identify where the degrees were earned.

| Asset      | Traced from                                                                                                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nitw.svg` | [nitw.ac.in header logo](https://www.nitw.ac.in/images/logo-170x172.png) (colors) and [Wikipedia's file](https://en.wikipedia.org/wiki/File:National_Institute_of_Technology,_Warangal_logo.png) (shape, 286 x 349). Motto: "कर्मणैव हि संसिद्धिः". |
| `davv.svg` | [dauniv.ac.in logo](https://www.dauniv.ac.in/newassets/images/davvLogo.png) (400 x 404). Inscriptions: "देवी अहिल्या विश्वविद्यालय, इन्दौर" and "धियो यो नः प्रचोदयात्".                                                                            |

Inscriptions are drawn as outlines so the files need no fonts: Arimo Bold for the NITW lettering, Noto
Sans Devanagari for the Devanagari text, and Inter Bold for the monograms (all SIL Open Font License
1.1, which permits embedding glyph outlines in artwork).

The old Kids Garden WebP came from a Siwan school's site, while `data/education.json` places the school
in Shivpuri, so it was likely another school's logo; the monogram replaces it.

Register organization names in `src/utils/orgLogos.tsx`. Set `wide: true` for wide marks so they remain readable inside the existing icon frames.
