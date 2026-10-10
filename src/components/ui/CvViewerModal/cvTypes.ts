/* Shape of public/resume-pages/cv.json, written by scripts/resume-tex.js from
   the latex-resume sources at the released tag. */

export type CvInline =
   | string
   | { t: "b" | "i" | "code"; c: CvInline[] }
   | { t: "a"; href: string; c: CvInline[] }
   | { t: "icon"; name: string }
   | { t: "br" };

export type CvBlock =
   | {
        t: "entry";
        title: CvInline[];
        subtitle: CvInline[];
        date: CvInline[];
        meta: CvInline[];
        items: CvInline[][];
     }
   | { t: "list"; items: { c: CvInline[]; aside?: CvInline[] }[] }
   | { t: "rows"; rows: CvInline[][] }
   | { t: "para"; c: CvInline[] };

export interface CvJson {
   version: string | null;
   header: { name: string; tagline: string[]; links: CvInline[][] };
   sections: { title: string; blocks: CvBlock[] }[];
}
