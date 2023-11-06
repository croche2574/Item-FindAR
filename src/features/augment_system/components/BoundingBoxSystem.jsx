import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useState, useRef } from "react"
import { Stage, Layer, Rect } from 'react-konva';
import tunnel from "tunnel-rat";

const getCameraIntrinsics = (projectionMatrix, viewport) => {
    const p = projectionMatrix;

    // Principal point in pixels (typically at or near the center of the viewport)
    let u0 = (1 - p[8]) * viewport.width / 2 + viewport.x;
    let v0 = (1 - p[9]) * viewport.height / 2 + viewport.y;

    // Focal lengths in pixels (these are equal for square pixels)
    let ax = viewport.width / 2 * p[0];
    let ay = viewport.height / 2 * p[5];

    // Skew factor in pixels (nonzero for rhomboid pixels)
    let gamma = viewport.width / 2 * p[4];

    // Print the calculated intrinsics:
    const intrinsicString = (
        "intrinsics: u0=" + u0 + " v0=" + v0 + " ax=" + ax + " ay=" + ay +
        " gamma=" + gamma + " for viewport {width=" +
        viewport.width + ",height=" + viewport.height + ",x=" +
        viewport.x + ",y=" + viewport.y + "}");

    console.log("projection:", Array.from(projectionMatrix).join(", "));
    console.log(intrinsicString);
}

export const BoundBoxSystem = (props) => {
    const detectedItems = props.detectedItems
    const t = props.tunnel
    const squares = useRef([])
    const shape = props.imageShape
    const { gl } = useThree()

    useEffect(() => {
        console.log(detectedItems)
        console.log(shape)
        console.log(screen.height, screen.width)
        console.log(window.innerHeight, window.innerWidth)
    }, [detectedItems])

    useFrame((state, _, frame) => {
        const referenceSpace = gl.xr.getReferenceSpace()
        let pose = frame.getViewerPose(referenceSpace)
        let session = gl.xr.getSession()
        let context = gl.getContext()
        try {
            let xrviewport = session.renderState.baseLayer.getViewport(pose.views[0])
            let proMatrix = pose.views[0].projectionMatrix
            context.viewport(
                xrviewport.x,
                xrviewport.y,
                xrviewport.width,
                xrviewport.height,)
            getCameraIntrinsics(proMatrix, xrviewport)
        } catch (error) {
            console.log(error)
        }
    })
    return (
        <>
            <t.In>
                <Stage width={window.innerWidth} height={window.innerHeight}>
                    <Layer>
                        {detectedItems.map((obj) => (
                            <Rect
                                key={obj.id}
                                id={toString(obj.id)}
                                x={obj.x * screen.width}
                                y={obj.y * screen.height}
                                width={obj.w * screen.width}
                                height={obj.h * screen.height}
                                fill="#89b717"
                                opacity={0.2}
                                stroke={'white'}
                                strokeWidth={5}
                            />
                        ))}
                    </Layer>
                </Stage>
            </t.In>

        </>
    )
}