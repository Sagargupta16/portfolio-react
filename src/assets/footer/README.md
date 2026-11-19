# Footer art

The footer's scenes (`src/components/layout/Footer/scenes/`) draw from the
files in this folder.

## Cast (`cast/<id>/strip-<height>.avif`)

A strip is one character's poses side by side, in the order
`scenes/cast/manifest.json` lists for that character (`idle`, `crouch`, `jump`,
`land`, `wave`, `sit`, `sleep`; `sagar` also has `wink`). The number in the file
name is the frame height in px, and a frame is 372 wide for every 500 tall. The
sprite engine loads the smallest strip that covers the size a character is
shown at.

- `sagar` is the owner's own comic pose sheet, the same art as the mascot and
  the About bust, only scaled. He is never generated or redrawn.
- The other nine are invented people, not portraits of anyone. Each frame was
  made on 2026-11-19 with Stability AI's Control Structure model on Amazon
  Bedrock, using one cell of the owner's pose sheet as the structure guide, so
  every character shares his poses and ground lines. Stability's Remove
  Background cut each one out. A few frames had a small area repainted
  (Stability Inpaint, Search and Replace, or a local repaint with no model) to
  take brand-like marks off shoes.

| id         | who                                                   |
| ---------- | ----------------------------------------------------- |
| `denim`    | an older man with a grey beard in a denim jacket      |
| `teal`     | a young woman with an afro in a teal bomber jacket    |
| `mustard`  | a young man with headphones in a mustard tracksuit    |
| `bob`      | a woman with a bob and round glasses in a cream shirt |
| `backpack` | a student in a striped t-shirt with a backpack        |
| `grey`     | a tall red-haired man in a grey sweater               |
| `rose`     | a young woman in a rose hijab                         |
| `blazer`   | a woman with wavy hair in a grey blazer               |
| `visitor`  | the reader: all in cobalt blue with the hood up       |

## Backdrops (`scenes/<name>-<width>.avif`)

`rooftop` and `street` are night paintings made with Stable Image Ultra on
Amazon Bedrock, enlarged with Stability Fast Upscale and cropped. Lettering the
model drew on the street's signs was painted out. Each comes 1280 and 2560 px
wide.

## Changing the art

The lossless masters and the scripts that cut, clean and encode them are kept
outside this repository. A new frame must keep the 372 by 500 frame and its
pose's ground line (`ground` in the manifest), or feet float. The rule above
stays: new characters are invented people, and the owner's figure comes only
from his own sheet.
