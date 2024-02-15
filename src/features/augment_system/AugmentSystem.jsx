import React, { useState, useRef, useEffect } from "react"
import { useXR } from "@react-three/xr"
import { AnchorSystem } from "./components/AnchorSystem"
import { ItemDetector } from "./components/ItemDetector"

export const AugmentSystem = (props) => {
    const isPresenting = useXR((state) => state.isPresenting)
    props.setPresenting(isPresenting)
    //console.log(isPresenting)
    const [mode, setMode] = useState("search")
    const [detectedItems, setDetectedItems] = useState()
    const [imageShape, setImageShape] = useState({
        height: 0,
        width: 0,
    })
    const [presenting, setPresenting] = useState(null)
    //
    // create a ref to hold the latest hit test result
    var lastHitTestRef = useRef(null)

    useEffect(() => {
        setDetectedItems([])
    }, [])

    if (isPresenting) {
        if (mode === "search") {
            return (
                <>
                    <AnchorSystem detectedItems={detectedItems} setDetectedItems={setDetectedItems} imageShape={imageShape} enabled={isPresenting} />
                    <ItemDetector detectedItems={detectedItems} setDetectedItems={setDetectedItems} setImageShape={setImageShape} enabled={isPresenting} />
                </>
            )
        }
    }
}