import { TinyRenderer, PerspectiveCamera } from "../src/index"
import { DepthShader, WithShadowMapping } from "../src/utils/shaders"
import { Loader } from "../src/utils/Loader"
import { matmul4, neg, normalize } from "../src/utils/vecOps"

// import model from "./obj/african_head.obj"
// import diffuse from "./obj/african_head_diffuse.tga"
// import specular from "./obj/african_head_spec.tga"
// import tangentNM from "./obj/african_head_nm_tangent.tga"

import model from "./obj/diablo3_pose.obj"
import diffuse from "./obj/diablo3_pose_diffuse.tga"
import specular from "./obj/diablo3_pose_spec.tga"
import tangentNM from "./obj/diablo3_pose_nm_tangent.tga"

let loader = new Loader()
loader.addModel("model", model)
loader.addTexture("diffuse", diffuse)
loader.addTexture("specular", specular)
loader.addTexture("normal", tangentNM)

let renderer = new TinyRenderer({ target: document.getElementById("app") })
renderer.setSize(800, 800)

let initialCameraPosition = [1, 0, 3]
let initialLightDirection = neg(normalize([1, -0, -1]))

let currentCameraPosition = initialCameraPosition
let currentLightDirection = initialCameraPosition

let camera = new PerspectiveCamera({
  position: initialCameraPosition,
  viewport: [800, 800],
})
let light = {
  dir: initialLightDirection,
}
let scene = {
  light,
}
let uniform
let depthShader, withShadowMapping

loader.all().then(({ model, ...textures }) => {
  uniform = {
    model,
    ...textures,
    bufferWidth: camera.vW,
    viewport: camera.viewport,
  }

  scene.model = model

  depthShader = new DepthShader(uniform)
  scene.model.shader = depthShader
  // withShadowMapping = new WithShadowMapping(uniform)
  // assume initial position is front-facing
  let deg = (rad * 180) / Math.PI
  slider.value = deg > 180 ? deg - 360 : deg

  playState === "PLAY" ? animate() : renderFn()
})

function render() {
  camera.update({ position: currentLightDirection, perspective: 0 })

  let { model } = scene

  model.shader = depthShader
  renderer.render(scene, camera, { clear: true, draw: false })

  let objectToDepth = matmul4(camera.viewport, model.shader.uniM)

  camera.update({ position: currentCameraPosition })

  model.shader = withShadowMapping
  model.shader.objectToDepth = objectToDepth
  model.shader.shadowBuffer = renderer.zBuffer
  renderer.zBuffer = new Float32Array(camera.vW * camera.vH)

  renderer.render(scene, camera)
}

function renderAmbient() {
  camera.update({ position: currentCameraPosition })
  renderer.renderSSAO(scene, camera)
}

let renderFn = renderAmbient

//
// rotate-y
// rendering took 400 - 700ms for Fast shader.
// 48frames for a full turn
// OR 7.5 degree per frame
// OR rotate 10.5-18.75 DEG/sec
let RAD_INC = -(2 * Math.PI) / 48
// convert to range [0 - 2*PI]
RAD_INC = (2 * Math.PI + RAD_INC) % (2 * Math.PI)
let rad = 0

// camera position
let x = 0
let z = 3

function animate() {
  renderFn()

  rad = (rad + RAD_INC) % (2 * Math.PI)
  setRotatedPosition(rad)

  camera.update({ position: currentCameraPosition })

  let deg = (rad * 180) / Math.PI
  slider.value = deg > 180 ? deg - 360 : deg

  if (playState === "PAUSE") return
  requestAnimationFrame(animate)
}

function setRotatedPosition(rad) {
  x = initialCameraPosition[0]
  z = initialCameraPosition[2]
  light.dir = initialLightDirection
  ;[x, z] = [Math.cos(rad) * x - Math.sin(rad) * z, Math.sin(rad) * x + Math.cos(rad) * z]
  light.dir = [
    Math.cos(rad) * light.dir[0] - Math.sin(rad) * light.dir[2],
    light.dir[1],
    Math.sin(rad) * light.dir[0] + Math.cos(rad) * light.dir[2],
  ]

  currentCameraPosition = [x, 0, z]
  currentLightDirection = light.dir
}

//
// simple control

let button = document.getElementById("play-pause")
let playState = "PLAY"
button.textContent = "PAUSE"

button.addEventListener("click", () => {
  playState === "PLAY" ? stopAnimate() : startAnimate()
})

let slider = document.getElementById("rot-y")
slider.addEventListener("change", e => {
  // TODO
  // currently, model's front facing and moving the camera (and light)
  // if model's position (another matrix before projection) implemented,
  // model's "pose" will be preserved while rotating camera
  let deg = (Number(slider.value) + 360) % 360
  rad = (deg / 180) * Math.PI
  setRotatedPosition(rad)

  renderFn()
})

function startAnimate() {
  playState = "PLAY"
  button.textContent = "PAUSE"
  animate()
}

function stopAnimate() {
  playState = "PAUSE"
  button.textContent = "PLAY"
}
