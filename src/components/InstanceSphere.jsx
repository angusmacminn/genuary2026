import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import { OrbitControls } from "@react-three/drei"

export default function InstanceSphere() {
    // variables for count and radius
    const count = 1550
    const radius = 5

    // useRef for mesh
    const meshRef = useRef(null)

    // Reusable dummy object for setting instance matrices
    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Pre-generate instance data (positions/scales) once
    const instances = useMemo(() => {
        // empty array to store data in
        const data = []

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = radius * Math.cbrt(Math.random())  // cbrt for uniform volume distribution

            const p = new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi))

            // push position, scale, speed, offset into data array
            data.push({
                position: p,
                scale: THREE.MathUtils.lerp(0.08, 0.25, Math.random()),
                speed: THREE.MathUtils.lerp(0.3, 2.2, Math.random()),
                offset: Math.random() * Math.PI * 2,
            })
        }
        return data
    }, [count, radius]) // dependancy array, only re-runs if these values change

    // useFrame
    useFrame((state)=> {
        if(!meshRef.current) return

        const time = state.clock.elapsedTime

        instances.forEach((inst, i) => {
            // set position
            dummy.position.copy(inst.position)
            // animate on y axis
            dummy.position.y += Math.sin(time * inst.speed + inst.offset) * 0.3
            // Set scale
            dummy.scale.setScalar(inst.scale)

            // Apply the transformation to the instance
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)

            // Tell Three.js the instance matrices have changed
            meshRef.current.instanceMatrix.needsUpdate = true

        })
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
        {/* args prop passes constructor arguments to the three.js class
            geometry and material are null because they're attached as children */}
            <instancedMesh ref={meshRef} args={[null, null, count]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color="#ff6b6b" />
            </instancedMesh>
        <OrbitControls
        enableDamping
        dampingFactor={0.05}
        />
       </>
    )

}