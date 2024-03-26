import React, { useState, useCallback, useEffect, useRef, memo } from "react"
import { InfoMenu } from '../augmentations/InfoMenu'
import { Interactive } from '@react-three/xr'
import { useGLTF } from "@react-three/drei"

const FontJSON = '../../../Roboto-msdf.json'
const FontImage = '../../../Roboto-msdf.png'

import alertPath from '../augmentations/models/alert.glb'
import neutralPath from '../augmentations/models/neutral.glb'
import safePath from '../augmentations/models/safe.glb'
import warnPath from '../augmentations/models/warn.glb'

useGLTF.preload('.' + alertPath.substring(alertPath.indexOf("/models")))
useGLTF.preload('.' + neutralPath.substring(neutralPath.indexOf("/models")))
useGLTF.preload('.' + safePath.substring(safePath.indexOf("/models")))
useGLTF.preload('.' + warnPath.substring(warnPath.indexOf("/models")))


const MarkerModel = memo((props) => {
    const { mode, onMarkerSelect, markerOpaque, position, scale, quaternion } = props
    const alertNode = useGLTF('.' + alertPath.substring(alertPath.indexOf("/models")))
    const neutralNode = useGLTF('.' + neutralPath.substring(neutralPath.indexOf("/models")))
    const safeNode = useGLTF('.' + safePath.substring(safePath.indexOf("/models")))
    const warnNode = useGLTF('.' + warnPath.substring(warnPath.indexOf("/models")))
    const opacity = (markerOpaque) ? 1.0 : 0.5

    console.log(neutralNode)
    const modelLookup = {
        alert: <primitive castShadow receiveShadow object={alertNode.scene} position={position} scale={scale} quaternion={quaternion} children-0-material-transparent={true} children-0-material-opacity={opacity} />,
        neutral: <primitive castShadow receiveShadow object={neutralNode.scene} position={position} scale={scale} quaternion={quaternion} children-0-material-transparent={true} children-0-material-opacity={opacity} />,
        safe: <primitive castShadow receiveShadow object={safeNode.scene} position={position} scale={scale} quaternion={quaternion} children-0-material-transparent={true} children-0-material-opacity={opacity} />,
        warn: <primitive castShadow receiveShadow object={warnNode.scene} position={position} scale={scale} quaternion={quaternion} children-0-material-transparent={true} children-0-material-opacity={opacity} />,
    }
    
    return (
        <Interactive onSelect={onMarkerSelect}>
            {modelLookup[mode]}
        </Interactive>
    )
})

export const ItemMarker = memo((props) => {
    const { markerOpaque, setMarkerOpaque, searchMode, itemData, settings, position, scale, quaternion } = props
    const [alertLevel, setAlertLevel] = useState('neutral')
    const [menuVis, setMenuVis] = useState(false)
    const menuRef = useRef()

    console.log('created', itemData.name)
    console.log('visible', menuVis)

    const onMarkerSelect = useCallback((e) => {
        if (menuVis && menuRef.current) {
            console.log("ref unload", menuRef.current)
            menuRef.current.clear()
        } else if (!menuVis && menuRef.current) {
            console.log("menu ref", menuRef.current)
        }
        setMenuVis(!menuVis)
        setMarkerOpaque(!markerOpaque)
        console.log("item data", itemData)
    }, [menuVis, markerOpaque])

    useEffect(() => () => {if (menuVis) { setMarkerOpaque(true); console.log("Object unloaded") }}, [menuVis])

    useEffect(() => {
        const allergens = Object.keys(settings.allergens ?? {}).filter(setting => Object.keys(itemData.allergens).indexOf(setting) !== -1)
        console.log(settings)
        console.log(itemData)
        console.log(allergens)

        if (allergens.length === 0) {
            (searchMode) ? setAlertLevel('safe') : setAlertLevel('neutral')
        } else if (allergens.filter((allergen) => { return itemData.allergens[allergen].may === false && settings.allergens[allergen] != 2 }).length !== 0) {
            setAlertLevel('alert')
        } else {
            setAlertLevel('warn')
        }
    }, [settings, searchMode])

    return (
        <>
            <MarkerModel mode={alertLevel} onMarkerSelect={onMarkerSelect} markerOpaque={markerOpaque} position={position} scale={scale} quaternion={quaternion} />
            {menuVis && itemData && <InfoMenu menuRef={menuRef} data={itemData} menuVis={menuVis} setMenuVis={setMenuVis} position={position} quaternion={quaternion} scale={scale} FontJSON={FontJSON.valueOf()} FontImage={FontImage.valueOf()} />}
        </>
    )
})