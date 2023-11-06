import { AugmentSystem } from '../features/augment_system/AugmentSystem'
import React, { Suspense, useState } from 'react'
import { Interactive, XR, ARButton } from '@react-three/xr'
import { Canvas } from '@react-three/fiber'
import tunnel from 'tunnel-rat'

export default function App() {
  const t = tunnel()
  return (
    <>
      <div id="box-display">
        <t.Out />
      </div>
      <ARButton
        sessionInit={{
          requiredFeatures: ['camera-access', 'hit-test', 'anchors'],
          domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined,
        }} />
      
      <Canvas>
        <XR referenceSpace="local">
          <AugmentSystem tunnel={t} />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
        </XR>
      </Canvas>
    </>
  )
}