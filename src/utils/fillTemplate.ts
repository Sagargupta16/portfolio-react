export type TemplateValues = Record<string, string | number | undefined>;

/** Fills the `{name}` placeholders of a data/*.json copy template; a name
 *  with no value becomes an empty string. */
export const fillTemplate = (
   template: string,
   values: TemplateValues = {},
): string =>
   template.replaceAll(/\{(\w+)\}/g, (_, name: string) =>
      String(values[name] ?? ""),
   );
