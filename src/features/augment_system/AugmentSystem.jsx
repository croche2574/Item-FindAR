import React, { useState, useRef } from "react"
import { useXR } from "@react-three/xr"
import { AnchorSystem } from "./components/AnchorSystem"
import { ItemDetector } from "./components/ItemDetector"
import { ARScene, Reticle } from "./components/ReticleSystem"
import { BoundBoxSystem } from "./components/BoundingBoxSystem"

export const AugmentSystem = (props) => {
    const isPresenting = useXR((state) => state.isPresenting)
    console.log(isPresenting)
    const [mode, setMode] = useState("search")
    const [detectedItems, setDetectedItems] = useState([])
    const [imageShape, setImageShape] = useState({
        height: 0,
        width: 0,
    })
    const [presenting, setPresenting] = useState(null)
    var reticleRef = useRef()
    const [anchors, setAnchors] = useState([])
    //
    // create a ref to hold the latest hit test result
    var lastHitTestRef = useRef(null)

    if (isPresenting) {
        if (mode === "search") {
            return (
                <>
                    <AnchorSystem detectedItems={detectedItems} setDetectedItems={setDetectedItems} imageShape={imageShape} enabled={isPresenting} tunnel={props.tunnel} />
                    <ItemDetector detectedItems={detectedItems} setDetectedItems={setDetectedItems} setImageShape={setImageShape} enabled={isPresenting} />
                </>
            )
        }
        else {
            return (
                <>
                    <group>
                        <ARScene
                            lastHitRef={lastHitTestRef}
                            reticle={reticleRef}
                            setPresenting={setPresenting}
                            anchors={anchors}
                            setAnchors={setAnchors}
                        />
                        <Reticle refObj={reticleRef} position={[1, 0.5, 0]} />
                    </group>
                    <ItemDetector setDetectedItems={setDetectedItems} setImageShape={setImageShape} enabled={isPresenting} />
                </>
            )
        }
    }
}