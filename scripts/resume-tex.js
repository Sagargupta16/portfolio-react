// Parse the latex-resume sources (the same files the released PDF is built
// from) into a small JSON tree the CV viewer renders as HTML. Only the macro
// subset the resume uses is understood: \section, \resumeExp, \resumeEdu,
// \resumeAchievement, the item-list wrappers, itemize/tabular rows, and the
// inline \textbf / \textit / \texttt / \href / \fa* commands. Layout-only
// commands (\vspace, \hspace, \small, center) are dropped.
//
// Inline node:  string | { t: "b"|"i"|"code", c } | { t: "a", href, c }
//               | { t: "icon", name } | { t: "br" }
// Block node:   { t: "entry", title, subtitle, date, meta, items }
//               | { t: "list", items: [{ c, aside }] }
//               | { t: "rows", rows: Inline[][] }
//               | { t: "para", c }

// The order body.tex inputs them, header first.
export const RESUME_FILES = [
   "common/header.tex",
   "variants/general/summary.tex",
   "variants/general/experience.tex",
   "common/certifications.tex",
   "common/education.tex",
   "variants/general/projects.tex",
   "variants/general/oss.tex",
   "variants/general/skills.tex",
   "variants/general/achievements.tex",
];

// Header icons that carry contact data the site does not publish as text.
const PRIVATE_ICONS = new Set(["faPhone"]);

// En and em dash, built from code points so this file stays plain ASCII.
const UNICODE_DASHES = new RegExp(
   `[${String.fromCodePoint(0x2013, 0x2014)}]`,
   "g",
);

// CRLF first: "." stops at "\r", so a trailing "%\r" would survive otherwise.
const stripComments = (src) =>
   src
      .replaceAll("\r\n", "\n")
      .split("\n")
      .map((line) => line.replace(/(?<!\\)%.*$/, ""))
      .join("\n");

// Plain-text cleanup for TeX ligatures and escapes. Every dash becomes "-".
const cleanText = (text) =>
   text
      .replaceAll(/\\([%&#_$])/g, "$1")
      .replaceAll("---", "-")
      .replaceAll("--", "-")
      .replaceAll(UNICODE_DASHES, "-")
      .replaceAll("``", '"')
      .replaceAll("''", '"')
      .replaceAll(/\\ /g, " ")
      .replaceAll(/\s+/g, " ");

/** Read a balanced {...} group starting at src[i] === "{". */
const readGroup = (src, i) => {
   let depth = 0;
   for (let j = i; j < src.length; j++) {
      const ch = src[j];
      if (ch === "\\") {
         j++;
         continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
         depth--;
         if (depth === 0) return { body: src.slice(i + 1, j), end: j + 1 };
      }
   }
   throw new Error(`Unbalanced braces near: ${src.slice(i, i + 60)}`);
};

const skipSpace = (src, i) => {
   let pos = i;
   while (pos < src.length && /\s/.test(src[pos])) pos++;
   return pos;
};

/** Read n consecutive {..} arguments after position i. */
const readArgs = (src, i, n) => {
   const args = [];
   let pos = i;
   for (let k = 0; k < n; k++) {
      pos = skipSpace(src, pos);
      if (src[pos] !== "{")
         throw new Error(`Expected { at ${src.slice(pos, pos + 40)}`);
      const { body, end } = readGroup(src, pos);
      args.push(body);
      pos = end;
   }
   return { args, end: pos };
};

// Commands whose argument is layout, not content.
const DROP_WITH_ARG = new Set(["vspace", "hspace"]);
const STYLE = { textbf: "b", textit: "i", texttt: "code" };

const pushText = (out, text) => {
   const clean = cleanText(text);
   if (!clean) return;
   const last = out.at(-1);
   if (typeof last === "string") out[out.length - 1] = last + clean;
   else out.push(clean);
};

const trimRun = (nodes) => {
   const out = [...nodes];
   if (typeof out[0] === "string") out[0] = out[0].trimStart();
   if (typeof out.at(-1) === "string")
      out[out.length - 1] = out.at(-1).trimEnd();
   return out.filter((node) => node !== "");
};

export function parseInline(src) {
   const out = [];
   let buf = "";
   const flush = () => {
      pushText(out, buf);
      buf = "";
   };
   let i = 0;
   while (i < src.length) {
      const ch = src[i];
      if (ch === "\\") {
         if (src[i + 1] === "\\") {
            flush();
            out.push({ t: "br" });
            i += 2;
            continue;
         }
         const match = /^\\([A-Za-z]+)\*?/.exec(src.slice(i));
         if (!match) {
            // Escaped character such as \% or \&: cleanText handles it.
            buf += src.slice(i, i + 2);
            i += 2;
            continue;
         }
         const name = match[1];
         let pos = i + match[0].length;
         if (name === "textasciitilde") {
            buf += "~";
            i = pos;
            continue;
         }
         flush();
         if (name === "href") {
            const { args, end } = readArgs(src, pos, 2);
            out.push({ t: "a", href: args[0], c: parseInline(args[1]) });
            i = end;
         } else if (STYLE[name]) {
            const { args, end } = readArgs(src, pos, 1);
            out.push({ t: STYLE[name], c: parseInline(args[0]) });
            i = end;
         } else if (name.startsWith("fa")) {
            if (!PRIVATE_ICONS.has(name)) out.push({ t: "icon", name });
            i = pos;
         } else if (DROP_WITH_ARG.has(name)) {
            i = readArgs(src, pos, 1).end;
         } else {
            // \small{..}, \LARGE{..} and anything unknown: keep the content.
            pos = skipSpace(src, pos);
            if (src[pos] === "{") {
               const { body, end } = readGroup(src, pos);
               out.push(...parseInline(body));
               i = end;
            } else i = pos;
         }
         continue;
      }
      if (ch === "{" || ch === "}") {
         i++;
         continue;
      }
      if (ch === "$") {
         // Math only appears as list markers ($\diamond$); drop it.
         const close = src.indexOf("$", i + 1);
         i = close === -1 ? src.length : close + 1;
         continue;
      }
      buf += ch === "~" ? " " : ch;
      i++;
   }
   flush();
   return trimRun(out);
}

/** Split inline nodes on {t:"br"} into rows, dropping empty rows. */
const splitRows = (nodes) => {
   const rows = [[]];
   for (const node of nodes) {
      if (node?.t === "br") rows.push([]);
      else rows.at(-1).push(node);
   }
   return rows.map(trimRun).filter((row) => row.length > 0);
};

/** Items inside \resumeItemListStart ... \resumeItemListEnd. */
const parseItems = (src) => {
   const items = [];
   const marks = [
      ...src.matchAll(/\\resumeAchievement|\\item(?:\[[^\]]*\])?/g),
   ];
   for (const [k, mark] of marks.entries()) {
      const start = mark.index + mark[0].length;
      const stop = k + 1 < marks.length ? marks[k + 1].index : src.length;
      if (mark[0] === "\\resumeAchievement") {
         const { args } = readArgs(src, start, 2);
         const aside = parseInline(args[1]);
         items.push({
            c: parseInline(args[0]),
            ...(aside.length && { aside }),
         });
      } else {
         const c = parseInline(src.slice(start, stop));
         if (c.length) items.push({ c });
      }
   }
   return items;
};

const between = (src, from, startTok, endTok) => {
   const start = src.indexOf(startTok, from);
   const end = src.indexOf(endTok, start + startTok.length);
   return {
      body: src.slice(start + startTok.length, end),
      end: end + endTok.length,
   };
};

const BLOCK_TOKENS =
   /\\resumeExp|\\resumeEdu|\\resumeItemListStart|\\begin\{itemize\}|\\begin\{tabular\*\}|\\small\s*\{/g;

/** Turn one section body into blocks. */
const parseBlocks = (src) => {
   const blocks = [];
   const leftover = (text) => {
      const c = parseInline(
         text.replaceAll(/\\resumeSubHeadingList(Start|End)/g, ""),
      );
      if (c.length) blocks.push({ t: "para", c });
   };
   const tokens = new RegExp(BLOCK_TOKENS.source, "g");
   let cursor = 0;
   for (let m = tokens.exec(src); m; m = tokens.exec(src)) {
      leftover(src.slice(cursor, m.index));
      const tok = m[0];
      if (tok === "\\resumeExp" || tok === "\\resumeEdu") {
         const { args, end } = readArgs(src, m.index + tok.length, 4);
         const [title, subtitle, date, meta] = args.map(parseInline);
         blocks.push({ t: "entry", title, subtitle, date, meta, items: [] });
         cursor = end;
      } else if (tok === "\\resumeItemListStart") {
         const { body, end } = between(
            src,
            m.index,
            tok,
            "\\resumeItemListEnd",
         );
         const items = parseItems(body);
         const last = blocks.at(-1);
         // A plain list right after an entry is that entry's bullets.
         if (
            last?.t === "entry" &&
            last.items.length === 0 &&
            !body.includes("\\resumeAchievement")
         )
            last.items = items.map((item) => item.c);
         else blocks.push({ t: "list", items });
         cursor = end;
      } else if (tok === "\\begin{itemize}" || tok === "\\begin{tabular*}") {
         const endTok =
            tok === "\\begin{itemize}" ? "\\end{itemize}" : "\\end{tabular*}";
         const { body, end } = between(src, m.index, tok, endTok);
         // Drop the environment's option and column-spec groups, then split on \\.
         const inner = body
            .replace(/^\s*\[[^\]]*\]/, "")
            .replace(/^\s*\{[^}]*\}(\[[^\]]*\])?\{[^}]*\}/, "")
            .replaceAll(/\\item\b/g, "");
         const rows = splitRows(parseInline(inner));
         if (rows.length) blocks.push({ t: "rows", rows });
         cursor = end;
      } else {
         // \small{...}: a paragraph (summary) or a wrapper around a table.
         const open = src.indexOf("{", m.index);
         const { body, end } = readGroup(src, open);
         blocks.push(...parseBlocks(body));
         cursor = end;
      }
      tokens.lastIndex = cursor;
   }
   leftover(src.slice(cursor));
   return blocks;
};

const plain = (nodes) =>
   nodes.map((n) => (typeof n === "string" ? n : plain(n.c ?? []))).join("");

const parseHeader = (src) => {
   const centers = [
      ...src.matchAll(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g),
   ].map((m) => m[1]);
   const [nameSrc = "", taglineSrc = "", linksSrc = ""] = centers;
   const tagline = plain(parseInline(taglineSrc))
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
   // Contact links are separated by "|" text runs.
   const links = [];
   let current = [];
   for (const node of parseInline(linksSrc)) {
      if (typeof node === "string" && node.includes("|")) {
         const parts = node.split("|");
         for (const [idx, part] of parts.entries()) {
            if (part.trim()) current.push(part.trim());
            if (idx < parts.length - 1) {
               if (current.length) links.push(current);
               current = [];
            }
         }
      } else current.push(node);
   }
   if (current.length) links.push(current);
   return {
      name: plain(parseInline(nameSrc)).trim(),
      tagline,
      // A link group with no anchor is the dropped phone number's leftovers.
      links: links.filter((link) => link.some((n) => n?.t === "a")),
   };
};

/**
 * files: map of RESUME_FILES path -> raw .tex source.
 * Returns { header, sections: [{ title, blocks }] }.
 */
export function parseResume(files) {
   const header = parseHeader(stripComments(files["common/header.tex"] ?? ""));
   const sections = [];
   for (const path of RESUME_FILES.slice(1)) {
      const src = stripComments(files[path] ?? "");
      for (const part of src.split(/\\section\s*/).slice(1)) {
         const { body: titleSrc, end } = readGroup(part, part.indexOf("{"));
         sections.push({
            title: plain(parseInline(titleSrc)).trim(),
            blocks: parseBlocks(part.slice(end)),
         });
      }
   }
   return { header, sections };
}
