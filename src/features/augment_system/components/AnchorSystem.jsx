import React, { useEffect, useRef, useState, memo, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useXR, XR, toggleSession, XRButton, Interactive} from '@react-three/xr'
import * as THREE from 'three'

const ItemMarker = memo((props) => {
    const { id, className, position, scale, quaternion } = props
    const [color, setColor] = useState('blue')
    console.log('created')
    const onSelect = (e) => {
        setColor((Math.random() * 0xffffff) | 0)
    }

    return (
        <Interactive onSelect={onSelect}>
            <mesh position={position} scale={scale} quaternion={quaternion} castShadow receiveShadow>
                <sphereGeometry args={[5, 24, 24]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </Interactive>
    )
})

const MarkerSystem = (props) => {

}

const useHitTest = (callback, objects) => {
    const session = useXR((state) => state.session)
    const { gl } = useThree()
    const refspace = gl.xr.getReferenceSpace()
    let hitMatrix = useMemo(() => new THREE.Matrix4(), [])

    const transformOrigin = ([x, y]) => {
        return [x - 0.5, (y - 0.5) * -1]
    }

    useEffect(() => {
        if (!session || !objects) return
        //console.log(objects)

        for (const obj of objects) {
            console.log("obj run", obj)
            console.log("obj anchor", obj.anchorData)
            if (obj.anchorData) continue

            let c = transformOrigin([obj.x + (obj.w / 2), obj.y + (obj.h / 2)]);
            console.log("center", c)
            session.requestReferenceSpace('viewer').then((ref) => {
                (async () => await session.requestHitTestSource({
                    space: ref,
                    entityTypes: ["point"],
                    offsetRay: new XRRay({ x: c[0], y: c[1] })
                }).then((hitsource) => {
                    console.log("hit_source", hitsource)
                    obj.hitsource = hitsource
                }))();
            })

            //console.log("obj", obj)
            //temp.push(obj)
        }
    }, [session, objects])

    useFrame((state, _, frame) => {
        if (!frame) return

        for (const obj of objects) {
            //console.log("source", obj.hitsource)
            if (!obj.hitsource || obj.anchorData) continue

            [obj.hit] = frame.getHitTestResults(obj.hitsource)
            console.log('hit', obj.hit)
            if (obj.hit) {
                const pose = obj.hit.getPose(refspace)
                //hits.push(hit)

                if (pose) {
                    hitMatrix.fromArray(pose.transform.matrix)
                    obj.hitMatrix = hitMatrix
                }

                obj.hit.createAnchor().then(
                    (anchor) => {
                        //console.log('anchor:', anchor)

                        //console.log("matrix", obj.hitMatrix)
                        obj.anchorData = {
                            anchor: anchor,
                            object: {
                                position: new THREE.Vector3().setFromMatrixPosition(obj.hitMatrix),
                                scale: new THREE.Vector3()
                                    .setFromMatrixScale(obj.hitMatrix)
                                    .clamp(new THREE.Vector3(0.001, 0.001, 0.001), new THREE.Vector3(0.01, 0.01, 0.01)),
                                quaternion: new THREE.Quaternion().setFromRotationMatrix(obj.hitMatrix)
                            }
                        }
                        obj.hitsource.cancel()
                        obj.hitsource = null
                        console.log("anchored", obj)
                        callback()
                    })
            }
            //console.log(hitTestSource.current)

        }
    })
}
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

    //console.log("projection:", Array.from(projectionMatrix).join(", "));
    //console.log(intrinsicString);
}

export const AnchorSystem = memo((props) => {
    const { gl } = useThree()
    const detectedItems = props.detectedItems
    const [isDirty, setDirty] = useState(false)

    useHitTest(() => {
        setDirty(!isDirty)
    }, detectedItems)

    useEffect(() => {
        console.log("refresh", detectedItems)
    }, [detectedItems, isDirty])

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
            //getCameraIntrinsics(proMatrix, xrviewport)
        } catch (error) {
            console.log(error)
        }
    })

    if (props.enabled) {
        return (
            <group>
                {detectedItems.map((item, index) => {
                    //console.log("render", item)
                    //console.log("anchorData", item.anchorData)
                    if (!item.anchorData) {
                        console.log("No anchor")
                        return
                    } else {
                        return <ItemMarker key={item.id} id={item.id} itemClass={item.className} position={item.anchorData.object.position} scale={item.anchorData.object.scale} quaternion={item.anchorData.object.quaternion} />
                    }
                })}
            </group>
        )
    }
})