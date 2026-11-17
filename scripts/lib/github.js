const API = "https://api.github.com";

/** Request headers for the GitHub REST API; the token is optional. */
export const githubHeaders = (token) => ({
   Accept: "application/vnd.github+json",
   "User-Agent": "portfolio-sync",
   ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/** Longest a sync request may take before it is aborted, in milliseconds. */
export const FETCH_TIMEOUT_MS = 20_000;

/** GET a JSON URL; a failed response throws an Error carrying its status. */
export async function getJson(
   url,
   headers,
   signal = AbortSignal.timeout(FETCH_TIMEOUT_MS),
) {
   const res = await fetch(url, { headers, signal });
   if (!res.ok) {
      const error = new Error(`GET ${url} -> ${res.status}`);
      error.status = res.status;
      throw error;
   }
   return res.json();
}

/** The latest published release of "owner/name" (a 404 when it has none). */
export const latestRelease = (repo, token, signal) =>
   getJson(
      `${API}/repos/${repo}/releases/latest`,
      githubHeaders(token),
      signal,
   );
