import type { UiCopy } from "@/types";
import { fillTemplate } from "@utils/fillTemplate";
import uiData from "../../data/ui.json";

const ui = uiData as UiCopy;

/** Copy for the site chrome that is not a content section: nav, hero
 *  actions, footer, modals, the command palette and error states
 *  (validate-data.js checks every field and its placeholders). */
export const getUiCopy = (): UiCopy => ui;

/** The accessible name of a link that opens a new tab: the link's own label
 *  plus the shared "(opens in a new tab)" note. */
export const newTabLabel = (label: string): string =>
   fillTemplate(ui.new_tab, { label });
