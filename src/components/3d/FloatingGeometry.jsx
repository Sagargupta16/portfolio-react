import { useRef } from 'react'
import PropTypes from 'prop-types'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'

const GEOMETRIES = {
  torusKnot: props => <torusKnotGeometry args={[1, 0.3, 128, 16]} {...props} />,
  icosahedron: props => <icosahedronGeometry args={[1, 1]} {...props} />,
  octahedron: props => <octahedronGeometry args={[1, 0]} {...props} />,
  dodecahedron: props => <dodecahedronGeometry args={[1, 0]} {...props} />
}

const FloatingGeometry = ({
  geometry = 'torusKnot',
  position = [0, 0, 0],
  scale = 1,
  color = '#06b6d4',
  wireframe = true,
  rotationSpeed = 0.3,
  floatIntensity = 1,
  distortion = 0,
  opacity = 0.6,
  reducedMotion = false
}) => {
  const meshRef = useRef()

  useFrame((_, delta) => {
    if (meshRef.current && !reducedMotion) {
      meshRef.current.rotation.x += delta * rotationSpeed * 0.5
      meshRef.current.rotation.y += delta * rotationSpeed
    }
  })

  const GeometryComponent = GEOMETRIES[geometry] || GEOMETRIES.torusKnot

  const floatConfig = reducedMotion
    ? { speed: 0, floatIntensity: 0, rotationIntensity: 0 }
    : { speed: 1.5, floatIntensity, rotationIntensity: 0.2 }

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
  )
}

FloatingGeometry.propTypes = {
  geometry: PropTypes.oneOf(['torusKnot', 'icosahedron', 'octahedron', 'dodecahedron']),
  position: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.number,
  color: PropTypes.string,
  wireframe: PropTypes.bool,
  rotationSpeed: PropTypes.number,
  floatIntensity: PropTypes.number,
  distortion: PropTypes.number,
  opacity: PropTypes.number,
  reducedMotion: PropTypes.bool
}

export default FloatingGeometry
