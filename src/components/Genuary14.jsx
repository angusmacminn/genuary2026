// import { distance } from "motion"
import { motion } from "motion/react"
import { useEffect, useState, useRef } from "react"



export default function Genuary14(){
    // Calculate grid and column weights
    const cols = 20
    const rows = 10
    const [colWeights, setColWeights] = useState(Array(cols).fill(1));
    const [rowWeights, setRowWeights] = useState(Array(rows).fill(1));

    // Calculate distance from cursor to each cell center
    const getDistance = (cursorX, cursorY, cellCenterX, cellCenterY) => {
        return Math.sqrt(
            Math.pow(cursorX - cellCenterX, 2) + 
            Math.pow(cursorY - cellCenterY, 2)
        )
    }

    // Convert distance to weight, Closer = larger weight = bigger rectangle
    const distanceToWeight = (distance, maxDistance) => {

        const normalized = distance / maxDistance

        // Linear falloff
        // const weight = 1 - normalized;

        // Quadratic falloff (more dramatic near cursor)
        // const weight = Math.pow(1 - normalized, 2);

        // Exponential falloff (very dramatic)
        const weight = Math.exp(-distance * 0.01);

        // add a base weight so distant cells don't dissapear
        return Math.max(weight, 0.2) // minimum 20% of normal size
    }


    const totalCells = cols * rows; // 25 cells for a 5x5 grid

    // Simple approach: create cells with initial weights
    const [cells, setCells] = useState(
      Array(totalCells).fill(null).map((_, i) => ({
        id: i,
        weight: 1, // all start equal
        color: `hsl(${(i * 360) / totalCells}, 70%, 50%)` // optional: unique colors
      }))
    );

    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
    if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      
      const cellWidth = rect.width / cols;
      const cellHeight = rect.height / rows;
      const maxDistance = Math.sqrt(rect.width ** 2 + rect.height ** 2);
      
      // Calculate new weights for each cell
      const newCells = cells.map((cell, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        // Cell center position
        const cellCenterX = (col + 0.5) * cellWidth;
        const cellCenterY = (row + 0.5) * cellHeight;
        
        const distance = getDistance(cursorX, cursorY, cellCenterX, cellCenterY);
        const weight = distanceToWeight(distance, maxDistance);
        
        return { ...cell, weight };
      });
      
      // Now aggregate into row/col weights
      const newColWeights = Array(cols).fill(0.2);
      const newRowWeights = Array(rows).fill(0.2);
      
      newCells.forEach((cell, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        newColWeights[col] = Math.max(newColWeights[col], cell.weight);
        newRowWeights[row] = Math.max(newRowWeights[row], cell.weight);
      });
      
      setCells(newCells);
      setColWeights(newColWeights);
      setRowWeights(newRowWeights);
    };

    return(
        <>
            <motion.div
            style={{
                display: 'grid',
                width: '100vw',
                height: '100vh',
                gap: '4px',
                background: '#000',
              }}
              ref={containerRef}
              className="grid-container"
              onMouseMove={handleMouseMove}
              animate={{
                gridTemplateColumns: colWeights.map(w => `${w}fr`).join(' '),
                gridTemplateRows: rowWeights.map(w => `${w}fr`).join(' '),
              }}
              transition={{
                // type: "spring",
                // stiffness: 300,
                // damping: 30,
                // Or use "tween" for different easing
                type: "tween",
                duration: 0.3,
                ease: "easeOut"
              }}
            >
              {cells.map((cell, i) => (
                <motion.div 
                key={i} 
                className="cell" 
                style={{ background: cell.color }}
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              ))}
            </motion.div>
        </>
    )
}