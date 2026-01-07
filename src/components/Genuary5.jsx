import { motion } from "motion/react"
import { useEffect, useState } from "react"



export default function Genuary5(){

    const [paintedCell, setPaintedCell] = useState(new Set())
    const [isDrawing, setIsDrawing] = useState()

    const gridSpacing = 4
    const gridCells = []

    for (let y = 0; y < 150; y += gridSpacing) {
        for (let x = 0; x < 150; x += gridSpacing) {
            gridCells.push({ x, y });
        }
    }

    // for clicking on a cell
    const paintCell = (index) => {
        setPaintedCell(prev => {
            const next = new Set(prev)
            next.add(index)
            return next
        })
    }
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
                        fill={paintedCell.has(i) ? "#283eab" : "#edf5ff"}                        
                        stroke="#9fc6ff" //cell border
                        strokeWidth="0.3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1.0 }}
                        whileHover={{ fill: "#c3deff", }} //cell hover fill
                        transition={{ type: "easeInOut", stiffness: 300 }}
                        onMouseDown={() => handleMouseDown(i)}
                        onMouseEnter={() => handleMouseEnter(i)}                    />
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