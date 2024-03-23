import React, { useEffect, useState, memo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useReadCypher } from 'use-neo4j'
import { useHitTest } from '../hooks/useHitTest'
import { ItemMarker } from './ItemMarker'

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
                    item.itemData.allergens = {}
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
                                    item.itemData.allergens[endNode.properties.name] = { may: false }
                                    break

                                case 'MAY_CONTAIN_ALLERGEN':
                                    item.itemData.allergens[endNode.properties.name] = { may: true }
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
                        return <ItemMarker key={item.id} id={item.id} searchMode={props.searchMode} itemData={item.itemData} settings={props.settings} position={item.anchorData.object.position} scale={item.anchorData.object.scale} quaternion={item.anchorData.object.quaternion} />
                    }
                })}
            </group>
        )
    }
})