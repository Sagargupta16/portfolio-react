import { useEffect, useRef } from "react";
import useReducedMotion from "@hooks/useReducedMotion";
import useBreakpoint from "@hooks/useBreakpoint";
import { cryptoRandom } from "@utils/random";
import { CYAN, PURPLE } from "@/constants/theme";

// Cursor-reactive constellation: drifting particles wired together by lines
// when they get close, with mouse repulsion. Mounted once at the app root so
// it spans every section (sections sit at higher z-index with transparent /
// translucent backgrounds, letting this show through).

interface Particle {
   x: number;
   y: number;
   vx: number;
   vy: number;
   size: number;
   opacity: number;
   color: string; // "r, g, b"
}

const LINK_DISTANCE = 150; // px within which two particles get a line
const MOUSE_RADIUS = 200; // px interaction field around the cursor
const REPULSION = 0.05; // how hard particles flee the cursor
const AREA_PER_PARTICLE = 12000; // larger -> fewer particles
const MAX_PARTICLES_DESKTOP = 130;
const MAX_PARTICLES_MOBILE = 50;
const LINE_OPACITY = 0.28; // peak opacity of particle-to-particle links
const CURSOR_LINE_OPACITY = 0.4; // peak opacity of cursor-to-particle links

// "#06b6d4" -> "6, 182, 212" for use inside rgba().
const hexToRgb = (hex: string): string => {
   const n = Number.parseInt(hex.slice(1), 16);
   return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const InteractiveConstellation = () => {
   const reducedMotion = useReducedMotion();
   const { isMobile } = useBreakpoint();
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      if (reducedMotion) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const colors = [hexToRgb(CYAN), hexToRgb(PURPLE)];
      const maxParticles = isMobile
         ? MAX_PARTICLES_MOBILE
         : MAX_PARTICLES_DESKTOP;

      let particles: Particle[] = [];
      let width = 0;
      let height = 0;
      let rafId = 0;
      const mouse = { x: -9999, y: -9999 };

      const spawn = (): Particle => ({
         x: cryptoRandom() * width,
         y: cryptoRandom() * height,
         vx: (cryptoRandom() - 0.5) * 0.4,
         vy: (cryptoRandom() - 0.5) * 0.4,
         size: 1.2 + cryptoRandom() * 1.8,
         opacity: 0.45 + cryptoRandom() * 0.45,
         color: colors[cryptoRandom() > 0.5 ? 1 : 0],
      });

      const resize = () => {
         const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
         width = globalThis.innerWidth;
         height = globalThis.innerHeight;
         canvas.width = width * dpr;
         canvas.height = height * dpr;
         canvas.style.width = `${width}px`;
         canvas.style.height = `${height}px`;
         ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

         const target = Math.min(
            Math.floor((width * height) / AREA_PER_PARTICLE),
            maxParticles,
         );
         particles = Array.from({ length: target }, spawn);
      };

      const step = () => {
         ctx.clearRect(0, 0, width, height);

         for (const p of particles) {
            // Drift + edge wrap for an infinite field.
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = width;
            else if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            else if (p.y > height) p.y = 0;

            // Mouse repulsion.
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
               const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * REPULSION;
               p.x += (dx / dist) * force * MOUSE_RADIUS;
               p.y += (dy / dist) * force * MOUSE_RADIUS;

               // Line from cursor to nearby particles -- the interactive tell.
               ctx.beginPath();
               ctx.moveTo(mouse.x, mouse.y);
               ctx.lineTo(p.x, p.y);
               ctx.strokeStyle = `rgba(${p.color}, ${(1 - dist / MOUSE_RADIUS) * CURSOR_LINE_OPACITY})`;
               ctx.lineWidth = 1;
               ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
            ctx.fill();
         }

         // Constellation links -- nested pair scan, fade with distance.
         for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
               const a = particles[i];
               const b = particles[j];
               const dx = a.x - b.x;
               const dy = a.y - b.y;
               const dist = Math.hypot(dx, dy);
               if (dist < LINK_DISTANCE) {
                  ctx.beginPath();
                  ctx.moveTo(a.x, a.y);
                  ctx.lineTo(b.x, b.y);
                  ctx.strokeStyle = `rgba(${a.color}, ${(1 - dist / LINK_DISTANCE) * LINE_OPACITY})`;
                  ctx.lineWidth = 1;
                  ctx.stroke();
               }
            }
         }

         rafId = globalThis.requestAnimationFrame(step);
      };

      const onMouseMove = (e: MouseEvent) => {
         mouse.x = e.clientX;
         mouse.y = e.clientY;
      };
      const onMouseLeave = () => {
         mouse.x = -9999;
         mouse.y = -9999;
      };
      // Pause the loop when the tab is hidden to save battery.
      const onVisibility = () => {
         if (document.hidden) {
            globalThis.cancelAnimationFrame(rafId);
         } else {
            rafId = globalThis.requestAnimationFrame(step);
         }
      };

      resize();
      rafId = globalThis.requestAnimationFrame(step);
      globalThis.addEventListener("resize", resize);
      globalThis.addEventListener("mousemove", onMouseMove);
      globalThis.addEventListener("mouseout", onMouseLeave);
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
         globalThis.cancelAnimationFrame(rafId);
         globalThis.removeEventListener("resize", resize);
         globalThis.removeEventListener("mousemove", onMouseMove);
         globalThis.removeEventListener("mouseout", onMouseLeave);
         document.removeEventListener("visibilitychange", onVisibility);
      };
   }, [reducedMotion, isMobile]);

   if (reducedMotion) return null;

   return (
      <canvas
         ref={canvasRef}
         aria-hidden="true"
         style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
         }}
      />
   );
};

export default InteractiveConstellation;
