import { Viewer, XKTLoaderPlugin } from "@xeokit/xeokit-sdk"
import Stats from 'stats.js'
import { applyTreeView } from './tree-view'
import { applyCanvasActions } from './canvas-actions'


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

    const ifcLoader = new XKTLoaderPlugin(viewer)

    const sceneModel = ifcLoader.load({
        id: "myModel",
        edges: true,
        xkt: file
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
