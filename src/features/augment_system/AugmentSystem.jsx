import React, { useState, useRef, memo } from "react"
import { useXR } from "@react-three/xr"
import { AnchorSystem } from "./components/AnchorSystem"
import { ItemDetector } from "./components/ItemDetector"

export const AugmentSystem = memo((props) => {
    const isPresenting = useXR((state) => state.isPresenting)
    props.setPresenting(isPresenting)
    //console.log(isPresenting)
    const [detectedItems, setDetectedItems] = useState([])
    const [imageShape, setImageShape] = useState({
        height: 0,
        width: 0,
    })

    // create a ref to hold the latest hit test result
    var lastHitTestRef = useRef(null)

    if (isPresenting) {
        return (
            <>
                <AnchorSystem
                    detectedItems={detectedItems}
                    setDetectedItems={setDetectedItems}
                    imageShape={imageShape}
                    enabled={isPresenting} />
                <ItemDetector
                    detectedItems={detectedItems}
                    setDetectedItems={setDetectedItems}
                    setImageShape={setImageShape}
                    classes={props.classes}
                    enabled={isPresenting} />
            </>
        )
    }
})