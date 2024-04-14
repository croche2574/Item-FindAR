import React, { useState, useCallback, useEffect, useRef, memo } from "react"
import { InfoMenu } from '../augmentations/InfoMenu'
import { Interactive } from '@react-three/xr'
import { AlertModel, NeutralModel, SafeModel, WarnModel } from "../augmentations/models/models"

import FontJSON from '../../../Roboto-msdf.json'
import FontImage from '../../../Roboto-msdf.png'

const MarkerModel = memo((props) => {
    const { mode, onMarkerSelect, markerOpaque, position, scale, quaternion } = props
    const opacity = (markerOpaque) ? 1.0 : 0.5
    const modelLookup = {
        alert: <AlertModel position={position} scale={scale} quaternion={quaternion} opacity={opacity} />,
        neutral: <NeutralModel position={position} scale={scale} quaternion={quaternion} opacity={opacity} />,
        safe: <SafeModel position={position} scale={scale} quaternion={quaternion} opacity={opacity} />,
        warn: <WarnModel position={position} scale={scale} quaternion={quaternion} opacity={opacity} />,
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

    useEffect(() => () => { if (menuVis) { setMarkerOpaque(true); console.log("Object unloaded") } }, [menuVis])

    useEffect(() => {
        const allergens = Object.keys(settings.allergens ?? {}).filter(setting => Object.keys(itemData.allergens).indexOf(setting) !== -1)
        const dietary = Object.keys(settings.restrictions ?? {}).filter(setting => itemData.tags.indexOf(setting) !== -1)
        console.log("dietary:", dietary)
        console.log(settings)
        console.log(itemData)
        console.log(allergens)
        console.log(settings.restrictions)

        if (allergens.length === 0 && (dietary.length === settings.restrictions?.length || typeof(settings.restrictions) === 'undefined')) {
            (searchMode) ? setAlertLevel('safe') : setAlertLevel('neutral')
        } else if (allergens.filter((allergen) => { return itemData.allergens[allergen].may === false && settings.allergens[allergen] != 2 }).length !== 0 && dietary.length === settings.restrictions.length) {
            setAlertLevel('alert')
        } else {
            setAlertLevel('warn')
        }
    }, [settings, searchMode])

    return (
        <>
            {((menuVis && !markerOpaque) || markerOpaque) && <MarkerModel mode={alertLevel} onMarkerSelect={onMarkerSelect} markerOpaque={markerOpaque} position={position} scale={scale} quaternion={quaternion} />}
            {menuVis && itemData && <InfoMenu menuRef={menuRef} data={itemData} menuVis={menuVis} setMenuVis={setMenuVis} position={position} quaternion={quaternion} scale={scale} FontJSON={FontJSON.valueOf()} FontImage={FontImage.valueOf()} />}
        </>
    )
})