#!/usr/bin/env node
// Fetch the latest resume PDF from the latex-resume release, then render each
// page to a high-resolution WebP so the in-site CV viewer shows crisp,
// zoomable images with zero client-side PDF machinery. Outputs (gitignored):
//   public/resume.pdf              -- for the open-in-new-tab action
//   public/resume-pages/page-N.webp
//   public/resume-pages/manifest.json  { pages, width, height }
// CI runs this before `vite build`; locally run `pnpm fetch:resume`.

import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

const RESUME_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";
const PUBLIC_DIR = path.resolve(import.meta.dirname, "../public");
const PDF_OUT = path.join(PUBLIC_DIR, "resume.pdf");
const PAGES_DIR = path.join(PUBLIC_DIR, "resume-pages");

// 4x the PDF's natural size (~595pt page -> ~2380px) so the page stays
// sharp on retina displays even at the viewer's 150% zoom.
const RENDER_SCALE = 4;

console.log("Fetching latest resume PDF...");
const res = await fetch(RESUME_URL, {
   redirect: "follow",
   signal: AbortSignal.timeout(30_000),
});
if (!res.ok || !res.body) {
   console.error(`Failed to fetch resume: HTTP ${res.status}`);
   process.exit(1);
}
await mkdir(PAGES_DIR, { recursive: true });
await pipeline(res.body, createWriteStream(PDF_OUT));

console.log("Rendering pages...");
const pdfBuffer = await readFile(PDF_OUT);
if (pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
   throw new Error("Downloaded resume is not a valid PDF");
}
const document = await pdf(pdfBuffer, { scale: RENDER_SCALE });

let pageNum = 0;
let width = 0;
let height = 0;
for await (const pagePng of document) {
   pageNum += 1;
   const img = sharp(pagePng);
   if (pageNum === 1) {
      const meta = await img.metadata();
      width = meta.width ?? 0;
      height = meta.height ?? 0;
   }
   const out = path.join(PAGES_DIR, `page-${pageNum}.webp`);
   // Lossless: typeset text smears badly under lossy WebP's DCT blocks.
   // A mostly-white LaTeX page compresses tightly lossless anyway.
   await img.webp({ lossless: true, effort: 6 }).toFile(out);
   console.log(`  ${out}`);
}

if (pageNum === 0 || width === 0 || height === 0) {
   throw new Error("Resume renderer produced no valid pages");
}

await writeFile(
   path.join(PAGES_DIR, "manifest.json"),
   JSON.stringify({ pages: pageNum, width, height }) + "\n",
);
console.log(`Done: ${pageNum} page(s), ${width}x${height}`);
