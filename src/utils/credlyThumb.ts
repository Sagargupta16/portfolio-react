// Credly badge images are stored at 600-1600px but rendered at 70-96px. Credly's
// CDN serves a resized variant via a /size/NxN/ path segment, so we request a
// retina-appropriate thumbnail instead of shipping the full-resolution badge.
// Applied at render time (not in the synced achievements.json) so it survives the
// weekly Credly sync. Non-Credly URLs pass through untouched.
const CREDLY_HOST = "images.credly.com";

export const credlyThumb = (url: string, px = 220): string => {
   if (!url.includes(CREDLY_HOST)) return url;
   // Already sized? leave it.
   if (url.includes("/size/")) return url;
   // Insert /size/NxN right before the /images/ segment.
   return url.replace("/images/", `/size/${px}x${px}/images/`);
};
