import { AppMenu } from '../features/app_menu/AppMenu'
import { AugmentSystem } from '../features/augment_system/AugmentSystem'
import React, { memo, useEffect, useState } from 'react'
import { XR, ARButton } from '@react-three/xr'
import { Canvas } from '@react-three/fiber'
import './App.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme()

const ThemedAppMenu = memo((props) => {
  return (
    <ThemeProvider theme={theme} >
      <AppMenu {...props} />
    </ThemeProvider>
  )
})

export const App = memo((props) => {
  const [searchClasses, setSearchClasses] = useState([])
  const [userInfo, setUserInfo] = useState({})
  const [isPresenting, setPresenting] = useState(false)

  useEffect(() => {
    console.log('User settings: ', userInfo)
  }, [userInfo])

  useEffect(() => {
    console.log('Classes set: ', searchClasses)
  }, [searchClasses])

  //console.log(isPresenting)
  return (
    <>
      {isPresenting ?
        <ThemedAppMenu setClasses={setSearchClasses} setUserInfo={setUserInfo} /> :
        <ARButton
          enterOnly={true}
          sessionInit={{
            requiredFeatures: ['camera-access', 'hit-test', 'anchors', 'dom-overlay'],
            domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined
          }} />}
      <Canvas>
        <XR referenceSpace="local">
          <AugmentSystem classes={searchClasses} settings={userInfo} setPresenting={setPresenting} />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
        </XR>
      </Canvas>
    </>
  )
})