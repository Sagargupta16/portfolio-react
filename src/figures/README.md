# Hairline figures: authoring guide

Isometric line figures that answer the pointer, built on `src/figures/hairline/`, a port of
[hairline](https://github.com/lucasmarkes/hairline) (MIT, see `THIRD_PARTY_NOTICES.md`). The pilot,
`covers/diagram.ts` (orrery), is the template: copy its shape.

## File shape

One module per figure, `src/figures/<surface>/<name>.ts`, importing only from `@/figures/hairline`:

- `export const mount: FigureMount = ({ stage, svg, read, frame }, value) => ...` draws into `svg`,
  listens with `pointer(stage, ...)`, writes `read.textContent`, returns `{ set, destroy }`.
  `value` is intensity 0 to 1; map it to your own number. `destroy` (a `disposer()`) empties the svg.
- `export const frame = FRAMES.cover` (or `banner`, `service`).
- `export const tour: Tour`: 3 to 6 viewBox points in that frame, ending with `null`.
- Camera: `Cam(45, 0.5, 1)` then `fitFrame(C, extremePose, frame)`; it fills 88% of the width (or 90%
  of the height) and centres at (w/2, h/2 + 4). Compute tour points from your projector, not by hand.
- Time: stamp events with `now()`, never `performance.now()`, or the tests cannot drive you.
- At most 200 lines after Prettier. `// prettier-ignore` on the kit import block is allowed.

## Frames per surface

| Surface           | Frame                      | Slot                                                |
| ----------------- | -------------------------- | --------------------------------------------------- |
| Project cover     | `FRAMES.cover` 400 x 250   | 16:10, fills the slot; read at 343 px wide          |
| Experience banner | `FRAMES.banner` 400 x 225  | 16:9 or 2:1, plus a 140 px phone strip, letterboxed |
| Service card      | `FRAMES.service` 320 x 320 | square, scaled up from 80 px                        |

The bottom 28% of a cover sits under the card's fade: keep the mechanism in the upper part.

## The ten rules (binding: `hairline-create/rules.md` in the hairline repo)

1. Hit: test the pointer against rest or target poses, never the pose on screen.
2. Order: stagger by distance, `delay = |i - a| * step`, 30 to 60 ms (or by hop count).
3. Reach: clamp every answer; fit to the most extreme pose so nothing leaves the frame.
4. Accent: the stroke is the only highlight; one bright place at a time; classes only, no paint attributes.
5. Rest: designed, never flat or uniform, with one bright mark where the eye starts.
6. Honesty: plates are opaque and painted back to front; guides go behind their plate.
7. Cost: all motion inside `register`; return `true` only while moving; no timers, no rAF, no CSS animation.
8. Clock: a choice gets a 700 ms tween (`tween`/`tset`); a position gets a spring (`spring`/`stepS`).
9. Radius: solids are two rounded rings, a silhouette and one dim crease; no vertical corners.
10.   Quiet: no text, digits, arrows or icons in the svg; number things with dots.

Our deviations: `hi` is the slot's tint (passed in, never chosen by the figure); `ok` (green) and
`warn` (amber) are extra bright classes for pass and deny signals only, and still count as the one
bright place. Reduced motion comes from the site's toggle via `setReducedMotion`, never `matchMedia`.

## Read-out

`read.textContent` names what is under the pointer in a few characters, from the project's own
vocabulary (`step 2`, `fn`, `cell 4.2`), and is `rest` when nothing is. The wrapper hides `rest`, so a
card shows a caption only while the figure answers. Never a sentence.

## Tour

`HairlineFigure` walks it in Full mode only; a real pointer or focus holds it. Pick stops on
different parts in the order a hand would reach them; the last stop is `null` (back to rest).

## Wiring and tests

1. Register the slot. Covers: `<id>: { kind: "figure", load: () => import("@/figures/covers/<name>") },`
   in `src/pages/projects/covers/coverRegistry.ts`, keeping the `<id>: {` shape for `pnpm validate:data`.
2. Add the module to `FIGURES` in `src/figures/catalog.ts`.
3. `pnpm exec vitest run src/__tests__/figures.test.ts -u` writes your snapshot; check that only your
   figure's entry changed. The test checks rules 10, 04 and 03, the tour shape, the read-out and `destroy`.

## Render check

Start the dev server in your worktree (`pnpm exec vite --port 5291 --strictPort --host 127.0.0.1`),
then for each width:

```
node C:/Code/worktrees/hairline-shots-script/shoot.mjs --surface cover --key <project id> --width 375
```

`--surface banner|service --key "<text in the card>"` finds other slots; `--module /src/figures/...`
supplies the tour there. It writes rest, tour and hover shots to `C:/Code/worktrees/hairline-shots/`
and prints the read-outs and the drawing's box against the frame. It exits 1 on a console error or a
drawing outside the frame. Look at the shots at 375 and 343. Stop the server when you finish.
