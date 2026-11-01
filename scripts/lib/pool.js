/**
 * Like `Promise.all(items.map(fn))`, but at most `limit` calls run at once.
 * Results keep the order of `items`, so a caller can apply them in a fixed
 * order whichever request finished first.
 */
export async function mapPool(items, limit, fn) {
   const results = new Array(items.length);
   let next = 0;
   // Each worker claims the next unclaimed item, so the pool stays full.
   const worker = async () => {
      while (next < items.length) {
         const index = next++;
         results[index] = await fn(items[index], index);
      }
   };
   await Promise.all(
      Array.from({ length: Math.min(limit, items.length) }, worker),
   );
   return results;
}
