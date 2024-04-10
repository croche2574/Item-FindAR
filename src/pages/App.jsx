import { AppMenu } from '../features/app_menu/AppMenu'
import { AugmentSystem } from '../features/augment_system/AugmentSystem'
import React, { memo, useEffect, useState } from 'react'
import { XR, ARButton } from '@react-three/xr'
import { Canvas } from '@react-three/fiber'
import './App.css'
import { AppBar, Toolbar, Typography, Box, Card, CardContent, Stack, Button, Divider } from '@mui/material'
import { useReadCypher } from 'use-neo4j'

const LandingPage = memo((props) => {

  return (
    <Box style={{ zIndex: 99999 }}>
      <AppBar style={{ position: 'fixed', top: 0 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Item FindAR
          </Typography>
        </Toolbar>
      </AppBar>
      <Stack spacing={1} style={{ position: 'fixed', top: 50 }}>
        <Card >
          <CardContent>
            <Typography variant="h5" gutterBottom>Overview</Typography>
            <Typography variant='body2'>This application was designed to help users identify and view nutrition facts for items without needing to pick them up. Please try out the different features and complete the surveys below.</Typography>
          </CardContent>
        </Card>
        <Card >
          <CardContent>
            <Typography variant="h5" gutterBottom>User Surveys</Typography>
            <Stack spacing={2}>
              <Button href='https://forms.gle/6NaPm4hxKWHc4RcA6' variant="contained">Pre-Survey</Button>
              <Divider variant="middle" />
              <Button href='https://forms.gle/u29eRVhVwG47LjqV8' variant="contained">Post-Survey</Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
      <ARButton
        enterOnly={true}
        disabled={!navigator.onLine}
        {...(!navigator.onLine ? {innerHTML: "Offline"} : {})}
        sessionInit={{
          requiredFeatures: ['camera-access', 'hit-test', 'anchors', 'dom-overlay'],
          domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined
        }} />
    </Box>
  )
})

export const App = memo((props) => {
  const [searchClasses, setSearchClasses] = useState([])
  const [userInfo, setUserInfo] = useState({})
  const [isPresenting, setPresenting] = useState(false)
  const [query, setQuery] = useState('MATCH (n:Item) RETURN n.class_code AS class_codes')
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
    else {setSearchClasses([])}
  }, [classResults])

  useEffect(() => {
    console.log('Search classes: ', searchClasses)
  }, [searchClasses])

  useEffect(() => {
    console.log('search mode: ', searchMode)
    if (searchMode) { setQuery(`MATCH (i:Item) WHERE i.name = 'none' WITH collect(i.class_code) AS class_codes RETURN class_codes'`) }
    else { setQuery('MATCH (n:Item) RETURN n.class_code AS class_codes') }
  }, [searchMode])

  //console.log(isPresenting)
  return (
    <>
      {isPresenting ?
        <AppMenu setQuery={setQuery} setUserInfo={setUserInfo} setSearchMode={setSearchMode} /> :
        <LandingPage />}
      <Canvas style={{ zIndex: -1 }}>
        <XR referenceSpace="local">
          <AugmentSystem classes={searchClasses} settings={userInfo} setPresenting={setPresenting} searchMode={searchMode} />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
        </XR>
      </Canvas>
    </>
  )
})