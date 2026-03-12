/* eslint-disable react/no-unknown-property */
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import FloatingGeometry from "./FloatingGeometry";
import ParticleField from "./ParticleField";
import useMediaQuery from "@utils/useMediaQuery";

interface HeroSceneProps {
   visible?: boolean;
}

const HeroScene = ({ visible = true }: HeroSceneProps) => {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const [degraded, setDegraded] = useState(false);

   const desktopParticles = degraded ? 150 : 300;
   const particleCount = isMobile ? 100 : desktopParticles;
   const dpr: [number, number] = isMobile ? [0.5, 1] : [1, 2];

   return (
      <Canvas
         style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
         }}
         camera={{ position: [0, 0, 8], fov: 50 }}
         dpr={dpr}
         frameloop={visible ? "always" : "never"}
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
         <directionalLight
            position={[5, 5, 5]}
            intensity={0.5}
            color="#06b6d4"
         />
         <pointLight position={[-5, -3, 3]} intensity={0.3} color="#a855f7" />

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

         {/* Scattered small decorative dodecahedrons - desktop only, hidden when degraded */}
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
      </Canvas>
   );
};

export default HeroScene;
