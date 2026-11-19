/* The contract between the footer shell and a footer scene.

   A scene is the picture that plays in the footer's stage: plain DOM, CSS
   and Web Animations, built and torn down by `mount`. It is not a React
   component, so a visitor switching scenes never re-renders the shell, and
   each scene ships as its own lazy chunk (registry.ts).

   The shell owns everything around the stage: the scene switcher, the end
   line, the email control, the social links and the legal lines. A scene
   never reaches outside the element it is given. */

import type { FooterScenesCopy } from "@/types";

/** Scene ids, in switcher order. The first one is the default. */
export const FOOTER_SCENE_IDS = [
   "rooftop",
   "street",
   "pictionary",
   "carousel",
] as const;
export type FooterSceneId = (typeof FOOTER_SCENE_IDS)[number];

/** What the shell hands a scene when it mounts. */
export interface FooterSceneContext<Id extends FooterSceneId = FooterSceneId> {
   /** True while the site's own motion preference is Reduced. The OS
       setting is never read. */
   reduced: boolean;
   /** This scene's block of `data/ui.json` (`footer.scenes.<id>`). Every
       string a visitor or a screen reader can meet comes from here; the
       shell has already filled `{name}` and `{first_name}`. */
   copy: FooterScenesCopy[Id];
   /** His name as written in `data/personal.json`, and its first word. */
   name: string;
   firstName: string;
   /** His IANA time zone from `data/personal.json`. */
   timeZone: string;
   /** The shell's email control, for a scene that sends something to it. */
   email: {
      /** Its box in viewport coordinates, or null while it is not laid out. */
      rect(): DOMRect | null;
      /** One short pulse on the control (a nudge). */
      pulse(): void;
      /** Something of the scene has landed on the control: it lights up for
          a moment and the end line's accent word gets its underline. In
          Reduced both show at once, with nothing moving. The underline stays
          until `underline(false)` or until another scene takes the stage. */
      arrive(): void;
      /** Shows or clears that underline at once, with no animation: for a
          composed still and for a reset. */
      underline(shown: boolean): void;
   };
   /** The shell's end line: the words between the stage and the email
       control. For a scene whose own object travels to the control and
       should pass beside those words, not over them. */
   endLine: {
      /** The box of its words (the text, not the block around it) in
          viewport coordinates, or null while it is not laid out. */
      rect(): DOMRect | null;
   };
   /** Call once, when the first frame is ready to be seen (art decoded,
       actors placed). The shell keeps the stage hidden until then, and
       shows it anyway after a few seconds. */
   ready(): void;
}

/** The email control reports to the scene on stage, so a scene can answer
    it. Every member is optional: a scene implements what its twist uses. */
export interface FooterSceneEmailEvents {
   /** Desktop: a press began and the ring will fill in `ms`. */
   holdStart?(ms: number): void;
   /** Desktop: the press ended before the ring filled. Nothing was copied. */
   holdCancel?(): void;
   /** The address was copied. `quick` is true for a plain click or a key
       press, where no hold came first. */
   copied?(quick: boolean): void;
   /** Phones: the knob is being dragged; `progress` runs 0 to 1. */
   slide?(progress: number): void;
   /** Phones: the drag ended. `sent` is true when it reached the end and
       the mail app is opening. */
   slideEnd?(sent: boolean): void;
}

/** What `mount` returns. Every call must be safe at any time, including
    before the scene's own assets have loaded and after `destroy`. */
export interface FooterSceneHandle {
   /** The motion preference changed. Reduced shows one composed still:
       no loops, no timers, nothing moving. */
   setReduced(reduced: boolean): void;
   /** False while the stage is off screen or the scene is not the one
       showing: every timer holds and no animation runs. */
   setVisible(visible: boolean): void;
   email?: FooterSceneEmailEvents;
   /** Removes every node, listener, timer, observer and animation the
       scene made. Called when the visitor picks another scene and when the
       footer unmounts. */
   destroy(): void;
}

/** Builds the scene inside `stage`, an empty positioned element that already
    has its final size (read it from layout and watch it with a
    ResizeObserver; never assume a height). Returns at once: loading and
    decoding go on inside, and end with `ctx.ready()`. */
export type FooterSceneMount<Id extends FooterSceneId = FooterSceneId> = (
   stage: HTMLElement,
   ctx: FooterSceneContext<Id>,
) => FooterSceneHandle;

/** A scene module's shape: `export const mount: FooterSceneMount<"rooftop">`. */
export interface FooterSceneModule<Id extends FooterSceneId = FooterSceneId> {
   mount: FooterSceneMount<Id>;
}
