import { useInterval } from "../hooks/useInterval"
import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useFrame, RootState, useThree } from "@react-three/fiber";

const Detector = memo((props) => {
    const socket = useMemo(() => new Worker(new URL("../workers/sendImg", import.meta.url)), [])
    const frameImg = useRef()
    const [socketStatus, setSocketStatus] = useState("Closed")
    const timeout = 1000
    const height = Math.round((window.screen.height * window.devicePixelRatio) / 10) * 10
    const width = Math.round((window.screen.width * window.devicePixelRatio) / 10) * 10

    var context = useThree((state) => { return state }).gl.getContext()
    var framebuffer = context.createFramebuffer()

    //console.log(`Height: ${height}px, Width: ${width}px, Ratio: ${window.devicePixelRatio}`)
    useEffect(() => {
        socket.postMessage({ mode: "init", height: height, width: width })
        props.setImageShape({ height: height, width: width })
    }, [])

    useEffect(() => () => socket.terminate(), [])
    /**
     * @param {RootState} state
     * @param {number} delta
     * @param {XRFrame} xrFrame
     */
    useFrame((state, delta, xrFrame) => { // Get the image from the frame
        if (state.gl.xr.isPresenting) { // Check if session active
            const _surface = state.gl.getRenderTarget()
            let session = state.gl.xr.getSession()
            let context = state.gl.getContext()
            let glBinding = new XRWebGLBinding(session, context)
            //console.log(glBinding)
            let viewerPose = xrFrame.getViewerPose(state.gl.xr.getReferenceSpace())
            //console.log(state.gl.xr.getReferenceSpace())
            if (props.enabled && glBinding && viewerPose) {
                //console.log("get frame")
                //console.log(viewerPose.views[0])
                let glTex = glBinding.getCameraImage(viewerPose.views[0].camera)

                context.bindFramebuffer(context.FRAMEBUFFER, framebuffer)
                context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, glTex, 0)
                //console.log(state.size.width + ', ' + state.size.height)
                let data = new Uint8Array(width * height * 4);
                context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, data)
                state.gl.setRenderTarget(_surface)
                frameImg.current = data
            }
        }
    })

    useEffect(() => {
        console.log('send classes: ', props.classes)
        if (props.classes) { socket.postMessage({ mode: "classes", classes: props.classes }) }
    }, [props.classes])

    useInterval(() => { // Send image to be processed on timeout
        if (frameImg.current && socketStatus == "Open") {
            //console.log("sending frame")
            //console.log(getWebSocket())
            try {
                socket.postMessage({ mode: "send", buff: frameImg.current.buffer }, [frameImg.current.buffer])
            } catch (error) {
                console.log("Frame detached.")
            }
        }
    }, timeout)

    useEffect(() => { // Receive coords from server
        socket.onmessage = (e) => {
            console.log(e.data)
            switch (e.data) {
                case "Open":

                    setSocketStatus(e.data)
                    break
                case "Closed":
                    console.log(e.data)
                    setSocketStatus(e.data)
                    break
                case "\"[]\"":
                    console.log("set empty")
                    props.setDetectedItems([])
                    break
                default:
                    props.setDetectedItems((state) => {
                        return props.dataProcessor(JSON.parse(e.data), state)
                    })
                    break
            }
        }
    }, [socket])
})

export const ItemDetector = memo((props) => {
    const detectProc = useCallback((data, state) => {
        let newData = JSON.parse(data)
        let temp = []
        console.log("fetched data", newData)
        console.log("item props", props.detectedItems)
        if (state.length === 0) {
            temp = newData
        } else {
            for (var newObj of newData) {
                console.log("new ob", newObj)
                let tempObj = null
                for (const obj of state) {
                    if (newObj.id === obj.id) {
                        tempObj = obj
                    }
                }
                if (tempObj) {
                    temp.push(tempObj)
                } else {
                    temp.push(newObj)
                }
            }
        }

        console.log("edited data", temp)
        return temp
    }, [])

    return (
        <Detector enabled={props.enabled} classes={props.classes} setDetectedItems={props.setDetectedItems} setImageShape={props.setImageShape} dataProcessor={detectProc} />
    )
})