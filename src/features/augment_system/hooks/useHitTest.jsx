import { useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import * as THREE from 'three';

export const useHitTest = (callback, objects, setObjects) => {
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
        let temp = []
        let obsChanged = false

        for (const obj of objects) {
            //console.log("obj run", obj)
            //console.log("obj anchor", obj.anchorData)
            if (obj.anchorData || obj.hitsource) {
                temp.push(obj)
            } else {
                obsChanged = true
                let c = transformOrigin([obj.x + (obj.w / 2), obj.y + (obj.h / 2) - .2]);

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

                console.log("obj", obj)
                temp.push(obj)
            }
        }
        if (obsChanged) {
            setObjects(temp)
        }
    }, [session, objects])

    useFrame((state, _, frame) => {
        if (!frame) return
        let temp = []
        let obsChanged = false

        for (const obj of objects) {
            //console.log("source", obj.hitsource)
            if (!obj.hitsource || obj.anchorData) {
                temp.push(obj)
            } else {
                obsChanged = true;
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
                temp.push(obj)
                //console.log(hitTestSource.current)
            }
        }
        if (obsChanged) {
            console.log("items changed")
            setObjects(temp)
        }
    })
}