import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import { Text, PerspectiveCamera } from '@react-three/drei'
import { OrbitControls } from "@react-three/drei"
import vertexShader from "../shaders/objects/vertexGenuary11.glsl"
import fragmentShader from "../shaders/objects/fragmentGenuary11.glsl"
import sourceCode from "./Genuary11.jsx?raw"
import vertexSource from "../shaders/objects/vertexGenuary11.glsl?raw"
import fragmentSource from "../shaders/objects/fragmentGenuary11.glsl?raw"

const allSource = `// === Genuary11.jsx ===
${sourceCode}

// === vertexGenuary11.glsl ===
${vertexSource}

// === fragmentGenuary11.glsl ===
${fragmentSource}`

export default function Genuary11() {
    const meshRef = useRef()
    const groupRef = useRef()
    const textRef = useRef()
    const { viewport } = useThree()

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) }
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
            meshRef.current.material.uniforms.uResolution.value.set(viewport.width, viewport.height)
        }
        if (groupRef.current) {
            // rotation
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3
        }
        if (textRef.current) {
            // floating motion
            textRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
        }
    })

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <OrbitControls />
            {/* Shader background */}
            <mesh ref={meshRef} position={[0, 0, -5]}>
                <planeGeometry args={[20, 20]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    depthWrite={false}
                />
            </mesh>

            {/* Source code text overlay*/}
            <group ref={groupRef} position={[0, 0, 0]}>
                <Text
                    ref={textRef}
                    font="/fonts/GeistMono-Regular.ttf"
                    fontSize={0.06}
                    maxWidth={5}
                    lineHeight={1.2}
                    letterSpacing={0.02}
                    textAlign="left"
                    anchorX="center"
                    anchorY="middle"
                    color="#00ff88"
                    outlineWidth={0.002}
                    outlineColor="#003322"
                >
                    {allSource}
                </Text>
            </group>
        </>
    )
}
