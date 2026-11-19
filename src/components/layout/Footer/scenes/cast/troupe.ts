/* A troupe: the cast manifest plus the decoded strips its stages use. */

import {
   type CastManifest,
   type CastMember,
   type CastMemberId,
   MANIFEST,
   stripFor,
} from "./art";
import { Stage, type StageOptions } from "./stage";

export class Troupe {
   readonly manifest: CastManifest = MANIFEST;
   /** One frame's width and height in px at full size. */
   readonly size: readonly [number, number] = MANIFEST.size;
   readonly members: ReadonlyMap<CastMemberId, CastMember> = new Map(
      MANIFEST.members.map((m) => [m.id, m]),
   );
   private _images = new Map<string, Promise<HTMLImageElement | null>>();
   _stages = new Set<Stage>();

   /** A stage on `el` (it gets the class cast-stage). */
   stage(el: HTMLElement, o?: StageOptions): Stage {
      const s = new Stage(this, el, o);
      this._stages.add(s);
      return s;
   }
   _src(member: CastMember, px: number): string {
      return stripFor(member, px);
   }
   // Loads and decodes one strip once. The Image is kept so its decoded
   // bitmap stays cached for the CSS background that uses the same URL.
   // A strip that fails is forgotten (the next ready() tries again).
   _load(src: string): Promise<HTMLImageElement | null> {
      const cached = this._images.get(src);
      if (cached) return cached;
      const img = new Image();
      img.src = src;
      // decode() can reject for an image that did load; that one counts.
      const p = img.decode().then(
         () => img,
         () => {
            if (img.complete && img.naturalWidth) return img;
            this._images.delete(src);
            console.warn(`cast: could not load ${src}`);
            return null;
         },
      );
      this._images.set(src, p);
      return p;
   }
   /** Lets go of every strip no actor on any stage uses any more. */
   release(): void {
      const used = new Set<string>();
      for (const s of this._stages) for (const a of s.actors) used.add(a._src);
      for (const src of [...this._images.keys()]) {
         if (!used.has(src)) this._images.delete(src);
      }
   }
}

/** A troupe with the site's cast. Nothing is fetched (the manifest is
    bundled; strips load in stage.ready()); async so a scene reads like the
    lab drafts: `const troupe = await loadTroupe()`. */
export function loadTroupe(): Promise<Troupe> {
   return Promise.resolve(new Troupe());
}
