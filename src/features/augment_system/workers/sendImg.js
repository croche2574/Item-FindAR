import { Image } from 'imagescript'

class WebSocketClient {
    #reconnectInterval
    #reconnected

    constructor(url, debug = true) {
        this.#reconnectInterval = 5000
        this.#reconnected = false
        this.debug = debug
        this.url = url
        this.openSocket = false
    }

    onopen = (e) => { this.openSocket = true }
    onclose = (e) => { this.openSocket = false }
    onmessage = (e) => { console.log(e) }
    onerror = (e) => { console.log(e) }

    open = () => {
        var that = this
        this.instance = new WebSocket(this.url)

        this.instance.onopen = (ev) => {
            if (that.#reconnected && that.debug) {
                console.log('[WS]: Reconnected.')
            }
            self.postMessage({mode: 'status', status: "Open"})
            that.onopen(ev)
        }

        this.instance.onmessage = (data, flags) => {
            that.onmessage(data, flags)
        }

        this.instance.onclose = (e) => {
            console.log(e)
            switch (e) {
                case 1000:
                    if (that.debug) {
                        console.log('[WS]: Closed.')
                        self.postMessage({mode: 'status', status: "Closed"})
                    }
                    break
                default:
                    self.postMessage({mode: 'status', status: "Closed"})
                    that.reconnect(e)
                    break
            }
            that.onclose()
        }

        this.instance.onerror = (error) => {
            switch (error.code) {
                // Try and reconnect
                case 'ECONNREFUSED':
                    that.reconnect();
                    break;

                // Otherwise run error
                default:
                    that.onerror(error.code);
                    break;
            }
        }
    }

    sendRAW = (data, option) => {
        try {
            this.instance.send(data, option)
        } catch (e) {
            this.instance.emit('error', e)
        }
    }

    waitForOpen = (content) => {
        //console.log(`wait: ${content}`)
        setTimeout(() => {
            if (this.instance.readyState === 1) {
                //console.log(`Opened. Content: ${content}`)
                this.instance.send(new Blob([content]))
                return
            } else {
                console.log("Waiting to open")
                this.waitForOpen(content)
            }
        }, 5, [content])
    }

    send = (content) => {
        //console.log(`send: ${content}`)
        this.waitForOpen(content)
    }

    reconnect = (e) => {
        var that = this

        if (that.debug) {
            console.log(`[WS]: Reconnecting in ${this.#reconnectInterval / 1000} seconds.`)
        }

        setTimeout(() => {
            // Log reconnecting
            if (that.debug) {
                console.log("[WS]: Reconnecting...");
            }

            // Define has reconnected
            that.#reconnected = true;

            // Try and open the URL
            that.open(that.url);

        }, this.#reconnectInterval)
    }
}

var client = new WebSocketClient(import.meta.env.VITE_BACKEND_ADDRESS)

client.onmessage = (e) => {
    console.log(e)
    self.postMessage({mode: 'coords', payload: e.data})
}

client.open()

export class sendImg {
    constructor() {
        this._height = 0
        this._width = 0
        this.resizedHeight = 0
        this.resizedWidth = 0
        this._viewport = {}
    }

    set height(val) {
        this._height = val
    }

    set width(val) {
        this._width = val
    }

    set viewport(val) {
        this._viewport = val
    }

    init() {
        let hPercent = 640 / this._height
        let wPercent = 640 / this._width
        console.log(`hPercent: ${hPercent}, wPercent: ${wPercent}`)
        let percent = hPercent < wPercent ? hPercent : wPercent
        this.resizedHeight = ~~(this._height * percent)
        this.resizedWidth = ~~(this._width * percent)
        let initMessage = JSON.stringify({
            "height": (this.resizedHeight),
            "width": (this.resizedWidth)
        })
        console.log(initMessage)
        client.send(initMessage)
    }

    send(img) {
        let image = new Image(this._width, this._height)
        image.bitmap.set(img)
        image.crop(0, 0, this._viewport.width, this._viewport.height)
        image.contain(640, 640)
        client.send(image.bitmap)
    }

    sendClasses(class_list) {
        const message = JSON.stringify({
            classes: class_list
        })
        console.log("message", message)
        client.send(message)
    }
}

const imageSender = new sendImg()

self.onmessage = (msg) => {
    let m = msg
    //console.log(msg.data)
    switch (m.data.mode) {
        case "init":
            imageSender.height = m.data.height
            imageSender.width = m.data.width
            imageSender.init()
            break
        case "send":
            imageSender.viewport = m.data.viewport
            imageSender.send(new Uint8Array(m.data.buff))
            self.postMessage({mode: 'buffer', payload: m.data.buff}, [m.data.buff])
            break
        case "classes":
            imageSender.sendClasses(m.data.classes)
            break
    }
}