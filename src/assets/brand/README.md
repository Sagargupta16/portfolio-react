# Maker personal mark

Maker is Sagar Gupta's wave-crested character. The wave is a nod to Sagar,
meaning ocean. This is custom vector artwork, not a portrait.

- **Drawing and colors:** `maker.json` is shared by the UI and icon generator.
- **UI:** `src/components/ui/MakerMark.tsx`. Use `<MakerMark size={36} />` inside
  a labelled home link or button. The artwork itself is decorative.
- **Hero motion:** pass `animated`. Eyes blink while visible and wink on mouse
  hover. Reduced mode is static; offscreen and hidden-tab animation pauses.
- **Browser/app icons:** run `pnpm brand:icons` after editing the drawing.
  Commit the generated `public/favicon.ico` and `public/favicon_io/` assets.
  Tiny favicons omit the inner crest cut; app icons include a dark background
  and safe padding.

The static SVG favicon and PNG/ICO fallbacks all use the same source drawing.
Keep artwork out of text labels: accessible home controls retain their own names.
