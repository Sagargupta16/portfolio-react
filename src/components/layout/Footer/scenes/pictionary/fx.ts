/* The scene's own Web Animations (the board, the speech chips, the answer
   chips, the envelope): one tracked set that pauses and resumes with the
   cast. The cast's stage clock covers the actors; this covers the rest. */

export class Fx {
   private readonly live = new Set<Animation>();
   private held = false;

   /** True while pause() holds the set. */
   get paused(): boolean {
      return this.held;
   }
   /** el.animate, tracked. Started while paused, it waits for resume(). */
   run(
      target: Element,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
   ): Animation {
      const animation = target.animate(keyframes, options);
      this.live.add(animation);
      const drop = (): void => {
         this.live.delete(animation);
      };
      animation.addEventListener("finish", drop);
      animation.addEventListener("cancel", drop);
      if (this.held) animation.pause();
      return animation;
   }
   pause(): void {
      this.held = true;
      for (const a of this.live) if (a.playState === "running") a.pause();
   }
   resume(): void {
      this.held = false;
      for (const a of this.live) if (a.playState === "paused") a.play();
   }
   /** Cancels everything still tracked (a reset, or the scene is leaving). */
   clear(): void {
      for (const a of [...this.live]) a.cancel();
      this.live.clear();
   }
}
