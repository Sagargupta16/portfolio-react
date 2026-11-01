/**
 * Stable 7-char "commit hash" for a news item (FNV-1a over date + text). The
 * News section shows it as the row's id and the RSS feed uses it as the guid,
 * so one item keeps one id across builds. Types: news-hash.d.ts.
 */
export function newsHash(item) {
   let h = 0x811c9dc5;
   for (const ch of `${item.date}${item.text}`) {
      h ^= ch.codePointAt(0) ?? 0;
      h = Math.imul(h, 0x01000193);
   }
   return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}
