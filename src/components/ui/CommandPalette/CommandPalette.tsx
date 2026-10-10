import { useState, type ReactNode } from "react";
import { Command } from "cmdk";
import {
   ArrowUpRight,
   Calendar,
   Copy,
   FileDown,
   FileText,
   FolderGit2,
   Hash,
   ScanEye,
   Sparkles,
   UserPlus,
} from "lucide-react";
import { NAV_SECTIONS } from "@/constants/sections";
import { getContactOptions } from "@data/contact";
import { getSocialProfiles } from "@data/personal";
import { getFeaturedProjects } from "@data/projects";
import useMotionPreference from "@hooks/useMotionPreference";
import useSectionNavigation from "@hooks/useSectionNavigation";
import { setPaletteOpen } from "@utils/paletteState";
import { toggleAnnotations, useAnnotationsOn } from "@utils/annotationsState";

/* Cmd/Ctrl+K palette, styled as a shell: every row reads as the command you
   would type (cd about, open cv, git clone ...) with a plain description.
   Jump to sections, copy the email, grab the CV, book a call, flip the motion
   setting, open featured projects and profiles. Data comes from data/*.json. */

const RESUME_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";

const close = () => setPaletteOpen(false);

// Build-time files from scripts/machine-view.js, served beside index.html.
const siteFile = (file: string) => `${import.meta.env.BASE_URL}${file}`;

/** Exact hostname match (a substring check would accept evil.com/cal.com). */
const hostOf = (url: string) => {
   try {
      return new URL(url).hostname;
   } catch {
      return "";
   }
};

const openExternal = (url: string) => {
   globalThis.open(url, "_blank", "noopener,noreferrer");
   close();
};

interface RowProps {
   value: string;
   command: string;
   hint: string;
   icon: ReactNode;
   onSelect: () => void;
}

const Row = ({ value, command, hint, icon, onSelect }: RowProps) => (
   <Command.Item value={value} onSelect={onSelect} className="palette-item">
      <span className="palette-icon" aria-hidden="true">
         {icon}
      </span>
      <span className="palette-command">{command}</span>
      <span className="palette-hint">{hint}</span>
   </Command.Item>
);

const slug = (text: string) =>
   text
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-|-$/g, "");

const CommandPalette = ({ open }: { open: boolean }) => {
   const { navigateToSection } = useSectionNavigation();
   const { preference, setPreference } = useMotionPreference();
   const [copied, setCopied] = useState(false);
   const annotationsOn = useAnnotationsOn();
   const contacts = getContactOptions();
   const email = contacts.find((c) => c.link.startsWith("mailto:"))?.value;
   const booking = contacts.find((c) => hostOf(c.link) === "cal.com")?.link;

   const go = (id: string) => {
      close();
      navigateToSection(id);
   };

   return (
      <Command.Dialog
         open={open}
         onOpenChange={setPaletteOpen}
         label="Command palette"
         overlayClassName="palette-overlay"
         contentClassName="palette"
         loop
      >
         <div className="palette-prompt">
            <span aria-hidden="true">~/sagar $</span>
            <Command.Input
               placeholder="type a command or search"
               className="palette-input"
               autoCapitalize="none"
               autoCorrect="off"
               spellCheck={false}
               enterKeyHint="go"
            />
            <kbd className="palette-kbd">esc</kbd>
         </div>
         <Command.List className="palette-list">
            <Command.Empty className="palette-empty">
               command not found. try &quot;cd&quot; or &quot;open&quot;
            </Command.Empty>

            <Command.Group heading="Go to" className="palette-group">
               <Row
                  value="cd home top hero"
                  command="cd ~"
                  hint="Top of the page"
                  icon={<Hash size={14} />}
                  onSelect={() => go("hero")}
               />
               {NAV_SECTIONS.map(({ id, label }) => (
                  <Row
                     key={id}
                     value={`cd ${id} ${label}`}
                     command={`cd ${id}`}
                     hint={label}
                     icon={<Hash size={14} />}
                     onSelect={() => go(id)}
                  />
               ))}
            </Command.Group>

            <Command.Group heading="Actions" className="palette-group">
               {email && (
                  <Row
                     value={`copy email ${email}`}
                     command={copied ? "copied" : "pbcopy email"}
                     hint={email}
                     icon={<Copy size={14} />}
                     onSelect={() => {
                        void navigator.clipboard?.writeText(email).then(() => {
                           setCopied(true);
                           setTimeout(() => setCopied(false), 1600);
                        });
                     }}
                  />
               )}
               <Row
                  value="open cv resume download pdf"
                  command="open cv.pdf"
                  hint="Download the CV"
                  icon={<FileDown size={14} />}
                  onSelect={() => openExternal(RESUME_URL)}
               />
               {booking && (
                  <Row
                     value="book a call schedule meeting cal"
                     command="cal book"
                     hint="Book a call"
                     icon={<Calendar size={14} />}
                     onSelect={() => openExternal(booking)}
                  />
               )}
               <Row
                  value="motion animation toggle reduced full"
                  command={`motion --${preference === "reduced" ? "full" : "reduced"}`}
                  hint={
                     preference === "reduced"
                        ? "Turn animations back on"
                        : "Calm the animations"
                  }
                  icon={<Sparkles size={14} />}
                  onSelect={() => {
                     setPreference(
                        preference === "reduced" ? "full" : "reduced",
                     );
                     close();
                  }}
               />
            </Command.Group>

            <Command.Group heading="Under the hood" className="palette-group">
               <Row
                  value="notes annotations how it is built behind the scenes"
                  command={`notes --${annotationsOn ? "off" : "on"}`}
                  hint={
                     annotationsOn
                        ? "Hide the build notes"
                        : "Pin how-it's-built notes on the page"
                  }
                  icon={<ScanEye size={14} />}
                  onSelect={() => {
                     toggleAnnotations();
                     close();
                  }}
               />
               <Row
                  value="cat llms txt ai agents machine readable"
                  command="cat llms.txt"
                  hint="The index for AI agents"
                  icon={<FileText size={14} />}
                  onSelect={() => openExternal(siteFile("llms.txt"))}
               />
               <Row
                  value="open markdown md plain text version"
                  command="open index.md"
                  hint="This whole page as Markdown"
                  icon={<FileText size={14} />}
                  onSelect={() => openExternal(siteFile("index.md"))}
               />
               <Row
                  value="save contact card vcard vcf phone"
                  command="save contact.vcf"
                  hint="Add me to your contacts"
                  icon={<UserPlus size={14} />}
                  onSelect={() => {
                     globalThis.location.assign(siteFile("sagar-gupta.vcf"));
                     close();
                  }}
               />
            </Command.Group>

            <Command.Group heading="Projects" className="palette-group">
               {getFeaturedProjects()
                  .filter((project) => project.github)
                  .map((project) => (
                     <Row
                        key={project.id}
                        value={`git clone ${project.title}`}
                        command={`git clone ${slug(project.title)}`}
                        hint={project.title}
                        icon={<FolderGit2 size={14} />}
                        onSelect={() => openExternal(project.github)}
                     />
                  ))}
            </Command.Group>

            <Command.Group heading="Elsewhere" className="palette-group">
               {getSocialProfiles().map((profile) => (
                  <Row
                     key={profile.id}
                     value={`open ${profile.name}`}
                     command={`open ${profile.name.toLowerCase()}`}
                     hint={profile.link.replace(/^https?:\/\/(www\.)?/, "")}
                     icon={<ArrowUpRight size={14} />}
                     onSelect={() => openExternal(profile.link)}
                  />
               ))}
            </Command.Group>
         </Command.List>
      </Command.Dialog>
   );
};

export default CommandPalette;
