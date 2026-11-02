// The data/*.json files, by name (without ".json"). validate-data.js checks all
// of them, the machine view reads the public ones, and the build publishes
// every file except the private ones at /data/<name>.json.

// Published, and listed in llms.txt in this order.
export const PUBLIC_DATA_FILES = [
   "personal",
   "experience",
   "projects",
   "skills",
   "achievements",
   "education",
   "news",
   "services",
   "sections",
   "glossary",
   "annotations",
   "ui",
];

// Kept out of /data/. It is not secret (src/data/contact.ts bundles it into
// the app, and the EmailJS IDs in it are public by design); the machine view
// reads only the email and the booking link from it.
export const PRIVATE_DATA_FILES = ["contact"];

export const DATA_FILES = [...PUBLIC_DATA_FILES, ...PRIVATE_DATA_FILES];
