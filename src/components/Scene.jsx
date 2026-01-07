import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

export default function Scene() {
  const modelRef = useRef()
  const { scene } = useGLTF('/models/model.gltf')
  
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[-2, 2, 1]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* GLTF Model */}
      <primitive 
        object={scene} 
        ref={modelRef}
        scale={0.5}
        position={[0, 0, 0]}
        castShadow 
        receiveShadow
      />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

// Preload the model
useGLTF.preload('/models/model.gltf')
