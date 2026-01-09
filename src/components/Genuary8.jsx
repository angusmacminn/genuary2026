import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
import { OrbitControls } from "@react-three/drei"

import vertexShader from "../shaders/objects/vertexWindow.glsl"
import fragmentShader from "../shaders/objects/fragmentWindow.glsl"
import vertexSky from "../shaders/objects/vertexSky.glsl"
import fragmentSky from "../shaders/objects/fragmentSky.glsl"

const tempObject = new THREE.Object3D()

export default function Genuary8() {
    const numberOfBoxes = 1000
    const meshRef = useRef(null)

    const instances = useMemo(() => {
        const data = []
        const gridSize = Math.ceil(Math.sqrt(numberOfBoxes))
        const spacing = 1.5

        for (let i = 0; i < numberOfBoxes; i++) {
            // Grid-based distribution with some randomness
            const row = Math.floor(i / gridSize)
            const col = i % gridSize

            const x = (col - gridSize / 2) * spacing + (Math.random() - 0.5) * 0.5
            const y = 0  // Ground level
            const z = (row - gridSize / 2) * spacing + (Math.random() - 0.5) * 0.5

            // Varying box sizes - taller buildings
            const scaleX = THREE.MathUtils.lerp(0.3, 2.0, Math.random())
            const scaleY = THREE.MathUtils.lerp(0.5, 3.0, Math.random()) // Height variation
            const scaleZ = THREE.MathUtils.lerp(0.3, 1.2, Math.random())

            data.push({
                position: new THREE.Vector3(x, scaleY / 2, z), // Offset Y so buildings sit on ground
                scale: new THREE.Vector3(scaleX, scaleY, scaleZ),
                color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.7, 0.6),
            })
        }
        return data
    }, [])

    // Initialize instance matrices and colors
    useEffect(() => {
        if (!meshRef.current) return

        const colorArray = new Float32Array(numberOfBoxes * 3)

        instances.forEach((instance, i) => {
            tempObject.position.copy(instance.position)
            tempObject.rotation.set(0, 0, 0) // No rotation
            tempObject.scale.copy(instance.scale)
            tempObject.updateMatrix()
            meshRef.current.setMatrixAt(i, tempObject.matrix)

            // Set instance colors
            instance.color.toArray(colorArray, i * 3)
        })

        meshRef.current.geometry.setAttribute(
            'color',
            new THREE.InstancedBufferAttribute(colorArray, 3)
        )
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [instances])

    useFrame((state, delta) => {
        if (!meshRef.current) return
        // Animation logic can go here
    })

    return (
        <>
            {/* Sky Sphere */}
            <mesh>
                <sphereGeometry args={[100, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexSky}
                    fragmentShader={fragmentSky}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Nighttime lighting */}
            <ambientLight intensity={0.15} color="#1a1a2e" />
            <directionalLight
                position={[10, 15, -10]}
                intensity={0.3}
                color="#4a5568"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />

            <OrbitControls />

            {/* City buildings */}
            <instancedMesh
                ref={meshRef}
                args={[null, null, numberOfBoxes]}
            >
                <boxGeometry args={[1, 1, 1]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                />
            </instancedMesh>
        </>
    )
}
