import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Shared with MakerMark.tsx: update the drawing once, then run pnpm brand:icons.
const maker = JSON.parse(
   await readFile(new URL("../src/assets/brand/maker.json", import.meta.url)),
);
const output = new URL("../public/favicon_io/", import.meta.url);

const svg = ({ small = false, app = false } = {}) =>
   `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
${app ? `<rect width="100" height="100" fill="${maker.ink}"/><g transform="translate(10 10) scale(.8)">` : ""}
<path fill="${maker.color}" d="${maker.silhouette}"/>
${small ? "" : `<path fill="${maker.ink}" d="${maker.crest}"/>`}
<path fill="${maker.ink}" d="${maker.visor}"/>
<g fill="${maker.eyeColor}">${maker.eyes
      .map(
         ({ x, y, width, height, rx }) =>
            `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}"/>`,
      )
      .join("")}</g>
${app ? "</g>" : ""}
</svg>`;

await writeFile(new URL("maker.svg", output), svg({ small: true }));
const icons = [
   ["favicon-16x16.png", 16, false],
   ["favicon-32x32.png", 32, false],
   ["apple-touch-icon.png", 180, true],
   ["android-chrome-192x192.png", 192, true],
   ["android-chrome-512x512.png", 512, true],
];
for (const [name, size, app] of icons) {
   await sharp(Buffer.from(svg({ small: size <= 24, app })))
      .resize(size, size)
      .png()
      .toFile(fileURLToPath(new URL(name, output)));
}

// ICO supports PNG payloads. Keep 16/32/48px entries for older browser shells.
const sizes = [16, 32, 48];
const images = await Promise.all(
   sizes.map((size) =>
      sharp(Buffer.from(svg({ small: size <= 24 })))
         .resize(size, size)
         .png()
         .toBuffer(),
   ),
);
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((image, index) => {
   const entry = 6 + index * 16;
   header[entry] = sizes[index];
   header[entry + 1] = sizes[index];
   header.writeUInt16LE(1, entry + 4);
   header.writeUInt16LE(32, entry + 6);
   header.writeUInt32LE(image.length, entry + 8);
   header.writeUInt32LE(offset, entry + 12);
   offset += image.length;
});
await writeFile(
   new URL("../public/favicon.ico", import.meta.url),
   Buffer.concat([header, ...images]),
);
console.log("Generated Maker browser, Apple, and Android icons.");
