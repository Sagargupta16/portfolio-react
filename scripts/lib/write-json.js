import { writeFileSync } from "node:fs";
import { format, resolveConfig } from "prettier";

/** Write data as JSON in the repo's Prettier format, so the file passes
    `pnpm format:check` as is. */
export async function writeJson(path, data) {
   const options = await resolveConfig(path);
   const text = await format(JSON.stringify(data, null, 3), {
      ...options,
      filepath: path,
   });
   writeFileSync(path, text, "utf8");
}
