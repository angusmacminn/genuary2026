import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import { useEffect, useState } from 'react'
import InstanceSphere from './components/InstanceSphere'
import Genuary2 from './components/Genuary2'
import Genuary3 from './components/Genuary3'
import Genuary5 from './components/Genuary5'
import Genuary6, { stopRecording } from './components/Genuary6'
import Genuary7 from './components/Genuary7'
import Genuary8 from './components/Genuary8'
import Genuary9 from './components/Genuary9'
import Genuary10 from './components/Genuary10'
import Raymarching from './components/Raymarching'
import Genuary11 from './components/Genuary11'
import Genuary12 from './components/Genuary12'
import Genuary13 from './components/Genuary13'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showHint, setShowHint] = useState(true)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || 
                  'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hide hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Double-click/double-tap for fullscreen (works on both desktop and mobile)
    let lastTap = 0
    const handleDoubleTap = (e) => {
      const now = Date.now()
      if (now - lastTap < 300) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.()
        } else {
          document.exitFullscreen?.()
        }
      }
      lastTap = now
    }

    window.addEventListener('touchend', handleDoubleTap)
    window.addEventListener('dblclick', handleDoubleTap)
    return () => {
      window.removeEventListener('touchend', handleDoubleTap)
      window.removeEventListener('dblclick', handleDoubleTap)
    }
  }, [])

  const handleStartRecording = () => {
    setIsRecording(true)
  }

  const handleStopRecording = () => {
    stopRecording()
    setIsRecording(false)
  }

  return (
    <>
      

      

      {/* Genuary13 is SVG/HTML - render outside Canvas */}
      <Genuary13 />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  )
}

export default App
