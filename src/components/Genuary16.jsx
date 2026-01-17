import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useState, useEffect } from "react"
import { OrbitControls } from "@react-three/drei"
import { useControls, folder } from "leva"

import vertexShader from "../shaders/objects/vertexFlowField.glsl"
import fragmentShader from "../shaders/objects/fragmentFlowField.glsl"

export default function Genuary16() {
    const pointsRef = useRef()
    const interactionPlaneRef = useRef()
    const { camera, gl, size: canvasSize } = useThree()
    
    // Mouse state
    const [isClicking, setIsClicking] = useState(false)
    const mousePos = useRef(new THREE.Vector3(0, 0, 0))
    const mouseInfluence = useRef(0)
    const mouseNDC = useRef(new THREE.Vector2())
    
    // Raycaster
    const raycaster = useMemo(() => new THREE.Raycaster(), [])

    // Leva controls for customization
    const { 
        particleCount, 
        size, 
        speed, 
        noiseScale, 
        noiseStrength,
        curlAmount,
        colorA,
        colorB,
        glow,
        spread,
        distribution,
        attractionStrength,
        swirlStrength,
        speedBoost,
        transitionSpeed
    } = useControls({
        'Particles': folder({
            particleCount: { value: 25000, min: 1000, max: 100000, step: 1000 },
            size: { value: 1.0, min: 1, max: 30, step: 0.5 },
            spread: { value: 10, min: 1, max: 20, step: 0.5 },
            distribution: { value: 'sphere', options: ['sphere', 'cube', 'disc'] }
        }),
        'Flow Field': folder({
            speed: { value: 0.3, min: 0.01, max: 2, step: 0.01 },
            noiseScale: { value: 0.15, min: 0.01, max: 1, step: 0.01 },
            noiseStrength: { value: 1.2, min: 0, max: 3, step: 0.1 },
            curlAmount: { value: 2.0, min: 0, max: 5, step: 0.1 }
        }),
        'Mouse Interaction': folder({
            attractionStrength: { value: 3.0, min: 0.5, max: 5, step: 0.1 },
            swirlStrength: { value: 3.5, min: 0, max: 4, step: 0.1 },
            speedBoost: { value: 2.5, min: 1, max: 5, step: 0.1 },
            transitionSpeed: { value: 3.0, min: 0.5, max: 10, step: 0.5 }
        }),
        'Appearance': folder({
            colorA: { value: '#19ff4a' },
            colorB: { value: '#2ec8ff' },
            glow: { value: 0.3, min: 0, max: 2, step: 0.1 }
        })
    })

    // Update cursor style based on click state
    useEffect(() => {
        const canvas = gl.domElement
        canvas.style.cursor = isClicking ? 'grabbing' : 'crosshair'
    }, [isClicking, gl])

    // Mouse event handlers using useEffect for proper cleanup
    useEffect(() => {
        const canvas = gl.domElement
        
        // Set initial cursor
        canvas.style.cursor = 'crosshair'
        
        const updateMouseNDC = (event) => {
            const rect = canvas.getBoundingClientRect()
            mouseNDC.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
            mouseNDC.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        }
        
        const handlePointerDown = (event) => {
            // Only respond to left mouse button (button 0)
            if (event.button === 0) {
                setIsClicking(true)
                updateMouseNDC(event)
            }
        }
        
        const handlePointerUp = (event) => {
            if (event.button === 0) {
                setIsClicking(false)
            }
        }
        
        const handlePointerLeave = () => {
            setIsClicking(false)
        }
        
        const handlePointerMove = (event) => {
            // Always update mouse position for smooth tracking
            updateMouseNDC(event)
        }
        
        canvas.addEventListener('pointerdown', handlePointerDown)
        canvas.addEventListener('pointerup', handlePointerUp)
        canvas.addEventListener('pointerleave', handlePointerLeave)
        canvas.addEventListener('pointermove', handlePointerMove)
        
        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown)
            canvas.removeEventListener('pointerup', handlePointerUp)
            canvas.removeEventListener('pointerleave', handlePointerLeave)
            canvas.removeEventListener('pointermove', handlePointerMove)
            canvas.style.cursor = 'default'
        }
    }, [gl])

    // Generate particle attributes
    const { positions, scales, velocities, lives } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const scales = new Float32Array(particleCount)
        const velocities = new Float32Array(particleCount * 3)
        const lives = new Float32Array(particleCount)

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3
            
            if (distribution === 'sphere') {
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos(2 * Math.random() - 1)
                const r = spread * Math.cbrt(Math.random())
                
                positions[i3] = r * Math.sin(phi) * Math.cos(theta)
                positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
                positions[i3 + 2] = r * Math.cos(phi)
            } else if (distribution === 'cube') {
                positions[i3] = (Math.random() - 0.5) * spread * 2
                positions[i3 + 1] = (Math.random() - 0.5) * spread * 2
                positions[i3 + 2] = (Math.random() - 0.5) * spread * 2
            } else if (distribution === 'disc') {
                const angle = Math.random() * Math.PI * 2
                const r = spread * Math.sqrt(Math.random())
                positions[i3] = r * Math.cos(angle)
                positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.2
                positions[i3 + 2] = r * Math.sin(angle)
            }

            scales[i] = 0.5 + Math.random() * 0.8
            velocities[i3] = (Math.random() - 0.5) * 0.5
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.5
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.5
            lives[i] = Math.random()
        }

        return { positions, scales, velocities, lives }
    }, [particleCount, spread, distribution])

    // Uniforms
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSize: { value: size },
        uSpeed: { value: speed },
        uNoiseScale: { value: noiseScale },
        uNoiseStrength: { value: noiseStrength },
        uCurlAmount: { value: curlAmount },
        uColorA: { value: new THREE.Color(colorA) },
        uColorB: { value: new THREE.Color(colorB) },
        uGlow: { value: glow },
        uMousePos: { value: new THREE.Vector3(0, 0, 0) },
        uMouseInfluence: { value: 0 },
        uAttractionStrength: { value: attractionStrength },
        uSwirlStrength: { value: swirlStrength },
        uSpeedBoost: { value: speedBoost }
    }), [])

    // Update uniforms each frame
    useFrame((state, delta) => {
        if (!pointsRef.current || !interactionPlaneRef.current) return

        const material = pointsRef.current.material
        
        // Make the interaction plane face the camera
        interactionPlaneRef.current.quaternion.copy(camera.quaternion)
        
        // Raycast to the interaction plane to get mouse position in 3D
        raycaster.setFromCamera(mouseNDC.current, camera)
        const intersects = raycaster.intersectObject(interactionPlaneRef.current)
        
        if (intersects.length > 0) {
            mousePos.current.copy(intersects[0].point)
        }
        
        // Smooth transition for mouse influence
        const targetInfluence = isClicking ? 1.0 : 0.0
        mouseInfluence.current = THREE.MathUtils.lerp(
            mouseInfluence.current,
            targetInfluence,
            delta * transitionSpeed
        )
        
        // Update all uniforms
        material.uniforms.uTime.value = state.clock.elapsedTime
        material.uniforms.uSize.value = size
        material.uniforms.uSpeed.value = speed
        material.uniforms.uNoiseScale.value = noiseScale
        material.uniforms.uNoiseStrength.value = noiseStrength
        material.uniforms.uCurlAmount.value = curlAmount
        material.uniforms.uColorA.value.set(colorA)
        material.uniforms.uColorB.value.set(colorB)
        material.uniforms.uGlow.value = glow
        material.uniforms.uMousePos.value.copy(mousePos.current)
        material.uniforms.uMouseInfluence.value = mouseInfluence.current
        material.uniforms.uAttractionStrength.value = attractionStrength
        material.uniforms.uSwirlStrength.value = swirlStrength
        material.uniforms.uSpeedBoost.value = speedBoost
    })

    return (
        <>
            <color attach="background" args={['#0a0a12']} />
            
            {/* Invisible plane for mouse raycasting - always faces camera */}
            <mesh ref={interactionPlaneRef} visible={false}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial />
            </mesh>
            
            <points ref={pointsRef} frustumCulled={false}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleCount}
                        array={positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-aScale"
                        count={particleCount}
                        array={scales}
                        itemSize={1}
                    />
                    <bufferAttribute
                        attach="attributes-aVelocity"
                        count={particleCount}
                        array={velocities}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-aLife"
                        count={particleCount}
                        array={lives}
                        itemSize={1}
                    />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* OrbitControls with right-click for rotation, middle for pan */}
            <OrbitControls 
                enableDamping 
                dampingFactor={0.05}
                minDistance={3}
                maxDistance={30}
                mouseButtons={{
                    LEFT: null,  // Disable left-click for orbit (we use it for particles)
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: THREE.MOUSE.ROTATE
                }}
                touches={{
                    ONE: null,  // Disable one-finger touch for orbit
                    TWO: THREE.TOUCH.DOLLY_ROTATE
                }}
            />
        </>
    )
}
