import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import usePauseOffscreen, { SECTION_MARGIN } from "@hooks/usePauseOffscreen";
import useBreakpoint from "@hooks/useBreakpoint";
import useStoredChoice from "@hooks/useStoredChoice";
import { MONO_FONT, TEXT_PRIMARY } from "@/constants/theme";
import { LOADING, type LoadState } from "@/types/loadState";
import { getContactOptions } from "@data/contact";
import { getName } from "@data/personal";
import { getUiCopy } from "@data/ui";
import { fillTemplate } from "@utils/fillTemplate";
import { segments } from "@utils/accentSegments";
import VariantSwitcher from "@components/ui/VariantSwitcher";
import FooterStage, { type SceneStep } from "./FooterStage";
import FooterSocial from "./FooterSocial";
import HoldToCopy from "./HoldToCopy";
import SlideToContact from "./SlideToContact";
import {
   FOOTER_SCENE_IDS,
   type FooterSceneEmailEvents,
   type FooterSceneId,
} from "./scenes/types";
import "./footer.css";

const COPY = getUiCopy().footer;
const CURRENT_YEAR = new Date().getFullYear();
const SCENE_KEY = "portfolio-footer-scene";
const SCENE_OPTIONS = FOOTER_SCENE_IDS.map((id) => ({
   id,
   name: COPY.scenes[id].name,
}));
const showScene = (scene: string) => fillTemplate(COPY.scene_show, { scene });

const KONAMI: string[] = [
   "ArrowUp",
   "ArrowUp",
   "ArrowDown",
   "ArrowDown",
   "ArrowLeft",
   "ArrowRight",
   "ArrowLeft",
   "ArrowRight",
   "b",
   "a",
].map((key) => key.toLowerCase());
const KONAMI_CODE = KONAMI.join(" ");
// Pressed on their own for a capital B or A; they are not part of the code.
const MODIFIER_KEYS = new Set(["shift", "capslock"]);

/* The end of the page: a scene the visitor can switch, his end line, the
   email control with the social icons, and the legal lines. */
const Footer = () => {
   const [easterEgg, setEasterEgg] = useState(false);
   const [scene, setScene] = useStoredChoice(
      SCENE_KEY,
      FOOTER_SCENE_IDS,
      FOOTER_SCENE_IDS[0],
   );
   const [step, setStep] = useState<SceneStep>(1);
   const [load, setLoad] = useState<LoadState<FooterSceneId>>(LOADING);
   const bodyRef = useRef<HTMLDivElement>(null);
   const emailRef = useRef<HTMLDivElement>(null);
   const underlineRef = useRef<HTMLSpanElement>(null);
   const sceneEmailRef = useRef<FooterSceneEmailEvents | undefined>(undefined);
   usePauseOffscreen(bodyRef, SECTION_MARGIN);
   const { isMobile } = useBreakpoint();
   const name = getName();
   const emailOption = getContactOptions().find((option) =>
      option.link.startsWith("mailto:"),
   );

   // The controls report to whichever scene is on stage at the time.
   const emailEvents = useMemo<FooterSceneEmailEvents>(
      () => ({
         holdStart: (ms) => sceneEmailRef.current?.holdStart?.(ms),
         holdCancel: () => sceneEmailRef.current?.holdCancel?.(),
         copied: (quick) => sceneEmailRef.current?.copied?.(quick),
         slide: (progress) => sceneEmailRef.current?.slide?.(progress),
         slideEnd: (sent) => sceneEmailRef.current?.slideEnd?.(sent),
      }),
      [],
   );

   const choose = (next: FooterSceneId, direction: SceneStep) => {
      setStep(direction);
      setScene(next);
   };
   const stepScene = (direction: SceneStep) => {
      const at = FOOTER_SCENE_IDS.indexOf(scene);
      const count = FOOTER_SCENE_IDS.length;
      choose(FOOTER_SCENE_IDS[(at + direction + count) % count], direction);
   };

   // Matches the last ten keys rather than stepping an index, so a near miss
   // such as a third ArrowUp still completes, and B/A match in any case.
   useEffect(() => {
      let recent: string[] = [];
      const handleKey = (e: KeyboardEvent) => {
         // Autofill dispatches keydown without a key.
         const key = e.key?.toLowerCase();
         if (!key || MODIFIER_KEYS.has(key)) return;
         recent = [...recent, key].slice(-KONAMI.length);
         if (recent.join(" ") === KONAMI_CODE) {
            setEasterEgg(true);
            recent = [];
         }
      };
      globalThis.addEventListener("keydown", handleKey);
      return () => globalThis.removeEventListener("keydown", handleKey);
   }, []);

   return (
      <footer
         className="footer"
         data-footer-scene={scene}
         data-scene-ready={
            load.status === "ready" && load.data === scene ? "" : undefined
         }
      >
         <FooterStage
            scene={scene}
            step={step}
            onStep={stepScene}
            onLoad={setLoad}
            emailRef={emailRef}
            underlineRef={underlineRef}
            sceneEmailRef={sceneEmailRef}
         />
         <div className="footer-bar">
            <VariantSwitcher
               options={SCENE_OPTIONS}
               value={scene}
               onChange={choose}
               label={COPY.scene_label}
               previousLabel={COPY.scene_previous}
               nextLabel={COPY.scene_next}
               optionLabel={showScene}
            />
         </div>

         <div ref={bodyRef} className="footer-body">
            {/* AccentText's markup, plus the accent word's hand-drawn
                underline that a scene's landing draws (FooterStage). */}
            <p className="display-heading footer-end-line">
               {segments(COPY.end_line).map(({ at, text, accent }) =>
                  accent ? (
                     <em key={at} className="accent-serif footer-accent">
                        {text}
                        <span
                           ref={underlineRef}
                           className="footer-uline"
                           aria-hidden="true"
                        >
                           <svg viewBox="0 0 100 12" preserveAspectRatio="none">
                              <path d="M2 8.5C20 5 40 9.5 60 6.5S88 5.2 98 7.5" />
                           </svg>
                        </span>
                     </em>
                  ) : (
                     <span key={at}>{text}</span>
                  ),
               )}
            </p>
            <div className="footer-actions">
               {emailOption && (
                  <div ref={emailRef} className="footer-email">
                     {/* Phones slide to open the mail app; desktop holds to copy. */}
                     {isMobile ? (
                        <SlideToContact
                           href={emailOption.link}
                           events={emailEvents}
                        />
                     ) : (
                        <HoldToCopy
                           email={emailOption.value}
                           events={emailEvents}
                        />
                     )}
                  </div>
               )}
               <FooterSocial />
            </div>

            {easterEgg && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  style={{
                     padding: "8px 16px",
                     borderRadius: 10,
                     background: "rgb(var(--ch-white) / 0.08)",
                     border: "1px solid rgb(var(--ch-white) / 0.16)",
                     fontFamily: MONO_FONT,
                     fontSize: 12,
                     color: TEXT_PRIMARY,
                     textAlign: "center",
                  }}
               >
                  {COPY.easter_egg}
               </motion.div>
            )}

            <div className="footer-legal">
               <p>
                  {fillTemplate(COPY.copyright, { year: CURRENT_YEAR, name })}
               </p>
               <p>{COPY.disclaimer}</p>
            </div>
         </div>
      </footer>
   );
};

export default Footer;
