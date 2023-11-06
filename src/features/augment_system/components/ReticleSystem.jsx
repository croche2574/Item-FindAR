import React, { useEffect, useRef, useState, memo, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Text, Box, Billboard, ScreenSpace } from '@react-three/drei'
import { useXR, XR, toggleSession, XRButton, useHitTest } from '@react-three/xr'
import _ from 'lodash'
import * as THREE from 'three'

export function Reticle(props) {
  const { position, scale, quaternion, refObj } = props
  const gltf = useGLTF('https://gwcjylrsyylsuacdrnov.supabase.co/storage/v1/object/public/models/reticle.glb') // replace with the path to your .glb file
  const ref = useRef()

  return (
    <mesh ref={refObj} position={position} scale={scale} quaternion={quaternion} castShadow receiveShadow>
      <primitive object={gltf.scene} />
    </mesh>
  )
}

export function CuteRabbit(props) {
  const { position, scale, quaternion } = props

  const gltf = useGLTF('https://gwcjylrsyylsuacdrnov.supabase.co/storage/v1/object/public/models/cute_rabbit_model.glb')

  const object = useMemo(() => gltf.scene.clone(), [gltf])

  return (
    <mesh position={position} scale={scale} quaternion={quaternion} castShadow receiveShadow>
      <primitive object={object} />
    </mesh>
  )
}

// AR Scene
export const ARScene = memo((props) => {
  const { setPresenting, reticle, anchors, setAnchors, lastHitRef } = props
  const { gl } = useThree()
  const {
    // An array of connected `XRController`
    controllers,
    // Whether the XR device is presenting in an XR session
    isPresenting,
    // Whether hand tracking inputs are active
    isHandTracking,
    // A THREE.Group representing the XR viewer or player
    player,
    // The active `XRSession`
    session,
    // `XRSession` foveation. This can be configured as `foveation` on <XR>. Default is `0`
    foveation,
    // `XRSession` reference-space type. This can be configured as `referenceSpace` on <XR>. Default is `local-floor`
    referenceSpace
  } = useXR()

  var anchoredChildren = useRef([])
  const [dirty, setDirty] = useState(false)
  var hitMatrixRef = useRef(new THREE.Matrix4())

  const sessionStart = (event) => {
    anchoredChildren.current = []
  }
  const sessionEnd = (event) => {
    anchoredChildren.current = []
  }

  useHitTest((hitMatrix, hit) => {
    // use hitMatrix to position any object on the real life surface
    //hitMatrix.decompose(mesh.position, mesh.quaternion, mesh.scale)
    //console.log(hitMatrix, hit)

    const referenceSpace = gl.xr.getReferenceSpace()
    if (referenceSpace) {
      const pose = hit.getPose(referenceSpace)
      lastHitRef.current = hit
    }

    // update the reticle to show the position of the last anchor
    hitMatrix.decompose(reticle.current.position, reticle.current.quaternion, reticle.current.scale)
    hitMatrixRef.current = hitMatrix
    //}
  })

  useEffect(() => {
    console.log(player.quaternion, session)
  }, [player, session])

  useEffect(() => {
    if (session) {
      session.addEventListener('select', onSelect)
    }
    return () => {
      if (session) {
        session.removeEventListener('select', onSelect)
      }
    }
  }, [session])

  useEffect(() => {
    gl.xr.addEventListener('sessionstart', sessionStart)

    gl.xr.addEventListener('sessionend', sessionEnd)

    return () => {
      gl.xr.removeEventListener('sessionstart', sessionStart)
      gl.xr.removeEventListener('sessionend', sessionEnd)
    }
  }, [])

  useEffect(() => {
    console.log('total items: ', anchoredChildren.current.length)
  }, [dirty])

  function onSelect() {
    if (lastHitRef.current) {
      lastHitRef.current.createAnchor().then(
        (anchor) => {
          console.log('anchor: ', anchor)

          //var _anchors = _.cloneDeep(anchoredChildren) // eslint-disable-line no-eval
          const referenceSpace = gl.xr.getReferenceSpace()
          const pos = lastHitRef.current.getPose(referenceSpace)
          console.log(gl.xr)
          var matrix = new THREE.Matrix4()
          const frame = gl.xr.getFrame()
          if (frame) {
            // uses anchor space
            const anchorPose = frame.getPose(anchor.anchorSpace, referenceSpace)

            matrix.fromArray(anchorPose.transform.matrix)
          } else {
            matrix = hitMatrixRef.current
          }
          //
          anchoredChildren.current.push({
            anchor: anchor,
            object: {
              position: new THREE.Vector3().setFromMatrixPosition(matrix),
              scale: new THREE.Vector3()
                .setFromMatrixScale(matrix)
                .clamp(new THREE.Vector3(0.001, 0.001, 0.001), new THREE.Vector3(0.01, 0.01, 0.01)),
              quaternion: new THREE.Quaternion().setFromRotationMatrix(matrix)
            }
          })

          console.log(anchoredChildren.current, anchoredChildren.current[0].object)
          setDirty((prevValue) => !prevValue)
          //anchorPoints.current.push({ anchor: anchor, object: reticle })
        },
        (error) => {
          console.error('Could not create anchor: ' + error)
        }
      )
    }
  }

  return (
    <group>
      {anchoredChildren.current.length > 0 &&
        anchoredChildren.current.map((item, index) => {
          console.log(index, item.object)
          return <CuteRabbit key={index} position={item.object.position} scale={item.object.scale} quaternion={item.object.quaternion} />
        })}
    </group>
  )
})

export function BoxText(props) {
    const { position, anchors } = props
    return (
      <ScreenSpace
        //position={position}
        depth={0.5} // Distance from camera
      >
        <Billboard follow={true}>
          <Box position={position} args={[0.8, 0.15, 0.02]}>
            <meshStandardMaterial color={0x000000} />
            <Text position={[0, 0.01, 0.05]} fontSize={0.1} color="#f0f" anchorX="center" anchorY="middle">
              {`anchors: ${1}`}
            </Text>
          </Box>
        </Billboard>
      </ScreenSpace>
    )
  }