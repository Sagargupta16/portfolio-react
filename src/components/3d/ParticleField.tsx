/* eslint-disable react/no-unknown-property */
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function createParticlePositions(count: number): Float32Array {
   const arr = new Float32Array(count * 3);
   const rand = new Uint32Array(count * 3);
   globalThis.crypto.getRandomValues(rand);
   for (let i = 0; i < count * 3; i++) {
      const scale = i % 3 === 2 ? 15 : 20;
      arr[i] = (rand[i] / 0xffffffff - 0.5) * scale;
   }
   return arr;
}

interface ParticleFieldProps {
   count?: number;
}

const ParticleField = ({ count = 300 }: ParticleFieldProps) => {
   const ref = useRef<THREE.Points>(null);
   const [positions] = useState(() => createParticlePositions(count));

   useFrame((_, delta) => {
      if (ref.current) {
         ref.current.rotation.y += delta * 0.02;
         ref.current.rotation.x += delta * 0.01;
      }
   });

   return (
      <points ref={ref}>
         <bufferGeometry>
            <bufferAttribute
               attach="attributes-position"
               args={[positions, 3]}
               count={count}
            />
         </bufferGeometry>
         <pointsMaterial
            color="#06b6d4"
            size={0.03}
            sizeAttenuation
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
         />
      </points>
   );
};

export default ParticleField;
