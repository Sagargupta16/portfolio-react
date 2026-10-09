/* Splits a headline into plain runs and *accent* runs, with string offsets
   for stable React keys. Shared by AccentText and ProximityText. */

export interface Segment {
   at: number;
   text: string;
   accent: boolean;
}

export const segments = (text: string): Segment[] => {
   const out: Segment[] = [];
   let cursor = 0;
   for (const match of text.matchAll(/\*([^*]+)\*/g)) {
      if (match.index > cursor)
         out.push({
            at: cursor,
            text: text.slice(cursor, match.index),
            accent: false,
         });
      out.push({ at: match.index, text: match[1], accent: true });
      cursor = match.index + match[0].length;
   }
   if (cursor < text.length)
      out.push({ at: cursor, text: text.slice(cursor), accent: false });
   return out;
};
