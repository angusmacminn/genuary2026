
import { useRef, useMemo, useEffect, useState } from "react"
import { motion } from "motion/react"

export default function Genuary20(){
    
    
    // Mouse tracking state
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [trail, setTrail] = useState([])
    const prevMousePos = useRef({ x: 0, y: 0 })
    const lastUpdateTime = useRef(Date.now())
    const trailIdCounter = useRef(0) // Counter for unique IDs
    
    // Track mouse position and calculate velocity
    useEffect(() => {
        const canvas = document.querySelector('canvas')
        
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            
            // Calculate velocity
            const now = Date.now()
            const deltaTime = (now - lastUpdateTime.current) / 1000 // Convert to seconds
            const dx = x - prevMousePos.current.x
            const dy = y - prevMousePos.current.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const velocity = deltaTime > 0 ? distance / deltaTime : 0
            
            // Normalize velocity (adjust max speed based on your needs)
            const normalizedVelocity = Math.min(velocity / 1000, 1) // Max speed of 1000px/s
            
            // Update mouse position
            setMousePos({ x, y, velocity: normalizedVelocity })
            
            // Add to trail with unique ID
            setTrail(prev => {
                const newTrail = [...prev, { 
                    x, 
                    y, 
                    velocity: normalizedVelocity, 
                    id: trailIdCounter.current++ // Increment and use current value
                }]
                // Keep only last N trail points
                return newTrail.slice(-20)
            })
            
            // Update previous values
            prevMousePos.current = { x, y }
            lastUpdateTime.current = now
        }
        
        canvas.addEventListener('mousemove', handleMouseMove)
        
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])
    
 

    return (
        <>
            
            
            {/* Mouse trail using motion */}
            <div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1000 }}>
                {trail.map((point, index) => {
                    // Use velocity to affect size, opacity, and color
                    const size = 50 + point.velocity * 30 // Larger when moving fast
                    const opacity = 0.3 + point.velocity * 0.7 // More opaque when moving fast
                    const hue = point.velocity * 360 // Color changes with speed
                    const blur = point.velocity * 2 // Blur changes with speed
                    
                    return (
                        <motion.div
                            key={point.id}
                            style={{
                                position: 'absolute',
                                left: point.x,
                                top: point.y,
                                width: size,
                                height: size,
                                borderRadius: '50%',
                                background: `hsla(${hue}, 70%, 50%, ${opacity})`,
                                transform: 'translate(-50%, -50%)',
                                filter: `blur(${blur}px)`,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                                scale: 1, 
                                opacity: opacity,
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ 
                                duration: 0.3,
                                ease: "easeOut"
                            }}
                        />
                    )
                })}
            </div>
        </>
    )
}