import type { UiCopy } from "@/types";
import uiData from "../../data/ui.json";

const ui = uiData as UiCopy;

/** Copy for the site chrome that is not a content section: nav, hero
 *  actions, footer, modals, the command palette and error states
 *  (validate-data.js checks every field and its placeholders). The entry
 *  chunk reads its part from @data/copyShell instead. */
export const getUiCopy = (): UiCopy => ui;

export { newTabLabel } from "./copyShell";
