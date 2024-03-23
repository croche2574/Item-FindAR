import { AppMenu } from '../features/app_menu/AppMenu'
import { AugmentSystem } from '../features/augment_system/AugmentSystem'
import React, { memo, useEffect, useState } from 'react'
import { XR, ARButton } from '@react-three/xr'
import { Canvas } from '@react-three/fiber'
import './App.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useReadCypher } from 'use-neo4j'

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
  const [query, setQuery] = useState('MATCH (n:Node) RETURN n')
  const { records: classResults, run: runQuery } = useReadCypher(query)
  const [searchMode, setSearchMode] = useState(false)

  useEffect(() => {
    console.log('User settings: ', userInfo)
  }, [userInfo])

  useEffect(() => {
    console.log('Query set: ', query)
    runQuery({ query })
  }, [query])

  useEffect(() => {
    console.log('class results', classResults)
    if (classResults) { setSearchClasses(classResults.map(row => row.get('class_codes'))) }
  }, [classResults])

  useEffect(() => {
    console.log('Search classes: ', searchClasses)
  }, [searchClasses])

  useEffect(() => {
    if (!searchMode) { setSearchClasses([]) }
  }, [searchMode])

  //console.log(isPresenting)
  return (
    <>
      {isPresenting ?
        <ThemedAppMenu setQuery={setQuery} setUserInfo={setUserInfo} setSearchMode={setSearchMode} /> :
        <ARButton
          enterOnly={true}
          sessionInit={{
            requiredFeatures: ['camera-access', 'hit-test', 'anchors', 'dom-overlay'],
            domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined
          }} />}
      <Canvas>
        <XR referenceSpace="local">
          <AugmentSystem classes={searchClasses} settings={userInfo} setPresenting={setPresenting} searchMode={searchMode} />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
        </XR>
      </Canvas>
    </>
  )
})