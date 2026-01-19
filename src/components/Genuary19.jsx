import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"

import vertexShader from "../shaders/objects/vertexGenuary19.glsl"
import fragmentShader from "../shaders/objects/fragmentGenuary19.glsl"

export default function Genuary19() {
    const meshRef = useRef()
    const { viewport, gl } = useThree()
    const mouseUv = useRef(new THREE.Vector2(-1, -1))
    const smoothMouseUv = useRef(new THREE.Vector2(-1, -1))

    // Add padding (as a percentage of viewport)
    const padding = 0.1 // 10% padding on each side
    const size = Math.min(viewport.width, viewport.height) * (1 - padding * 2)

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size, size) },
        uMouse: { value: new THREE.Vector2(-1, -1) }
    }), [])

    // Track mouse position
    useEffect(() => {
        const canvas = gl.domElement
        
        const handleMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect()
            const mouseX = event.clientX - rect.left - rect.width / 2
            const mouseY = -(event.clientY - rect.top - rect.height / 2)
            // Account for padding in mouse calculation
            const paddedHalfSize = Math.min(rect.width, rect.height) * (1 - 0.1 * 2) / 2
            const uvX = (mouseX / paddedHalfSize) * 0.5 + 0.5
            const uvY = (mouseY / paddedHalfSize) * 0.5 + 0.5
            
            mouseUv.current.set(uvX, uvY)
        }
        
        const handleMouseLeave = () => {
            mouseUv.current.set(-1, -1)
        }
        
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mouseleave', handleMouseLeave)
        
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [gl])

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Smooth interpolation of mouse position
            const lerpSpeed = 2.0
            smoothMouseUv.current.lerp(mouseUv.current, Math.min(delta * lerpSpeed, 1))
            
            meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
            meshRef.current.material.uniforms.uResolution.value.set(size, size)
            meshRef.current.material.uniforms.uMouse.value.copy(smoothMouseUv.current)
        }
    })

    return (
        <>
            <color attach="background" args={['#111']} />
            <mesh ref={meshRef}>
                <planeGeometry args={[size, size]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                />
            </mesh>
        </>
    )
}
