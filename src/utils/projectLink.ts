/* Shareable links to one project: ?project=<slug>#projects. The hash stays
   owned by section navigation (it scrolls to Projects); the query names the
   project whose details open once the section mounts. */

const PARAM = "project";

export const projectSlug = (title: string) =>
   title
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-|-$/g, "");

export const readProjectParam = () =>
   new URL(globalThis.location.href).searchParams.get(PARAM);

/** Reflect the open project in the address bar without a history entry. */
export const writeProjectParam = (slug: string | null) => {
   const url = new URL(globalThis.location.href);
   if (slug) url.searchParams.set(PARAM, slug);
   else url.searchParams.delete(PARAM);
   if (url.href !== globalThis.location.href)
      globalThis.history.replaceState(globalThis.history.state, "", url);
};

/** Absolute link for copying: the site root plus the project query. */
export const projectShareUrl = (slug: string) => {
   const url = new URL(import.meta.env.BASE_URL, globalThis.location.origin);
   url.searchParams.set(PARAM, slug);
   url.hash = "projects";
   return url.href;
};
