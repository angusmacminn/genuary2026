import {motion} from "motion/react"
import {useRef} from "react"


export default function Genuary2(){
    const constraintsRef = useRef(null)

    return(
    <div style={styles.wrap}>
      <div style={styles.card}>
        
        {/* visible drag boundary */}
        <div ref={constraintsRef} style={styles.dragArea}>
        
        <motion.div drag
          style={styles.button}
          initial={false}

          dragConstraints={constraintsRef}

          whileDrag={{
            scale: 0.5,
            background: "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ea580c 100%)",
            transition: { duration: 0.2}
          }}
          
          animate={{
            scaleX: [1, 1.08, 0.98, 1.02, 1],
            scaleY: [1, 0.92, 1.04, 0.99, 1],
            transition: { duration: 0.25, ease: "easeOut" },
          }}
        >
          
        </motion.div>

        </div>
        
      </div>
    </div>
  );
}

const styles = {
  dragArea: {
    padding: 40,
    borderRadius: 20,
    border: "2px dashed rgba(24, 24, 24, 0.25)",
    background: "rgba(255, 255, 255, 0.02)",
    position: "relative",
  },
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "radial-gradient(ellipse at 50% 30%,rgb(242, 242, 242) 0%,rgb(215, 215, 215) 100%)",
    padding: 24,
    fontFamily: '"Outfit", system-ui, sans-serif',
    color: "#f0f0f0",
  },
  card: {
    width: "min(420px, 90vw)",
    padding: 32,
    borderRadius: 24,
    background: "rgba(190, 41, 41, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(12px)",
  },
  button: {
    padding: "2rem ",
    width: "100%",
    height: 72,
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg,rgb(255, 0, 0) 0%,rgb(246, 100, 92) 50%,rgb(236, 52, 35) 100%)",
    color: "white",
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: 0.5,
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    outline: "none",
    transformOrigin: "50% 100%",
    boxShadow: "0 8px 32px rgba(241, 35, 35, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
  },
};
    
