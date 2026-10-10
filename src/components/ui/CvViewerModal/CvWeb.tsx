import type { ReactNode } from "react";
import { Globe, Mail, Star } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import type { CvBlock, CvInline, CvJson } from "./cvTypes";

/* The CV as a web page: same sections, order and wording as the released PDF
   (parsed from its .tex at build time), set as a white sheet in the PDF's
   typeface family so it reads like the document, but with real text that
   reflows on a phone, selects, and links. Styles live in .cv-sheet. */

const ICONS: Record<string, ReactNode> = {
   faGithub: <FaGithub aria-hidden="true" />,
   faGlobe: <Globe aria-hidden="true" />,
   faLinkedinSquare: <FaLinkedin aria-hidden="true" />,
   faEnvelope: <Mail aria-hidden="true" />,
   faStarO: <Star aria-hidden="true" className="cv-star" />,
};

const isExternal = (href: string) => /^https?:/.test(href);

/** Plain text of a run, used as a stable React key (the CV never reorders). */
const textOf = (nodes: CvInline[]): string =>
   nodes
      .map((n) => {
         if (typeof n === "string") return n;
         return "c" in n ? textOf(n.c) : "";
      })
      .join("")
      .slice(0, 80);

/** Nodes have no stable ids, so keys come from their position in the parent. */
const Inline = ({ nodes }: { nodes: CvInline[] }) => (
   <>
      {nodes.map((node, index) => {
         const key = `n${index}`;
         if (typeof node === "string") return <span key={key}>{node}</span>;
         switch (node.t) {
            case "br":
               return <br key={key} />;
            case "icon":
               return <span key={key}>{ICONS[node.name] ?? null}</span>;
            case "b":
               return (
                  <strong key={key}>
                     <Inline nodes={node.c} />
                  </strong>
               );
            case "i":
               return (
                  <em key={key}>
                     <Inline nodes={node.c} />
                  </em>
               );
            case "code":
               return (
                  <code key={key}>
                     <Inline nodes={node.c} />
                  </code>
               );
            case "a":
               return (
                  <a
                     key={key}
                     href={node.href}
                     {...(isExternal(node.href) && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                     })}
                  >
                     <Inline nodes={node.c} />
                  </a>
               );
            default:
               return null;
         }
      })}
   </>
);

const Block = ({ block }: { block: CvBlock }) => {
   switch (block.t) {
      case "entry":
         return (
            <div className="cv-entry">
               <div className="cv-entry-head">
                  <span className="cv-entry-title">
                     <Inline nodes={block.title} />
                  </span>
                  <span className="cv-entry-date">
                     <Inline nodes={block.date} />
                  </span>
                  <span className="cv-entry-sub">
                     <Inline nodes={block.subtitle} />
                  </span>
                  <span className="cv-entry-meta">
                     <Inline nodes={block.meta} />
                  </span>
               </div>
               {block.items.length > 0 && (
                  <ul className="cv-bullets">
                     {block.items.map((item) => (
                        <li key={textOf(item)}>
                           <Inline nodes={item} />
                        </li>
                     ))}
                  </ul>
               )}
            </div>
         );
      case "list":
         return (
            <ul className="cv-list">
               {block.items.map((item) => (
                  <li key={textOf(item.c)}>
                     <span>
                        <Inline nodes={item.c} />
                     </span>
                     {item.aside && (
                        <em className="cv-aside">
                           <Inline nodes={item.aside} />
                        </em>
                     )}
                  </li>
               ))}
            </ul>
         );
      case "rows":
         return (
            <div className="cv-rows">
               {block.rows.map((row) => (
                  <p key={textOf(row)}>
                     <Inline nodes={row} />
                  </p>
               ))}
            </div>
         );
      default:
         return (
            <p className="cv-para">
               <Inline nodes={block.c} />
            </p>
         );
   }
};

const blockKey = (block: CvBlock) => {
   if (block.t === "entry")
      return `e:${textOf(block.title)}:${textOf(block.date)}`;
   if (block.t === "list") return `l:${textOf(block.items[0]?.c ?? [])}`;
   if (block.t === "rows") return `r:${textOf(block.rows[0] ?? [])}`;
   return `p:${textOf(block.c)}`;
};

const CvWeb = ({ cv }: { cv: CvJson }) => (
   <article className="cv-sheet" aria-label={`${cv.header.name} CV`}>
      <header className="cv-head">
         <h3 className="cv-name">{cv.header.name}</h3>
         <p className="cv-tagline">{cv.header.tagline.join("  |  ")}</p>
         <p className="cv-links">
            {cv.header.links.map((link) => (
               <span key={textOf(link)}>
                  <Inline nodes={link} />
               </span>
            ))}
         </p>
      </header>
      {cv.sections.map((section) => (
         <section key={section.title} className="cv-section">
            <h4>{section.title}</h4>
            {section.blocks.map((block) => (
               <Block key={blockKey(block)} block={block} />
            ))}
         </section>
      ))}
   </article>
);

export default CvWeb;
