import { AppMenu } from '../features/app_menu/AppMenu'
import { AugmentSystem } from '../features/augment_system/AugmentSystem'
import React, { useState } from 'react'
import { XR, ARButton } from '@react-three/xr'
import { Canvas } from '@react-three/fiber'
import './App.css'

export default function App() {
  const [searchClasses, setSearchClasses] = useState([])
  const [isPresenting, setPresenting] = useState(false)

  //console.log(isPresenting)
  return (
    <>
      {isPresenting ?
        <AppMenu setClasses={setSearchClasses} /> :
        <ARButton
          enterOnly={true}
          sessionInit={{
            requiredFeatures: ['camera-access', 'hit-test', 'anchors', 'dom-overlay'],
            domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined
          }} />}
      <Canvas>
        <XR referenceSpace="local">
          <AugmentSystem classes={searchClasses} setPresenting={setPresenting} />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
        </XR>
      </Canvas>
    </>
  )
}