import React, { useEffect, useRef, useState, memo, useMemo, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useXR, Interactive } from '@react-three/xr'
import * as THREE from 'three'
import { useReadCypher } from 'use-neo4j'
import { InfoMenu } from '../augmentations/InfoMenu'

const FontJSON = '../../../Roboto-msdf.json'
const FontImage = '../../../Roboto-msdf.png'

const ItemMarker = memo((props) => {
    const { id, itemData, position, scale, quaternion } = props
    const [color, setColor] = useState('blue')
    const [menuVis, setMenuVis] = useState(false)
    const menuRef = useRef()

    console.log('created', itemData.name)
    console.log('visible', menuVis)

    const onMarkerSelect = useCallback((e) => {
        setColor((Math.random() * 0xffffff) | 0)
        if (menuVis && menuRef.current) {
            console.log("ref unload", menuRef.current)
            menuRef.current.clear()
        } else if (!menuVis && menuRef.current) {
            console.log("menu ref", menuRef.current)
        }
        setMenuVis(!menuVis)
        //console.log("item data", itemData)
    })


    return (
        <>
            <Interactive onSelect={onMarkerSelect}>
                <mesh position={position} scale={scale} quaternion={quaternion} castShadow receiveShadow>
                    <sphereGeometry args={[5, 24, 24]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </Interactive>

            {menuVis && itemData && <InfoMenu menuRef={menuRef} data={itemData} menuVis={menuVis} setMenuVis={setMenuVis} position={position} quaternion={quaternion} scale={scale} FontJSON={FontJSON.valueOf()} FontImage={FontImage.valueOf()} />}
        </>
    )
})

const useHitTest = (callback, objects, setObjects) => {
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

export const AnchorSystem = memo((props) => {
    const { gl } = useThree()
    const detectedItems = props.detectedItems
    const [isDirty, setDirty] = useState(false)

    //const query = 'match (n) return n'
    const { loading: loading, result: results, first: first, run: run } = useReadCypher('MATCH (n:Item)-[r]-(c) WHERE n.class_code IN $clsnames RETURN n, r, c', { clsnames: [] })

    useHitTest(() => {
        setDirty(!isDirty)
    }, props.detectedItems, props.setDetectedItems)

    useEffect(() => {
        console.log("refresh", detectedItems)
    }, [isDirty])

    useEffect(() => {
        console.log(results)
        if (results === undefined || results.records.length === 0) {
            console.log("no results")
        } else {
            const temp = detectedItems.map((item) => {
                console.log("Item", item)
                if (item.clsname && !item.itemData) {
                    item.itemData = {}
                    item.itemData.allergens = []
                    item.itemData.nutrients = {}
                    item.itemData.tags = []

                    console.log("results", results)

                    results.records.map((record) => {
                        console.log(record)
                        let itemNode = record.get('n')
                        let relationship = record.get('r')
                        let endNode = record.get('c')
                        console.log(itemNode.properties.class_code, item.clsname)
                        if (itemNode.properties.class_code === item.clsname) {
                            item.itemData.name = itemNode.properties.name
                            item.itemData.brand = itemNode.properties.brand
                            item.itemData.ingredientList = itemNode.properties.ingredient_list
                            item.itemData.servings = itemNode.properties.servings

                            console.log(relationship.type)

                            switch (relationship.type) {
                                case 'CONTAINS_NUTRIENT':
                                    item.itemData.nutrients[endNode.properties.name] = relationship.properties
                                    break

                                case 'CONTAINS_INGREDIENT':
                                    break

                                case 'CONTAINS_SUBINGREDIENT':
                                    break

                                case 'CONTAINS_ALLERGEN':
                                    item.itemData.allergens.push({ name: endNode.properties.name, may: false })
                                    break

                                case 'MAY_CONTAIN_ALLERGEN':
                                    item.itemData.allergens.push({ name: endNode.properties.name, may: false })
                                    break

                                case 'TAGGED_AS':
                                    item.itemData.tags.push(endNode.properties.name)
                                    break

                                default:
                                    break;
                            }
                        }
                    })
                    return item
                } else {
                    return item
                }

            })
            console.log("temp", temp)
            props.setDetectedItems(temp)
        }

    }, [results])

    useEffect(() => {
        console.log("changed", detectedItems)
        let classes = []
        for (const item of detectedItems) {
            if (item.itemData === undefined) {
                classes.push(item.clsname)
            }
        }
        if (classes.length) {
            run({ clsnames: classes })
        }
    }, [detectedItems])

    useFrame((state, _, frame) => {
        const referenceSpace = gl.xr.getReferenceSpace()
        try {
            let pose = frame.getViewerPose(referenceSpace)
            let session = gl.xr.getSession()
            let context = gl.getContext()
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

    //console.log("detItems", detectedItems)
    if (props.enabled && detectedItems != undefined) {
        return (
            <group>
                {detectedItems.map((item, index) => {
                    //console.log("render", item)
                    //console.log("anchorData", item.anchorData)
                    if (!item.anchorData) {
                        console.log("No anchor")
                        return
                    } else if (!item.itemData) {
                        console.log("No ItemData")
                        return
                    } else {
                        return <ItemMarker key={item.id} id={item.id} itemData={item.itemData} position={item.anchorData.object.position} scale={item.anchorData.object.scale} quaternion={item.anchorData.object.quaternion} />
                    }
                })}
            </group>
        )
    }
})