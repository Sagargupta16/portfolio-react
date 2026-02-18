import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import FloatingGeometry from './FloatingGeometry'
import useReducedMotion from '@utils/useReducedMotion'
import useMediaQuery from '@utils/useMediaQuery'

const ParticleField = ({ count = 300, reducedMotion = false }) => {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) {
      ref.current.rotation.y += delta * 0.02
      ref.current.rotation.x += delta * 0.01
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
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
  )
}

const HeroScene = () => {
  const reducedMotion = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const particleCount = isMobile ? 100 : 300
  const dpr = isMobile ? [0.5, 1] : [1, 2]

  return (
    <Canvas
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={dpr}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor
        onDecline={() => {
          // Auto-reduce quality if performance drops
        }}
      />

      {/* Lighting matching glassmorphism theme */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#06b6d4" />
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
        reducedMotion={reducedMotion}
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
          reducedMotion={reducedMotion}
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
          reducedMotion={reducedMotion}
        />
      )}

      {/* Scattered small decorative dodecahedrons - desktop only */}
      {!isMobile && (
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
            reducedMotion={reducedMotion}
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
            reducedMotion={reducedMotion}
          />
        </>
      )}

      {/* 3D particle field */}
      <ParticleField count={particleCount} reducedMotion={reducedMotion} />
    </Canvas>
  )
}

export default HeroScene
