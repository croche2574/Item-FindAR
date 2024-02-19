import { AppMenu } from '../features/app_menu/AppMenu'
import { AugmentSystem } from '../features/augment_system/AugmentSystem'
import React, { memo, useEffect, useState } from 'react'
import { XR, ARButton } from '@react-three/xr'
import { Canvas } from '@react-three/fiber'
import './App.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useCookieState } from '../features/app_menu/hooks/UseCookieState.jsx';

const theme = createTheme()

const ThemedAppMenu = memo((props) => {
  return (
    <ThemeProvider theme={theme} >
      <AppMenu {...props} />
    </ThemeProvider>
  )
})

export const App = memo((props) => {
  const [searchClasses, setSearchClasses] = useState({})
  const [isPresenting, setPresenting] = useState(false)  
  const [userSettings, setUserSettings, setEnabled] = useCookieState('usrSettings', {})

  //console.log(isPresenting)
  return (
    <>
      {isPresenting ?
        <ThemedAppMenu setClasses={setSearchClasses} setUseCookies={setEnabled} userSettings={userSettings} setUserSettings={setUserSettings}  /> :
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
})