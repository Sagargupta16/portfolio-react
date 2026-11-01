/** A count with thousands separators, as every number on the site is shown. */
export const formatCount = (n = 0): string => n.toLocaleString("en-US");
