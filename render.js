import * as THREE from 'three'
import { FlyControls } from 'three/addons/controls/FlyControls.js'
import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js"

const AUTH = `Bearer ${localStorage.getItem("token")}`
const HEADERS = {
    "Authorization": AUTH,
    "Content-Type": "application/json"
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(-1.6, 2, 0)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new FlyControls(camera, renderer.domElement)
controls.movementSpeed = 1
controls.rollSpeed = 0.25
scene.add(new THREE.AxesHelper(100))
scene.rotation.set(Math.PI / 4 * 3, Math.PI, 0)
const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)
    const delta = clock.getDelta()
    renderer.render(scene, camera)
    controls.update(delta)
}

function addMaterial(component, material) {
    const c = material.Color
    const m = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        color: new THREE.Color(c.R, c.G, c.B)
    })
    const geometry = new THREE.BufferGeometry()

    geometry.setFromPoints(component.Geometry.Points.map(x => ({ x: x.X, y: x.Y, z: x.Z })))
    geometry.setIndex(component.Geometry.Indices.slice(material.Start, material.Start + material.Count))
    //geometry.computeVertexNormals()

    const mesh = new THREE.Mesh(geometry, m)
    scene.add(mesh)
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
        headers: HEADERS
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
    console.log("FINISH")
}
const params = new URLSearchParams(location.search)
const startTime = performance.now()
addModel(params.get("model")).then(() => {
    const endTime = performance.now()
    console.log("FINISHED. DURATION: " + (endTime - startTime) / 1000 + "s")
}).then(animate)
