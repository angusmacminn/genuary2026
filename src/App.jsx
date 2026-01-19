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
import Genuary14 from './components/Genuary14'
import Genuary15 from './components/Genuary15'
import Genuary16 from './components/Genuary16'
import Genuary17 from './components/Genuary17'
import Genuary19 from './components/Genuary19'
function App() {



  return (
    <>
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
        <Genuary19 />
      </Canvas>
      

    </>
  )
}

export default App
