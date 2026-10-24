/* Recovers a tab that outlived a deploy. GitHub Pages swaps the hashed assets
   on every deploy, so an old page points its lazy imports at chunk files that
   are gone, and Vite reports that as vite:preloadError. Reload once to pick up
   the new build. The sessionStorage flag makes the retry one-shot: a chunk
   that still fails after the reload throws as usual and lands on its local
   ErrorBoundary. The flag clears once a load has settled, so a later deploy in
   the same tab gets its own retry. App imports this once for the effect. */

const STORAGE_KEY = "portfolio-chunk-reload";
// Chunks a fresh load fetches on its own (hero, deep-link sections) fail well
// inside this window, so a chunk that is broken for good cannot loop.
const SETTLE_MS = 10_000;

const claimRetry = () => {
   try {
      if (globalThis.sessionStorage.getItem(STORAGE_KEY)) return false;
      globalThis.sessionStorage.setItem(STORAGE_KEY, "1");
      return true;
   } catch {
      // Without storage there is no guard, so never reload.
      return false;
   }
};

globalThis.addEventListener("vite:preloadError", (event) => {
   // Offline, a reload would swap the page for the browser's error screen.
   if (!globalThis.navigator.onLine || !claimRetry()) return;
   event.preventDefault();
   globalThis.location.reload();
});

globalThis.addEventListener("load", () => {
   globalThis.setTimeout(() => {
      try {
         globalThis.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
         // Storage unavailable: the flag was never set.
      }
   }, SETTLE_MS);
});
