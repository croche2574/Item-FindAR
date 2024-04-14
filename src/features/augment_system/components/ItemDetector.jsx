import { useInterval } from "../hooks/useInterval"
import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useFrame, RootState, useThree } from "@react-three/fiber";

const Detector = memo((props) => {
    const socket = useMemo(() => new Worker(new URL("../workers/sendImg", import.meta.url)), [])
    const [socketStatus, setSocketStatus] = useState("Closed")
    const timeout = 1000
    const height = Math.round((window.screen.height * window.devicePixelRatio) / 10) * 10
    const width = Math.round((window.screen.width * window.devicePixelRatio) / 10) * 10

    var context = useThree((state) => { return state }).gl.getContext()
    const framebuffer = useRef(context.createFramebuffer())
    const frameImg = useRef()
    const [cameraViewport, setCameraViewport] = useState({})
    const intrinsicsPrinted = useRef({})

    //console.log(`Height: ${height}px, Width: ${width}px, Ratio: ${window.devicePixelRatio}`)
    useEffect(() => {
        socket.postMessage({ mode: "init", height: height, width: width })
        props.setImageShape({ height: height, width: width })
    }, [])

    useEffect(() => () => socket.terminate(), [])

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
        // Print the calculated intrinsics, but once per unique value to
        // avoid log spam. These can change every frame for some XR devices.
        const intrinsicString = (
            "intrinsics: u0=" +u0 + " v0=" + v0 + " ax=" + ax + " ay=" + ay +
                " gamma=" + gamma + " for viewport {width=" +
                viewport.width + ",height=" + viewport.height + ",x=" +
                viewport.x + ",y=" + viewport.y + "}");
        if (!intrinsicsPrinted.current[intrinsicString]) {
            console.log("projection:", Array.from(projectionMatrix).join(", "));
            console.log(intrinsicString);
            intrinsicsPrinted.current[intrinsicString] = true;
        }
    }
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
                context.bindFramebuffer(context.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);
                context.clearColor(0, 0, 0, 0);
                // Clear the framebuffer
                context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
                context.enable(context.DEPTH_TEST);

                let view = viewerPose.views[0]
                let viewport = session.renderState.baseLayer.getViewport(view)
                context.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                getCameraIntrinsics(view.projectionMatrix, viewport);
                
                if (viewerPose.views[0].camera) {
                    setCameraViewport({
                        width: view.camera.width,
                        height: view.camera.height,
                        x: 0,
                        y: 0})
                    getCameraIntrinsics(view.projectionMatrix, cameraViewport);
                }
                //console.log("get frame")
                //console.log(viewerPose.views[0])
                let glTex = glBinding.getCameraImage(view.camera)
                //const texture_bytes = view.camera.width * view.camera.height * 4
                const texture_bytes = width * height * 4
                if (!frameImg.current || frameImg.current.length != texture_bytes) {
                    frameImg.current = new Uint8Array(texture_bytes)
                }
                frameImg.current.fill(0)
                //console.log(framebuffer.current)
                context.bindTexture(context.TEXTURE_2D, glTex)
                context.bindFramebuffer(context.FRAMEBUFFER, framebuffer.current)
                context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, glTex, 0);
                
                if (context.checkFramebufferStatus(context.FRAMEBUFFER) == context.FRAMEBUFFER_COMPLETE) {
                    //context.readPixels(0, 0, view.camera.width, view.camera.height, context.RGBA, context.UNSIGNED_BYTE, pixels.current)
                    context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, frameImg.current)
                    const e = context.getError()
                    if (e != 0) {
                        console.warn("GL Error: ", e)
                    }
                } else {
                    console.warn("Framebuffer incomplete!");
                }
                context.bindFramebuffer(context.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)
                state.gl.setRenderTarget(_surface)
                //console.log(frameImg.current)
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
                socket.postMessage({ mode: "send", buff: frameImg.current.buffer, viewport: cameraViewport }, [frameImg.current.buffer])
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