/* "How it's built" notes. Each one pins to the first visible element that
   matches its selector, so sections that have not rendered yet simply get
   their pin once they mount. Every claim here is checkable in this repo. */

export interface Annotation {
   id: string;
   selector: string;
   title: string;
   body: string;
}

export const ANNOTATIONS: Annotation[] = [
   {
      id: "palette",
      selector: '.palette-trigger[aria-label="Open command palette"]',
      title: "Ctrl+K is a shell",
      body: "A cmdk command palette with shell-style commands. Its code loads the first time you open it, not with the page.",
   },
   {
      id: "headline",
      selector: "#hero h1",
      title: "Type that leans in",
      body: "Bricolage Grotesque on its variable weight axis. One animation-frame loop raises each letter from 600 to 800 as your pointer comes within 150px.",
   },
   {
      id: "bust",
      selector: ".sagar-face",
      title: "Drawn from my own photo",
      body: "The bust and the hopping mascot start from my photo. Backgrounds were removed with Stability on Amazon Bedrock, then the poses were sliced into an 8-frame sprite strip.",
   },
   {
      id: "mascot",
      selector: ".mascot-perch",
      title: "It follows your reading",
      body: "One shared IntersectionObserver tells the mascot which section heading you are on, so it hops out of the old one and drops into the new one.",
   },
   {
      id: "news",
      selector: ".news-graph",
      title: "Stable commit hashes",
      body: "Each entry gets a 7-character FNV-1a hash of its date and text, so the hashes stay the same on every build.",
   },
   {
      id: "projects",
      selector: ".project-grid",
      title: "Covers without a scroll listener",
      body: "Covers are live screenshots or scenes drawn in code. They reveal with CSS scroll-driven animation (animation-timeline: view()), with no JavaScript watching the scroll.",
   },
   {
      id: "contributions",
      selector: ".contribution-grid",
      title: "Refreshed every Monday",
      body: "A scheduled GitHub Actions workflow re-reads PR states, stars and LeetCode stats every Monday and opens a pull request for review.",
   },
   {
      id: "contact",
      selector: "#contact form",
      title: "No backend to run",
      body: "The form sends through EmailJS straight from the browser. A hidden honeypot field drops most bots before anything is sent.",
   },
   {
      id: "vitals",
      selector: ".footer-vitals",
      title: "Measured on your device",
      body: "Your Core Web Vitals for this visit, read live by the web-vitals library. The numbers stay in your browser.",
   },
   {
      id: "build",
      selector: ".footer-build",
      title: "Every push is gated",
      body: "Each push to main runs format, lint, type-check, data validation, tests and a dependency audit before Vite builds and GitHub Pages deploys. index.md and llms.txt come out of that same build.",
   },
];
