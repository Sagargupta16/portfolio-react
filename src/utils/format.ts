/** A count with thousands separators, as every number on the site is shown. */
export const formatCount = (n = 0): string => n.toLocaleString("en-US");

/** "Warangal, Telangana, India" -> "Warangal, India": city and country, as every timeline row shows a place. */
export const formatPlace = (place: string): string => {
   const parts = place
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
   return parts.length > 2 ? `${parts[0]}, ${parts.at(-1)}` : parts.join(", ");
};
