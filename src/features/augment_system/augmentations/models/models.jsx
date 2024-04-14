import React, { memo } from 'react'
import { useGLTF } from '@react-three/drei'
import { MeshBasicMaterial } from 'three'

import alertPath from './alert.glb'
import neutralPath from './neutral.glb'
import safePath from './safe.glb'
import warnPath from './warn.glb'

export const AlertModel = memo((props) => {
    const { nodes } = useGLTF(alertPath.substring(alertPath.indexOf("/models")))
    const newMat = new MeshBasicMaterial({ color: 0xff7800, opacity: props.opacity, transparent: true })
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.obj_0.geometry}
                material={newMat}
            />
        </group>
    )
})

export const NeutralModel = memo((props) => {
    const { nodes } = useGLTF(neutralPath.substring(neutralPath.indexOf("/models")))
    const newMat = new MeshBasicMaterial({ color: 0x808080, opacity: props.opacity, transparent: true })
    //console.log(neutralPath.substring(neutralPath.indexOf("/models")))
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.obj_0.geometry}
                material={newMat}
            />
        </group>
    )
})

export const SafeModel = memo((props) => {
    const { nodes } = useGLTF(safePath.substring(safePath.indexOf("/models")))
    const newMat = new MeshBasicMaterial({ color: 0x32CD32, opacity: props.opacity, transparent: true })
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.obj_0.geometry}
                material={newMat}
            />
        </group>
    )
})

export const WarnModel = memo((props) => {
    const { nodes } = useGLTF(warnPath.substring(warnPath.indexOf("/models")))
    const newMat = new MeshBasicMaterial({ color: 0xff0f0f, opacity: props.opacity, transparent: true })
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.obj_0.geometry}
                material={newMat}
            />
        </group>
    )
})

useGLTF.preload(alertPath.substring(alertPath.indexOf("/models")))
useGLTF.preload(neutralPath.substring(neutralPath.indexOf("/models")))
useGLTF.preload(safePath.substring(safePath.indexOf("/models")))
useGLTF.preload(warnPath.substring(warnPath.indexOf("/models")))