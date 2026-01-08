import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import { OrbitControls } from "@react-three/drei"

import vertexShader from "../shaders/objects/vertex.glsl"
import fragmentShader from "../shaders/objects/fragment.glsl"

export default function Genuary7() {
    const meshRef = useRef()
    const materialRef = useRef()

    // Define uniforms for the shader
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }), [])

    // Update time uniform each frame
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
        }
    })

    return (
        <>
            <ambientLight intensity={0.2} />
            <directionalLight position={[2, 2, 2]} intensity={1} />

            <mesh ref={meshRef}>
                <torusKnotGeometry args={[10, 3, 200, 32, 4, 6]} />
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <OrbitControls enableDamping dampingFactor={0.05} />
        </>
    )
}

