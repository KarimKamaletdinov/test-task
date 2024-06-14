import { Viewer, WebIFCLoaderPlugin } from "@xeokit/xeokit-sdk"
import Stats from 'stats.js'
import { applyTreeView } from './tree-view'
import { applyCanvasActions } from './canvas-actions'
import * as WebIFC from "https://cdn.jsdelivr.net/npm/web-ifc@0.0.51/web-ifc-api.js"

console.log("AA")
const viewer = new Viewer({
    canvasId: "xeokit_canvas",
    transparent: true,
    dtxEnabled: true
})

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

console.log(viewer.scene)
viewer.scene.on("tick", e => {
    stats.begin()
    stats.end()
})
const upload = document.querySelector("input")
upload.addEventListener("change", async () => {
    const file = await upload.files[0].arrayBuffer()
    const IfcAPI = new WebIFC.IfcAPI()

    IfcAPI.SetWasmPath("https://cdn.jsdelivr.net/npm/web-ifc@0.0.51/")

    await IfcAPI.Init()

    const ifcLoader = new WebIFCLoaderPlugin(viewer, {
        WebIFC,
        IfcAPI
    })

    const sceneModel = ifcLoader.load({
        id: "myModel",
        edges: true,
        ifc: file
    })
    sceneModel.on("loaded", () => {
        viewer.cameraFlight.jumpTo(sceneModel)
    })

    sceneModel.on("error", e => {
        console.log(e)
    })
})
const treeView = applyTreeView(viewer)
applyCanvasActions(viewer, treeView)
