/** Something fetched at runtime: still loading, ready with its data, or
 *  failed. One value instead of a nullable result plus flags, so "loaded"
 *  never has to be guessed from whether the data happens to be there. */
export type LoadState<T> =
   { status: "loading" } | { status: "ready"; data: T } | { status: "error" };

export const LOADING = {
   status: "loading",
} as const satisfies LoadState<never>;
