import { useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { Matrix4, Vector3, Quaternion } from 'three';

export const useHitTest = (callback, objects, setObjects) => {
    const session = useXR((state) => state.session)
    const { gl } = useThree()
    const refspace = gl.xr.getReferenceSpace()
    let hitMatrix = useMemo(() => new Matrix4(), [])

    const transformOrigin = ([x, y]) => {
        return [x - 0.5, (y - 0.5) * -1]
    }

    useEffect(() => {
        if (!session || !objects) return
        //console.log(objects)
        let obsChanged = false

        const temp = objects.map(async obj => {
            console.log("obj", obj)
            if (obj.anchorData || obj.hitsource) {
                console.log("anchor/hitsource exists")
                return { ...obj }
            } else {
                let c = transformOrigin([obj.x, obj.y]);

                console.log("center", c)
                let refspace = await session.requestReferenceSpace('viewer')
                let hitsource = await session.requestHitTestSource({
                    space: refspace,
                    entityTypes: ["point"],
                    offsetRay: new XRRay({ x: c[0], y: c[1] })
                })
                console.log("hit_source", hitsource)
                obsChanged = true
                obj.hitsource = hitsource
                return obj
            }
        })
        if (obsChanged) {
            console.log("prommy", temp)
            objs = Promise.all(temp)
            console.log("temp", objs)
            setObjects(objs)
        }
    }, [session, objects])

    useFrame((state, _, frame) => {
        if (!frame) return
        let temp = []
        let obsChanged = false
        let anchorData = {}

        temp = objects.map(obj => {
            //console.log("source", obj)
            if (!obj.hitsource || obj.anchorData) {
                return obj
            } else {
                const [hit] = frame.getHitTestResults(obj.hitsource)
                console.log('hit', hit)
                if (hit) {
                    const pose = hit.getPose(refspace)
                    //hits.push(hit)

                    if (pose) {
                        hitMatrix.fromArray(pose.transform.matrix)
                    }

                    hit.createAnchor().then(
                        (anchor) => {
                            //console.log('anchor:', anchor)
                            console.log(state)
                            //console.log("matrix", obj.hitMatrix)
                            anchorData = {
                                anchor: anchor,
                                object: {
                                    position: new Vector3().setFromMatrixPosition(hitMatrix),
                                    scale: new Vector3()
                                        .setFromMatrixScale(hitMatrix)
                                        .clamp(new Vector3(0.002, 0.002, 0.002), new Vector3(0.004, 0.004, 0.004)),
                                    quaternion: new Quaternion().copy(state.camera.quaternion)
                                }
                            }
                            obj.hitsource.cancel()
                            obj.hitsource = null
                            obj.anchorData = anchorData
                            console.log("anchored", obj)
                            callback()
                        })
                }
                obsChanged = true
                return obj
                //console.log(hitTestSource.current)
            }
        })
        if (obsChanged) {
            console.log("items changed")
            setObjects(temp)
        }
    })
}