import { motion, useAnimate } from "motion/react"
import { useMemo, useState, useEffect } from "react"

export default function Genuary3() {
    function makeFib(n) {
        const arr = [1, 1]
        while (arr.length < n) arr.push(arr.at(-1) + arr.at(-2))
        return arr.slice(0, n).reverse()
    }

    const [count, setCount] = useState(8)
    const [key, setKey] = useState(0) // for replay
    const fib = useMemo(() => makeFib(count), [count])
    const maxSize = fib[0]    

    return (

        
        <div
            onClick={() => setKey(k => k + 1)} // click to replay
            style={{
                minHeight: "100vh",
                background: "#0a0a0a",
                display: "grid",
                placeItems: "center",
                fontFamily: "Georgia, serif",
                cursor: "pointer"
            }}
        >
            


            <div
                key={key}
                style={{ position: "relative", width: maxSize * 12, height: maxSize * 12 }}
            >
                {fib.map((v, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 3 }}
                        whileHover={{ 
                            scale: 3.05, 
                            borderColor: "#fff",
                            boxShadow: "0 0 20px hsla(40, 80%, 60%, 0.4)",
                            transition: 0.1
                        }}
                        transition={{
                            delay: i * 0.1,
                            duration: 0.2,
                            type: "spring",
                            stiffness: 120
                        }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            margin: "auto",
                            width: v * 12,
                            height: v * 12,
                            border: `1px solid hsl(${40 + i * 8}, 70%, ${55 + i * 4}%)`,
                            borderRadius: 2,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}