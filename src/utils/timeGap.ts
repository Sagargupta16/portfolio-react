/* How far his clock is from the visitor's, for the footer status bar.
   Offsets come from Intl's "GMT+5:30" style zone names, so DST is handled by
   the platform rather than a table. */

export const offsetMinutes = (timeZone: string, date = new Date()) => {
   const name =
      new Intl.DateTimeFormat("en-US", {
         timeZone,
         timeZoneName: "shortOffset",
      })
         .formatToParts(date)
         .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
   const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name);
   if (!match) return 0;
   const sign = match[1] === "-" ? -1 : 1;
   return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
};

/** "4h 30m ahead", "1h behind", or null when both clocks agree. */
export const describeGap = (mine: number, theirs: number) => {
   const diff = mine - theirs;
   if (diff === 0) return null;
   const abs = Math.abs(diff);
   const hours = Math.floor(abs / 60);
   const minutes = abs % 60;
   const span = [hours && `${hours}h`, minutes && `${minutes}m`]
      .filter(Boolean)
      .join(" ");
   return `${span} ${diff > 0 ? "ahead" : "behind"}`;
};
