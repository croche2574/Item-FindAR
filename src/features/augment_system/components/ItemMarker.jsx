import React, { useState, useCallback, useEffect, useRef } from "react"
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


const MarkerModel = React.memo((props) => {
    const { mode, onMarkerSelect, position, scale, quaternion } = props
    const alertNode = useGLTF('.' + alertPath.substring(alertPath.indexOf("/models")))
    const neutralNode = useGLTF('.' + neutralPath.substring(neutralPath.indexOf("/models")))
    const safeNode = useGLTF('.' + safePath.substring(safePath.indexOf("/models")))
    const warnNode = useGLTF('.' + warnPath.substring(warnPath.indexOf("/models")))

    console.log('.' + alertPath.substring(alertPath.indexOf("/models")))
    console.log('Node: ', neutralNode)

    const modelLookup = {
        alert: <primitive castShadow receiveShadow object={alertNode.scene} position={position} scale={scale} quaternion={quaternion} />,
        neutral: <primitive castShadow receiveShadow object={neutralNode.scene} position={position} scale={scale} quaternion={quaternion} />,
        safe: <primitive castShadow receiveShadow object={safeNode.scene} position={position} scale={scale} quaternion={quaternion} />,
        warn: <primitive castShadow receiveShadow object={warnNode.scene} position={position} scale={scale} quaternion={quaternion} />,
    }
    
    return (
        <Interactive onSelect={onMarkerSelect}>
            {modelLookup[mode]}
        </Interactive>
    )
})

export const ItemMarker = React.memo((props) => {
    const { itemData, settings, position, scale, quaternion } = props
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
        //console.log("item data", itemData)
    })

    useEffect(() => {
        const allergens = Object.keys(settings.allergens ?? {}).filter(setting => Object.keys(itemData.allergens).indexOf(setting) !== -1)
        console.log(settings)
        console.log(itemData)
        console.log(allergens)

        if (allergens.length === 0) {
            (props.searchMode) ? setAlertLevel('safe') : setAlertLevel('neutral')
        } else if (allergens.filter((allergen) => { return itemData.allergens[allergen].may === false && settings.allergens[allergen] != 2 }).length !== 0) {
            setAlertLevel('alert')
        } else {
            setAlertLevel('warn')
        }
    }, [settings])

    return (
        <>
            <MarkerModel mode={alertLevel} onSelect={onMarkerSelect} position={position} scale={scale} quaternion={quaternion} />
            {menuVis && itemData && <InfoMenu menuRef={menuRef} data={itemData} menuVis={menuVis} setMenuVis={setMenuVis} position={position} quaternion={quaternion} scale={scale} FontJSON={FontJSON.valueOf()} FontImage={FontImage.valueOf()} />}
        </>
    )
})