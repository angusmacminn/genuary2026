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
      {/* Recording Controls - hidden on mobile due to limited support */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}>
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{
                width: '12px',
                height: '12px',
                backgroundColor: 'white',
                borderRadius: '50%',
              }}></span>
              Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#333',
                color: 'white',
                border: '2px solid #ff4444',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'pulse 1s infinite',
              }}
            >
              <span style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#ff4444',
                borderRadius: '2px',
              }}></span>
              Stop & Save
            </button>
          )}
          {isRecording && (
            <span style={{
              color: '#ff4444',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              ● REC
            </span>
          )}
        </div>
      )}

      

      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        // Enable touch events
        eventSource={document.getElementById('root')}
        eventPrefix="client"
      >
        <Genuary11/>
      </Canvas>

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
