import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useState, useEffect } from "react"
import { OrbitControls } from "@react-three/drei"

// MediaRecorder instance stored outside component
let mediaRecorder = null
let recordedChunks = []

// Export function to stop recording from outside
export function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
        return true
    }
    return false
}

export default function Genuary6({ isRecording, onRecordingStart }){

    const { scene, gl } = useThree()


    const numberOfRectangles = 1000;
    const size = 1.5;
    const radius = 5;
    const cubeSize = 4; // Size of the target cube formation

    const floatingColor = useMemo(() => new THREE.Color("#ff6b6b"), [])
    const cubeColor = useMemo(() => new THREE.Color("#3a171f"), [])  // Teal when cubed

    // Pre-define background colors
    const lightBg = useMemo(() => new THREE.Color("#eee9e9"), [])  // or your current bg
    const darkBg = useMemo(() => new THREE.Color("#050508"), [])   // near-black

    // Pre-define emissive colors
    const emissiveOff = useMemo(() => new THREE.Color(0x000000), [])
    const emissiveOn = useMemo(() => new THREE.Color("#ff6b6b"), [])  // Match your cube color for glow

    const [isClicked, setIsClicked] = useState(false)

    const meshRef = useRef(null)
    const transitionRef = useRef(0) // 0 = floating, 1 = cube
    const materialRef = useRef(null)  
    const ambientRef = useRef(null)
    const directionalRef = useRef(null)

    // Initialize MediaRecorder when recording starts
    useEffect(() => {
        if (isRecording && gl.domElement) {
            recordedChunks = []
            
            // Capture stream from canvas at 30fps
            const stream = gl.domElement.captureStream(30)
            
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 8000000, // 8 Mbps for good quality
            })

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `genuary6-${Date.now()}.webm`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                recordedChunks = []
            }

            mediaRecorder.start(100) // Collect data every 100ms
            onRecordingStart?.()
        }
    }, [isRecording, gl])



    // Reusable dummy object for setting instance matrices
    const dummy = useMemo(() => new THREE.Object3D(), [])

    const instances = useMemo(() => {
        const data = []

        // grid dimensions for cube formation
        const perSide = Math.ceil(Math.cbrt(numberOfRectangles))
        const spacing = cubeSize / perSide


        for (let i = 0; i < numberOfRectangles; i++) {
             // Original sphere distribution
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = radius * Math.cbrt(Math.random())  // cbrt for uniform volume distribution

            const p = new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi))

            // Calculate cube grid position
            const xi = i % perSide
            const yi = Math.floor(i / perSide) % perSide
            const zi = Math.floor(i / (perSide * perSide))

            const cubePos = new THREE.Vector3(
                (xi - perSide / 2 + 0.5) * spacing,
                (yi - perSide / 2 + 0.5) * spacing,
                (zi - perSide / 2 + 0.5) * spacing
            )

            // push position, scale, speed, offset into data array
            data.push({
                position: p,
                cubePosition: cubePos,
                scale: THREE.MathUtils.lerp(0.08, 0.25, Math.random()),
                speed: THREE.MathUtils.lerp(0.3, 2.2, Math.random()),
                offset: Math.random() * Math.PI * 2,
            })
        }
        return data
    },[])

    useFrame((state, delta)=> {
        if(!meshRef.current) return

        // Smooth transition
        const targetTransition = isClicked ? 1 : 0
        transitionRef.current = THREE.MathUtils.lerp(
            transitionRef.current, 
            targetTransition, 
            delta * 7 // Adjust speed of transition
        )

        const t_blend = transitionRef.current

        // Animate material color
        if(materialRef.current) {
            materialRef.current.color.lerpColors(floatingColor, cubeColor, t_blend)
            
            // You can also animate other material properties:
            materialRef.current.metalness = THREE.MathUtils.lerp(0, 0.9, t_blend)
            materialRef.current.roughness = THREE.MathUtils.lerp(0.7, 0.005, t_blend)
            materialRef.current.emissive.lerpColors(new THREE.Color(0x000000), new THREE.Color(0x222222), t_blend)
        }

        // Animate background
        scene.background = scene.background || new THREE.Color()
        scene.background.lerpColors(lightBg, darkBg, t_blend)

        // Dim the lights
        if(ambientRef.current) {
            ambientRef.current.intensity = THREE.MathUtils.lerp(0.9, 0.05, t_blend)
        }
        if(directionalRef.current) {
            directionalRef.current.intensity = THREE.MathUtils.lerp(1, 0.05, t_blend)
        }

        // Material: make cubes glow in the dark via emissive
        if(materialRef.current) {
            materialRef.current.color.lerpColors(floatingColor, cubeColor, t_blend)
            materialRef.current.emissive.lerpColors(emissiveOff, emissiveOn, t_blend)
            materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(0, 0.05, t_blend)
            // Keep metalness/roughness if you want
            materialRef.current.metalness = THREE.MathUtils.lerp(0, 0.2, t_blend)
            materialRef.current.roughness = THREE.MathUtils.lerp(0.7, 0.3, t_blend)
        }
        
        const time = state.clock.elapsedTime
        instances.forEach((inst, i) => {
            // Animated floating position
            const t = time + inst.offset
            const floatingPos = new THREE.Vector3(
                inst.position.x + Math.sin(t * 1.3) * 0.1 + Math.sin(t * 3.7) * 0.25,
                inst.position.y + Math.cos(t * 1.7) * 0.15 + Math.sin(t * 2.3) * 0.38,
                inst.position.z + Math.sin(t * 0.9) * 0.1 + Math.cos(t * 4.1) * 0.03
            )

            // Lerp between floating and cube position
            dummy.position.lerpVectors(floatingPos, inst.cubePosition, t_blend)

            // Optionally scale down slightly when in cube form for tighter grid
            const cubeScale = inst.scale * 0.5
            dummy.scale.setScalar(THREE.MathUtils.lerp(inst.scale, cubeScale, t_blend))

            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })
        
        meshRef.current.instanceMatrix.needsUpdate = true
    })



    return(
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
         {/* args prop passes constructor arguments to the three.js class
             geometry and material are null because they're attached as children */}
             <instancedMesh 
                ref={meshRef} 
                args={[null, null, numberOfRectangles]}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    setIsClicked(!isClicked)
                }}
            >
                 <boxGeometry args={[2, 2, 2]} />
                 <meshStandardMaterial ref={materialRef} color="#ff6b6b" />
             </instancedMesh>
         <OrbitControls
            enableDamping
            dampingFactor={0.05}
            // Touch settings for mobile
            touches={{
                ONE: 1, // TOUCH.ROTATE
                TWO: 2, // TOUCH.DOLLY_PAN
            }}
            enablePan={true}
            enableZoom={true}
            minDistance={3}
            maxDistance={20}
         />
        </>
    )
}