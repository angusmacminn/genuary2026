import { motion } from "motion/react"
import { useEffect, useState, useRef } from "react"



export default function Genuary13(){

    const [paintedCell, setPaintedCell] = useState(new Set())
    const [isDrawing, setIsDrawing] = useState()

    const [cellColors, setCellColors] = useState(new Map())

    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    const gridSpacing = 4
    const gridCells = []

    for (let y = 0; y < 150; y += gridSpacing) {
        for (let x = 0; x < 150; x += gridSpacing) {
            gridCells.push({ x, y });
        }
    }
    // webcam setup
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: 150,   // Match your viewBox for easy sampling
                height: 150,
                facingMode: "user"  // Front camera
            } 
        })
        .then(stream => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        })
        .catch(err => console.error("Webcam error:", err))
        
        // Cleanup on unmount
        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // sample colour from webcam at a given cell position
    const sampleColorAt = (cellX, cellY) => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if(!video || !canvas) return "#ffffff"

        const ctx = canvas.getContext('2d')

        // draw current frame to canvas
        ctx.drawImage(video, 0, 0, 150, 150)

        // Sample pixel at cell center
        const centerX = cellX + gridSpacing / 2
        const centerY = cellY + gridSpacing / 2
        const pixel = ctx.getImageData(centerX, centerY, 1, 1).data

        // Convert to hex color
        const r = pixel[0]
        const g = pixel[1]
        const b = pixel[2]
        return `rgb(${r}, ${g}, ${b})`
    }

    const paintCell = (index) => {
    const cell = gridCells[index]
    
    // Sample color from webcam at this cell's position
    const color = sampleColorAt(cell.x, cell.y)
    
    setPaintedCell(prev => {
        const next = new Set(prev)
        next.add(index)
        return next
    })
    
    // Store the sampled color
    setCellColors(prev => {
        const next = new Map(prev)
        next.set(index, color)
        return next
    })
    }

    // // for clicking on a cell
    // const paintCell = (index) => {
    //     setPaintedCell(prev => {
    //         const next = new Set(prev)
    //         next.add(index)
    //         return next
    //     })
    // }
    //stop drawing when mouse is released
    useEffect(()=> {
        const handleMouseUp = () => setIsDrawing(false)
        window.addEventListener('mouseup', handleMouseUp)
        return () => window.removeEventListener('mouseup', handleMouseUp)
    },[])

    const handleMouseDown = (index) => {
        setIsDrawing(true)
        paintCell(index)
    }
    const handleMouseEnter = (index) => {
        if (isDrawing) {
            paintCell(index)
        }
    }

    return(
        <div style={styles.container}>
        {/* Hidden canvas for pixel sampling */}
        <canvas 
            ref={canvasRef} 
            width={150} 
            height={150} 
            style={{ display: 'none' }}
        />
        
        {/* Webcam video as background reference */}
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={styles.webcam}
        />
        
        {/* Grid overlay */}
        <svg
            viewBox="0 0 150 150"
            className="grid-container"
            preserveAspectRatio="none"
            style={styles.svgGrid}
        >
            {gridCells.map((cell, i) => (
                <motion.rect 
                    key={i}
                    x={cell.x}
                    y={cell.y}
                    width={gridSpacing}
                    height={gridSpacing}
                    // Use sampled color if painted, otherwise transparent-ish
                    fill={paintedCell.has(i) ? cellColors.get(i) : "rgba(255,255,255,0.3)"}                        
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="0.3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1.0 }}
                    whileHover={{ fill: "rgba(255,255,255,0.5)" }}
                    transition={{ type: "easeInOut", stiffness: 300 }}
                    onMouseDown={() => handleMouseDown(i)}
                    onMouseEnter={() => handleMouseEnter(i)}
                />
            ))}
        </svg>
    </div>
    )
}

const styles = {
    container: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
    },
    svgGrid: {
        width: '100%',
        height: '100%',
    }

}