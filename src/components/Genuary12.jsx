import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
import { OrbitControls } from "@react-three/drei"



export default function Genuary12(){

    // ============ CONFIGURATION ============
    const numberOfBoxes = 2000;
    const boxSize = 0.8;
    const instanceSize = 4.5;

    // colour options
    const colorOptions = [
        "#ff6b35",
        "#4a0080",
        "#ffffff",
        "#000000",
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffa500",
        "#00ffff",
        "#ff00ff",
        "#ffff00",
        "#800080",
        "#008000",
        "#008080",
        "#800000",
    ]
    
    // Color configuration
    const gradientColorA = "#ff0000"  // Orange
    const gradientColorB = "#00ff00"  // Purple   ) 
    const highlightColorHex = "#0000ff" // Hover highlight color
    const highlightIntensity = 0.7      // How much highlight blends (0-1)
    const gradientAxis = "radial"            // "x", "y", "z", or "radial"
    
    // Interaction configuration
    const interactionRadius = 2.8       // How far the mouse influence reaches
    const pushStrength = 5            // How much boxes get pushed away
    const lerpSpeed = 4                 // Animation smoothness (higher = faster)
    // =======================================

    const meshRef = useRef(null)
    const materialRef = useRef(null)  
    const mousePoint = useRef(new THREE.Vector3())  // Store 3D mouse position
    
    // Persistent state for smooth animations (offsets and highlights for each instance)
    const offsets = useRef(null)
    const highlights = useRef(null)
    
    // For mouse tracking - plane facing camera through origin
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
    const raycaster = useMemo(() => new THREE.Raycaster(), [])

    const dummy = useMemo(() => new THREE.Object3D(), [])

    const instances = useMemo(() => {
        const data = []

        for (let i = 0; i < numberOfBoxes; i++) {

            // Original sphere distribution
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = instanceSize * Math.cbrt(Math.random())  // cbrt for uniform volume distribution

            const p = new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi))

            // push position, scale, speed, offset into data array
            data.push({
                position: p,
                cubePosition: p,
                scaleX: THREE.MathUtils.lerp(0.08, 0.25, Math.random()),
                scaleY: THREE.MathUtils.lerp(0.08, 0.5, Math.random()),  // different range for height
                scaleZ: THREE.MathUtils.lerp(0.08, 0.25, Math.random()),
                speed: THREE.MathUtils.lerp(0.3, 2.2, Math.random()),
                offset: Math.random() * Math.PI * 2,
            })   
        }
        return data
    }, [])

    // Create reusable Color objects from configuration
    const color = useMemo(() => new THREE.Color(), [])
    const highlightColor = useMemo(() => new THREE.Color(highlightColorHex), [highlightColorHex])
    const colorA = useMemo(() => new THREE.Color(gradientColorA), [gradientColorA])
    const colorB = useMemo(() => new THREE.Color(gradientColorB), [gradientColorB])

    // Add useEffect to initialize instanceColor and animation state
    useEffect(() => {
        if (!meshRef.current) return
        
        const colors = new Float32Array(numberOfBoxes * 3)
        
        // Initialize persistent animation state
        offsets.current = instances.map(() => new THREE.Vector3(0, 0, 0))
        highlights.current = new Float32Array(numberOfBoxes).fill(0)
        
        // Initialize gradient colors
        const tempColor = new THREE.Color()
        
        instances.forEach((inst, i) => {
            // Calculate gradient based on axis
            let t
            if (gradientAxis === "x") {
                t = (inst.position.x + instanceSize) / (2 * instanceSize)
            } else if (gradientAxis === "y") {
                t = (inst.position.y + instanceSize) / (2 * instanceSize)
            } else if (gradientAxis === "z") {
                t = (inst.position.z + instanceSize) / (2 * instanceSize)
            } else if (gradientAxis === "radial") {
                t = inst.position.length() / instanceSize
            } else {
                t = (inst.position.y + instanceSize) / (2 * instanceSize)
            }
            
            tempColor.copy(colorA).lerp(colorB, t)
            
            colors[i * 3] = tempColor.r
            colors[i * 3 + 1] = tempColor.g
            colors[i * 3 + 2] = tempColor.b
        })
        
        meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)
    }, [instances, instanceSize, colorA, colorB, gradientAxis])

    useFrame((state, delta)=> {
        if(!meshRef.current || !meshRef.current.instanceColor || !offsets.current) return

        const time = state.clock.elapsedTime
        const colors = meshRef.current.instanceColor.array
        
        // Update plane to face camera (normal = camera direction)
        const cameraDirection = new THREE.Vector3()
        state.camera.getWorldDirection(cameraDirection)
        plane.normal.copy(cameraDirection)
        plane.constant = 0  // Plane passes through origin
        
        // Raycast from mouse to plane
        raycaster.setFromCamera(state.pointer, state.camera)
        const intersectPoint = new THREE.Vector3()
        const hit = raycaster.ray.intersectPlane(plane, intersectPoint)
        
        if (hit) {
            mousePoint.current.copy(intersectPoint)
        }
        
        const mouse = mousePoint.current
        // Always consider hovering if mouse is over the canvas
        const isHovering = true

        

        instances.forEach((inst, i) => {
            // Animated floating position
            const t = time + inst.offset
            
            // Base animated position (gentle float)
            const baseX = inst.position.x + Math.sin(t * 1.3) * 0.05
            const baseY = inst.position.y + Math.cos(t * 1.7) * 0.05
            const baseZ = inst.position.z + Math.sin(t * 0.9) * 0.05
            
            // Calculate distance from base position to mouse
            const dx = baseX - mouse.x
            const dy = baseY - mouse.y
            const dz = baseZ - mouse.z
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
            
            // Calculate target offset and highlight
            let targetOffsetX = 0
            let targetOffsetY = 0
            let targetOffsetZ = 0
            let targetHighlight = 0
            
            if (isHovering && dist < interactionRadius && dist > 0.01) {
                const influence = 1 - (dist / interactionRadius)
                const smoothInfluence = influence * influence  // Ease out curve
                
                // Target push direction
                const pushAmount = smoothInfluence * pushStrength
                targetOffsetX = (dx / dist) * pushAmount
                targetOffsetY = (dy / dist) * pushAmount
                targetOffsetZ = (dz / dist) * pushAmount
                
                // Target highlight intensity
                targetHighlight = smoothInfluence
                
            }
            
            // Smoothly lerp current offset toward target
            const currentOffset = offsets.current[i]
            const lerpFactor = 1 - Math.exp(-lerpSpeed * delta)
            currentOffset.x += (targetOffsetX - currentOffset.x) * lerpFactor
            currentOffset.y += (targetOffsetY - currentOffset.y) * lerpFactor
            currentOffset.z += (targetOffsetZ - currentOffset.z) * lerpFactor
            
            // Smoothly lerp highlight
            highlights.current[i] += (targetHighlight - highlights.current[i]) * lerpFactor
            const highlight = highlights.current[i]
            
            // Get base color based on gradient axis
            let colorT
            if (gradientAxis === "x") {
                colorT = (inst.position.x + instanceSize) / (2 * instanceSize)
            } else if (gradientAxis === "y") {
                colorT = (inst.position.y + instanceSize) / (2 * instanceSize)
            } else if (gradientAxis === "z") {
                colorT = (inst.position.z + instanceSize) / (2 * instanceSize)
            } else if (gradientAxis === "radial") {
                colorT = inst.position.length() / instanceSize
            } else {
                colorT = (inst.position.y + instanceSize) / (2 * instanceSize)
            }
            
            color.copy(colorA).lerp(colorB, colorT)
            
            // Blend toward highlight color based on smooth highlight value
            if (highlight > 0.001) {
                color.lerp(highlightColor, highlight * highlightIntensity)
            }
            
            // Update colors
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
            
            // Set final position with smooth offset
            dummy.position.set(
                baseX + currentOffset.x,
                baseY + currentOffset.y,
                baseZ + currentOffset.z
            )
            
            // Smooth scale
            const scaleBoost = 1 + highlight * 0.3
            dummy.scale.set(
                inst.scaleX * scaleBoost, 
                inst.scaleY * scaleBoost, 
                inst.scaleZ * scaleBoost
            )
            
            // Update matrix and meshref
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })
        
        meshRef.current.instanceColor.needsUpdate = true
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <>
            <OrbitControls enableDamping dampingFactor={0.05}/>
            <ambientLight intensity={0.9} />
    
             <directionalLight
               position={[-2, 2, 1]}
               intensity={1}
               castShadow
               shadow-mapSize-width={1024}
               shadow-mapSize-height={1024}
             />

             <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, numberOfBoxes]}
             >
                <boxGeometry args={[boxSize, boxSize, boxSize]}/>
                <meshBasicMaterial 
                    ref={materialRef} 
                    color="#ff00ff"
                    />
             </instancedMesh>


        </>
    )
}