import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo } from "react"

import vertexShader from "../shaders/objects/vertexGenuary9.glsl"
import fragmentShader from "../shaders/objects/fragmentGenuary9.glsl"

export default function Genuary9() {
    const meshRef = useRef()
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
    })

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    )
}
