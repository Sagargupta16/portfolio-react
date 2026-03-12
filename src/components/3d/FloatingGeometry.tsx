/* eslint-disable react/no-unknown-property */
import type { ReactElement } from "react";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

type GeometryName = "torusKnot" | "icosahedron" | "octahedron" | "dodecahedron";

const GEOMETRIES: Record<GeometryName, (props: object) => ReactElement> = {
   torusKnot: (props) => (
      <torusKnotGeometry args={[1, 0.3, 128, 16]} {...props} />
   ),
   icosahedron: (props) => <icosahedronGeometry args={[1, 1]} {...props} />,
   octahedron: (props) => <octahedronGeometry args={[1, 0]} {...props} />,
   dodecahedron: (props) => <dodecahedronGeometry args={[1, 0]} {...props} />,
};

interface FloatingGeometryProps {
   geometry?: GeometryName;
   position?: [number, number, number];
   scale?: number;
   color?: string;
   wireframe?: boolean;
   rotationSpeed?: number;
   floatIntensity?: number;
   distortion?: number;
   opacity?: number;
}

const FloatingGeometry = ({
   geometry = "torusKnot",
   position = [0, 0, 0],
   scale = 1,
   color = "#06b6d4",
   wireframe = true,
   rotationSpeed = 0.3,
   floatIntensity = 1,
   distortion = 0,
   opacity = 0.6,
}: FloatingGeometryProps) => {
   const meshRef = useRef<THREE.Mesh>(null);

   useFrame((_, delta) => {
      if (meshRef.current) {
         meshRef.current.rotation.x += delta * rotationSpeed * 0.5;
         meshRef.current.rotation.y += delta * rotationSpeed;
      }
   });

   const GeometryComponent = GEOMETRIES[geometry] || GEOMETRIES.torusKnot;

   const floatConfig = { speed: 1.5, floatIntensity, rotationIntensity: 0.2 };

   return (
      <Float {...floatConfig}>
         <mesh ref={meshRef} position={position} scale={scale}>
            <GeometryComponent />
            {distortion > 0 ? (
               <MeshDistortMaterial
                  color={color}
                  wireframe={wireframe}
                  transparent
                  opacity={opacity}
                  distort={distortion}
                  speed={2}
               />
            ) : (
               <meshStandardMaterial
                  color={color}
                  wireframe={wireframe}
                  transparent
                  opacity={opacity}
               />
            )}
         </mesh>
      </Float>
   );
};

export default FloatingGeometry;
