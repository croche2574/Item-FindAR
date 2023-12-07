import { AugmentSystem } from '../features/augment_system/AugmentSystem'
import React, { Suspense, useState } from 'react'
import { Interactive, XR, ARButton } from '@react-three/xr'
import { Canvas } from '@react-three/fiber'

export default function App() {
  return (
    <>
      <ARButton
        sessionInit={{
          requiredFeatures: ['camera-access', 'hit-test', 'anchors'],
          domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined,
        }} />
      
      <Canvas>
        <XR referenceSpace="local">
          <AugmentSystem />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
        </XR>
      </Canvas>
    </>
  )
}