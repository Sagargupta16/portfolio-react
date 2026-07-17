#!/usr/bin/env node
// Download the latest resume PDF from the latex-resume release into public/
// so the in-site CV viewer works in local dev. CI does the same thing into
// build/ at deploy time (see .github/workflows/ci-cd.yml) -- the file is
// gitignored and never committed.

import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const RESUME_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";
const OUT = path.resolve(import.meta.dirname, "../public/resume.pdf");

const res = await fetch(RESUME_URL, { redirect: "follow" });
if (!res.ok || !res.body) {
   console.error(`Failed to fetch resume: HTTP ${res.status}`);
   process.exit(1);
}
await mkdir(path.dirname(OUT), { recursive: true });
await pipeline(res.body, createWriteStream(OUT));
console.log(`Saved ${OUT}`);
