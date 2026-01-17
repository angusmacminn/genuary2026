import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { useRef, useMemo, createContext, useContext } from "react"
import { OrbitControls } from "@react-three/drei"
import { useControls, folder } from "leva"

// Context to pass settings down to nested components
const SettingsContext = createContext()

function AnimatedSphere({ index, total, timeOffset = 0 }) {
    const meshRef = useRef()
    const { sphereColors, sphereMetalness, sphereRoughness } = useContext(SettingsContext)
    const baseAngle = (index / total) * Math.PI * 2
    const radius = 1.8
    
    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.elapsedTime + timeOffset
        
        const angle = baseAngle + t * 0.8
        meshRef.current.position.x = Math.cos(angle) * radius
        meshRef.current.position.y = Math.sin(angle) * radius
        meshRef.current.position.z = Math.sin(t * 2 + index) * 3.5
        
        const scale = 1 + Math.sin(t * 3 + index * Math.PI * 0.5) * 0.2
        meshRef.current.scale.setScalar(scale)
    })
    
    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial 
                color={sphereColors[index]} 
                metalness={sphereMetalness}
                roughness={sphereRoughness}
            />
        </mesh>
    )
}

function AnimatedBox({ index, total, timeOffset = 0 }) {
    const meshRef = useRef()
    const { boxColors, boxMetalness, boxRoughness } = useContext(SettingsContext)
    const baseAngle = (index / total) * Math.PI * 2 + Math.PI / total
    const radius = 1.2
    
    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.elapsedTime + timeOffset
        
        const angle = baseAngle - t * 0.6
        meshRef.current.position.x = Math.cos(angle) * radius
        meshRef.current.position.y = Math.sin(angle) * radius
        meshRef.current.position.z = Math.cos(t * 2.5 + index) * 0.3
        
        meshRef.current.rotation.x = t * 1.5
        meshRef.current.rotation.y = t * 2
        meshRef.current.rotation.z = t * 0.5
        
        const scale = 2.8 + Math.sin(t * 4 + index * Math.PI * 0.5) * 0.15
        meshRef.current.scale.setScalar(scale)
    })
    
    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial 
                color={boxColors[index]} 
                metalness={boxMetalness}
                roughness={boxRoughness}
            />
        </mesh>
    )
}

function ShapeCluster({ timeOffset = 0 }) {
    return (
        <group>
            {[0, 1, 2, 3].map((i) => (
                <AnimatedSphere 
                    key={`sphere-${i}`} 
                    index={i} 
                    total={4}
                    timeOffset={timeOffset}
                />
            ))}
            {[0, 1, 2, 3].map((i) => (
                <AnimatedBox 
                    key={`box-${i}`} 
                    index={i} 
                    total={4}
                    timeOffset={timeOffset}
                />
            ))}
        </group>
    )
}

function KaleidoscopeSegment({ rotation, scaleX = 1, scaleY = 1, offset = [0, 0, 0] }) {
    return (
        <group 
            rotation={[0, 0, rotation]}
            scale={[scaleX, scaleY, 1]}
            position={offset}
        >
            <ShapeCluster />
        </group>
    )
}

export default function Genuary17() {
    const kaleidoscopeRef = useRef()
    
    // Leva controls
    const {
        backgroundColor,
        sphereColor1, sphereColor2, sphereColor3, sphereColor4,
        boxColor1, boxColor2, boxColor3, boxColor4,
        sphereMetalness, sphereRoughness,
        boxMetalness, boxRoughness,
        ambientIntensity,
        frontLightIntensity, frontLightColor,
        backLightIntensity, backLightColor,
        rotationSpeed
    } = useControls({
        'Background': folder({
            backgroundColor: { value: '#0a0a15' }
        }),
        'Sphere Colors': folder({
            sphereColor1: { value: '#ff6b6b' },
            sphereColor2: { value: '#4ecdc4' },
            sphereColor3: { value: '#ffe66d' },
            sphereColor4: { value: '#a855f7' }
        }),
        'Box Colors': folder({
            boxColor1: { value: '#f472b6' },
            boxColor2: { value: '#38bdf8' },
            boxColor3: { value: '#a3e635' },
            boxColor4: { value: '#fb923c' }
        }),
        'Materials': folder({
            sphereMetalness: { value: 0.4, min: 0, max: 1, step: 0.05 },
            sphereRoughness: { value: 0.1, min: 0, max: 1, step: 0.05 },
            boxMetalness: { value: 0.6, min: 0, max: 1, step: 0.05 },
            boxRoughness: { value: 0.1, min: 0, max: 1, step: 0.05 }
        }),
        'Lighting': folder({
            ambientIntensity: { value: 0.3, min: 0, max: 2, step: 0.1 },
            frontLightIntensity: { value: 1.5, min: 0, max: 5, step: 0.1 },
            frontLightColor: { value: '#ffffff' },
            backLightIntensity: { value: 0.5, min: 0, max: 5, step: 0.1 },
            backLightColor: { value: '#4ecdc4' }
        }),
        'Animation': folder({
            rotationSpeed: { value: 0.1, min: 0, max: 1, step: 0.01 }
        })
    })
    
    // Build settings object for context
    const settings = useMemo(() => ({
        sphereColors: [sphereColor1, sphereColor2, sphereColor3, sphereColor4],
        boxColors: [boxColor1, boxColor2, boxColor3, boxColor4],
        sphereMetalness,
        sphereRoughness,
        boxMetalness,
        boxRoughness
    }), [
        sphereColor1, sphereColor2, sphereColor3, sphereColor4,
        boxColor1, boxColor2, boxColor3, boxColor4,
        sphereMetalness, sphereRoughness, boxMetalness, boxRoughness
    ])
    
    // Create 8-fold kaleidoscope symmetry
    const segments = useMemo(() => {
        const segs = []
        const folds = 8
        
        for (let i = 0; i < folds; i++) {
            const rotation = (i / folds) * Math.PI * 2
            const scaleX = i % 2 === 0 ? 1 : -1
            segs.push({ rotation, scaleX, scaleY: 1 })
        }
        
        return segs
    }, [])
    
    // Slowly rotate entire kaleidoscope
    useFrame((state) => {
        if (!kaleidoscopeRef.current) return
        kaleidoscopeRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed
    })
    
    return (
        <SettingsContext.Provider value={settings}>
            <color attach="background" args={[backgroundColor]} />
            
            <ambientLight intensity={ambientIntensity} />
            <pointLight position={[0, 0, 10]} intensity={frontLightIntensity} color={frontLightColor} />
            <pointLight position={[0, 0, -10]} intensity={backLightIntensity} color={backLightColor} />
            
            <group ref={kaleidoscopeRef}>
                {segments.map((seg, i) => (
                    <KaleidoscopeSegment
                        key={i}
                        rotation={seg.rotation}
                        scaleX={seg.scaleX}
                        scaleY={seg.scaleY}
                    />
                ))}
            </group>
            
            <OrbitControls enableDamping dampingFactor={0.05} />
        </SettingsContext.Provider>
    )
}
