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

/** Index of the first "%" not escaped as "\%", or -1. */
const commentStart = (line) => {
   let at = line.indexOf("%");
   while (at > 0 && line[at - 1] === "\\") at = line.indexOf("%", at + 1);
   return at;
};

// CRLF first, so a trailing "\r" never sits after the comment.
const stripComments = (src) =>
   src
      .replaceAll("\r\n", "\n")
      .split("\n")
      .map((line) => {
         const at = commentStart(line);
         return at === -1 ? line : line.slice(0, at);
      })
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
      .replaceAll(String.raw`\ `, " ")
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

/** Push the nodes of command `name`, whose arguments start at pos; returns the end. */
const emitCommand = (src, pos, name, out) => {
   if (name === "href") {
      const { args, end } = readArgs(src, pos, 2);
      out.push({ t: "a", href: args[0], c: parseInline(args[1]) });
      return end;
   }
   if (STYLE[name]) {
      const { args, end } = readArgs(src, pos, 1);
      out.push({ t: STYLE[name], c: parseInline(args[0]) });
      return end;
   }
   if (name.startsWith("fa")) {
      if (!PRIVATE_ICONS.has(name)) out.push({ t: "icon", name });
      return pos;
   }
   if (DROP_WITH_ARG.has(name)) return readArgs(src, pos, 1).end;
   // \small{..}, \LARGE{..} and anything unknown: keep the content.
   const open = skipSpace(src, pos);
   if (src[open] !== "{") return open;
   const { body, end } = readGroup(src, open);
   out.push(...parseInline(body));
   return end;
};

/** Read the control sequence at src[i] === "\\"; returns the next index. */
const readCommand = (src, i, run) => {
   if (src[i + 1] === "\\") {
      run.flush();
      run.out.push({ t: "br" });
      return i + 2;
   }
   const match = /^\\([A-Za-z]+)\*?/.exec(src.slice(i));
   if (!match) {
      // Escaped character such as \% or \&: cleanText handles it.
      run.buf += src.slice(i, i + 2);
      return i + 2;
   }
   const name = match[1];
   const pos = i + match[0].length;
   if (name === "textasciitilde") {
      run.buf += "~";
      return pos;
   }
   run.flush();
   return emitCommand(src, pos, name, run.out);
};

export function parseInline(src) {
   // Text collects in buf and joins out as one cleaned run at each command.
   const run = {
      out: [],
      buf: "",
      flush() {
         pushText(this.out, this.buf);
         this.buf = "";
      },
   };
   let i = 0;
   while (i < src.length) {
      const ch = src[i];
      if (ch === "\\") {
         i = readCommand(src, i, run);
      } else if (ch === "{" || ch === "}") {
         i++;
      } else if (ch === "$") {
         // Math only appears as list markers ($\diamond$); drop it.
         const close = src.indexOf("$", i + 1);
         i = close === -1 ? src.length : close + 1;
      } else {
         run.buf += ch === "~" ? " " : ch;
         i++;
      }
   }
   run.flush();
   return trimRun(run.out);
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

// Block-level macro names, as they appear in the source.
const RESUME_EXP = String.raw`\resumeExp`;
const RESUME_EDU = String.raw`\resumeEdu`;
const LIST_START = String.raw`\resumeItemListStart`;
const LIST_END = String.raw`\resumeItemListEnd`;
const ACHIEVEMENT = String.raw`\resumeAchievement`;
const ENV_END = new Map([
   [String.raw`\begin{itemize}`, String.raw`\end{itemize}`],
   [String.raw`\begin{tabular*}`, String.raw`\end{tabular*}`],
]);

/** Items inside \resumeItemListStart ... \resumeItemListEnd. */
const parseItems = (src) => {
   const items = [];
   const marks = [
      ...src.matchAll(/\\resumeAchievement|\\item(?:\[[^\]]*\])?/g),
   ];
   for (const [k, mark] of marks.entries()) {
      const start = mark.index + mark[0].length;
      const stop = k + 1 < marks.length ? marks[k + 1].index : src.length;
      if (mark[0] === ACHIEVEMENT) {
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
   // An unclosed environment would send parseBlocks' cursor backwards and loop
   // forever, hanging the deploy; fail it with the token instead.
   if (end === -1) throw new Error(`resume-tex: ${startTok} has no ${endTok}`);
   return {
      body: src.slice(start + startTok.length, end),
      end: end + endTok.length,
   };
};

const BLOCK_TOKENS =
   /\\resumeExp|\\resumeEdu|\\resumeItemListStart|\\begin\{itemize\}|\\begin\{tabular\*\}|\\small\s*\{/g;

// Each reader takes the token match m, pushes its blocks and returns the end.

/** \resumeExp / \resumeEdu: a titled entry with four arguments. */
const readEntry = (src, m, blocks) => {
   const { args, end } = readArgs(src, m.index + m[0].length, 4);
   const [title, subtitle, date, meta] = args.map(parseInline);
   blocks.push({ t: "entry", title, subtitle, date, meta, items: [] });
   return end;
};

/** \resumeItemListStart ... \resumeItemListEnd. */
const readItemList = (src, m, blocks) => {
   const { body, end } = between(src, m.index, m[0], LIST_END);
   const items = parseItems(body);
   const last = blocks.at(-1);
   // A plain list right after an entry is that entry's bullets.
   if (
      last?.t === "entry" &&
      last.items.length === 0 &&
      !body.includes(ACHIEVEMENT)
   )
      last.items = items.map((item) => item.c);
   else blocks.push({ t: "list", items });
   return end;
};

/** An itemize or tabular* environment, read as rows split on \\. */
const readEnvironment = (src, m, blocks) => {
   const { body, end } = between(src, m.index, m[0], ENV_END.get(m[0]));
   // Drop the environment's option and column-spec groups, then split on \\.
   const inner = body
      .replace(/^\s*\[[^\]]*\]/, "")
      .replace(/^\s*\{[^}]*\}(\[[^\]]*\])?\{[^}]*\}/, "")
      .replaceAll(/\\item\b/g, "");
   const rows = splitRows(parseInline(inner));
   if (rows.length) blocks.push({ t: "rows", rows });
   return end;
};

/** \small{...}: a paragraph (summary) or a wrapper around a table. */
const readSmall = (src, m, blocks) => {
   const open = src.indexOf("{", m.index);
   const { body, end } = readGroup(src, open);
   blocks.push(...parseBlocks(body));
   return end;
};

const readBlock = (src, m, blocks) => {
   const tok = m[0];
   if (tok === RESUME_EXP || tok === RESUME_EDU)
      return readEntry(src, m, blocks);
   if (tok === LIST_START) return readItemList(src, m, blocks);
   if (ENV_END.has(tok)) return readEnvironment(src, m, blocks);
   return readSmall(src, m, blocks);
};

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
      cursor = readBlock(src, m, blocks);
      tokens.lastIndex = cursor;
   }
   leftover(src.slice(cursor));
   return blocks;
};

const plain = (nodes) =>
   nodes.map((n) => (typeof n === "string" ? n : plain(n.c ?? []))).join("");

/** Group inline nodes into contact links, split at "|" in text runs. */
const splitLinks = (nodes) => {
   const links = [];
   let current = [];
   const close = () => {
      if (current.length) links.push(current);
      current = [];
   };
   for (const node of nodes) {
      if (typeof node === "string" && node.includes("|")) {
         for (const [idx, part] of node.split("|").entries()) {
            if (idx > 0) close();
            if (part.trim()) current.push(part.trim());
         }
      } else current.push(node);
   }
   close();
   return links;
};

const parseHeader = (src) => {
   const centers = [
      ...src.matchAll(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g),
   ].map((m) => m[1]);
   const [nameSrc = "", taglineSrc = "", linksSrc = ""] = centers;
   const tagline = plain(parseInline(taglineSrc))
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
   const links = splitLinks(parseInline(linksSrc));
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
