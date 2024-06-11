import { Mesh, Viewer, VBOGeometry, LambertMaterial } from "@xeokit/xeokit-sdk"
import {
    BlobReader,
    BlobWriter,
    TextReader,
    TextWriter,
    ZipReader,
    ZipWriter,
} from "@zip.js/zip.js"

const AUTH = `Bearer ${localStorage.getItem("token")}`
const HEADERS = {
    "Authorization": AUTH,
    "Content-Type": "application/json"
}


const viewer = new Viewer({
    canvasId: "xeokit_canvas",
    transparent: true,
    dtxEnabled: true
})

viewer.camera.eye = [-3.933, 2.855, 27.018]
viewer.camera.look = [0, 0, 0]
viewer.camera.up = [-0.018, 0.999, 0.039]

function addMaterial(component, material) {
    // const c = material.color
    // const m = new THREE.MeshBasicMaterial({
    //     side: THREE.FrontSide,
    //     color: new THREE.Color(c.r, c.g, c.b)
    // })
    // const geometry = new THREE.BufferGeometry()

    // geometry.setFromPoints()
    // geometry.setIndex()
    // geometry.computeVertexNormals()

    const c = material.Color
    new Mesh(viewer.scene, {
        geometry: new VBOGeometry(viewer.scene, {
            primitive: "triangles",
            positions: component.Geometry.Points.flatMap(x => [x.X, x.Y, x.Z]),
            indices: component.Geometry.Indices.slice(material.Start, material.Start + material.Count),
            normals: component.Geometry.Normals
        }),
        material: new LambertMaterial(viewer.scene, {
            color: [c.R, c.G, c.B],
            backfaces: false,
        })
    })
}

function addComponent(component) {
    for (const material of component.Geometry.Materials) {
        addMaterial(component, material)
    }
}

async function decompress(blob) {
    const zipFileReader = new BlobReader(blob)
    const helloWorldWriter = new TextWriter()
    const zipReader = new ZipReader(zipFileReader)
    const firstEntry = (await zipReader.getEntries()).shift()
    const text = await firstEntry.getData(helloWorldWriter)
    await zipReader.close()
    return text
}

async function addComponentType(model, componentType) {
    const response = await fetch(`http://185.177.216.241:5047/model/componentsGeometry/zip?modelName=${model}&componentTypeName=${componentType}`, {
        headers: HEADERS,
    })
    if (response.status != 200) {
        return
    }
    const data = JSON.parse(await decompress(await response.blob()))
    for (const component of data) {
        addComponent(component)
    }
}

async function addModel(model) {
    const componentTypes = await (await fetch(`http://185.177.216.241:5047/model/typeNames`, {
        method: "POST",
        body: JSON.stringify([model]),
        headers: HEADERS
    })).json()
    await Promise.all(componentTypes.map(x => addComponentType(model, x)))
}
const params = new URLSearchParams(location.search)
addModel(params.get("model"))
console.log(viewer.scene)