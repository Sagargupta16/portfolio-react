/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import FloatingGeometry from "./FloatingGeometry";
import ParticleField from "./ParticleField";
import useBreakpoint from "@hooks/useBreakpoint";
import useReducedMotion from "@hooks/useReducedMotion";

// Global interactive 3D background. A single fixed full-viewport canvas that
// spans every section. The whole scene tilts toward the pointer and the camera
// parallaxes, so moving the mouse (or dragging a finger) steers the view.
//
// Pointer is tracked on `window` -- NOT via R3F's built-in state.pointer --
// because the canvas is pointer-events:none (it must not intercept clicks on
// the content above it), which would otherwise freeze R3F's pointer at origin.

interface Pointer {
   x: number; // normalized -1..1
   y: number; // normalized -1..1
}

// Lerps the scene group + camera toward the pointer for a parallax steer.
const InteractiveRig = ({
   pointer,
   children,
}: {
   pointer: RefObject<Pointer>;
   children: React.ReactNode;
}) => {
   const group = useRef<THREE.Group>(null);
   // Smoothed pointer offset, lerped each frame so steering eases in/out.
   const steer = useRef({ x: 0, y: 0 });

   // Read camera via the frame state (not a captured useThree value) so the
   // React Compiler immutability rule allows the per-frame mutation.
   useFrame((state, delta) => {
      const p = pointer.current;
      const k = Math.min(1, delta * 2); // frame-rate-independent lerp factor
      const t = state.clock.elapsedTime;

      // Ease the pointer offset toward the live pointer.
      steer.current.x += (p.x - steer.current.x) * k;
      steer.current.y += (p.y - steer.current.y) * k;

      if (group.current) {
         // Continuous ambient orbit (always running) + pointer steer on top.
         group.current.rotation.y = t * 0.12 + steer.current.x * 0.4;
         group.current.rotation.x =
            Math.sin(t * 0.15) * 0.12 - steer.current.y * 0.28;
      }

      // Subtle camera parallax -- the scene appears to shift behind the glass.
      const { camera } = state;
      camera.position.x += (steer.current.x * 1.2 - camera.position.x) * k;
      camera.position.y += (-steer.current.y * 0.8 - camera.position.y) * k;
      camera.lookAt(0, 0, 0);
   });

   return <group ref={group}>{children}</group>;
};

const SceneBackground = () => {
   const { isMobile } = useBreakpoint();
   const reducedMotion = useReducedMotion();
   const [degraded, setDegraded] = useState(false);
   const pointer = useRef<Pointer>({ x: 0, y: 0 });

   useEffect(() => {
      const setFromXY = (clientX: number, clientY: number) => {
         pointer.current.x = (clientX / globalThis.innerWidth) * 2 - 1;
         pointer.current.y = (clientY / globalThis.innerHeight) * 2 - 1;
      };
      const onMouseMove = (e: MouseEvent) => setFromXY(e.clientX, e.clientY);
      const onTouchMove = (e: TouchEvent) => {
         const t = e.touches[0];
         if (t) setFromXY(t.clientX, t.clientY);
      };

      globalThis.addEventListener("mousemove", onMouseMove);
      globalThis.addEventListener("touchmove", onTouchMove, { passive: true });
      return () => {
         globalThis.removeEventListener("mousemove", onMouseMove);
         globalThis.removeEventListener("touchmove", onTouchMove);
      };
   }, []);

   const desktopParticles = degraded ? 150 : 300;
   const particleCount = isMobile ? 100 : desktopParticles;
   const dpr: [number, number] = isMobile ? [0.5, 1] : [1, 2];

   return (
      <Canvas
         aria-hidden="true"
         style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
         }}
         camera={{ position: [0, 0, 8], fov: 50 }}
         dpr={dpr}
         // Reduced motion -> render once and freeze (static 3D snapshot).
         frameloop={reducedMotion ? "demand" : "always"}
         gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: "high-performance",
         }}
      >
         <PerformanceMonitor
            onDecline={() => setDegraded(true)}
            onIncline={() => setDegraded(false)}
         />

         {/* Lighting matching glassmorphism theme */}
         <ambientLight intensity={0.2} />
         <directionalLight position={[5, 5, 5]} intensity={0.5} color="#06b6d4" />
         <pointLight position={[-5, -3, 3]} intensity={0.3} color="#a855f7" />

         <InteractiveRig pointer={pointer}>
            {/* Center: wireframe torus knot */}
            <FloatingGeometry
               geometry="torusKnot"
               position={[0, 0, 0]}
               scale={isMobile ? 1.2 : 1.8}
               color="#06b6d4"
               wireframe
               rotationSpeed={0.15}
               floatIntensity={0.5}
               opacity={0.3}
            />

            {/* Left: glass-like icosahedron */}
            {!isMobile && (
               <FloatingGeometry
                  geometry="icosahedron"
                  position={[-4, 1.5, -2]}
                  scale={0.8}
                  color="#a855f7"
                  wireframe={false}
                  rotationSpeed={0.25}
                  floatIntensity={1.2}
                  distortion={0.3}
                  opacity={0.2}
               />
            )}

            {/* Right: wireframe octahedron */}
            {!isMobile && (
               <FloatingGeometry
                  geometry="octahedron"
                  position={[3.5, -1, -1]}
                  scale={0.7}
                  color="#06b6d4"
                  wireframe
                  rotationSpeed={0.35}
                  floatIntensity={0.8}
                  opacity={0.25}
               />
            )}

            {/* Scattered small decorative dodecahedrons - desktop, non-degraded */}
            {!isMobile && !degraded && (
               <>
                  <FloatingGeometry
                     geometry="dodecahedron"
                     position={[-2.5, -2, -3]}
                     scale={0.3}
                     color="#06b6d4"
                     wireframe
                     rotationSpeed={0.5}
                     floatIntensity={1.5}
                     opacity={0.15}
                  />
                  <FloatingGeometry
                     geometry="dodecahedron"
                     position={[2, 2.5, -4]}
                     scale={0.25}
                     color="#a855f7"
                     wireframe
                     rotationSpeed={0.4}
                     floatIntensity={1.8}
                     opacity={0.12}
                  />
               </>
            )}

            {/* 3D particle field */}
            <ParticleField count={particleCount} />
         </InteractiveRig>
      </Canvas>
   );
};

export default SceneBackground;
