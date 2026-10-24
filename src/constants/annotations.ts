/* "How it's built" notes. Each one pins to the first visible element that
   matches its selector, so sections that have not rendered yet simply get
   their pin once they mount. The title and body of each note live in
   data/annotations.json, keyed by id; every claim there is checkable in this
   repo. validate-data.js reads the ids below and fails on copy without a pin
   or a pin without copy. */
import annotationCopy from "../../data/annotations.json";
import { getUiCopy } from "@data/ui";

export interface Annotation {
   id: string;
   selector: string;
   title: string;
   body: string;
}

type AnnotationId = keyof typeof annotationCopy;

/* Pins in reading order. */
const PINS: { id: AnnotationId; selector: string }[] = [
   {
      id: "palette",
      // The palette button, not its "How it's built" sibling: same class,
      // told apart by the label the nav gives it in data/ui.json.
      selector: `.palette-trigger[aria-label="${getUiCopy().nav.palette_label}"]`,
   },
   { id: "headline", selector: "#hero h1" },
   { id: "bust", selector: ".sagar-face" },
   { id: "mascot", selector: ".mascot-perch" },
   { id: "news", selector: ".news-graph" },
   { id: "projects", selector: ".project-grid" },
   { id: "contributions", selector: ".contribution-grid" },
   { id: "contact", selector: "#contact form" },
   { id: "vitals", selector: ".footer-vitals" },
   { id: "build", selector: ".footer-build" },
];

export const ANNOTATIONS: Annotation[] = PINS.map(({ id, selector }) => ({
   id,
   selector,
   ...annotationCopy[id],
}));
