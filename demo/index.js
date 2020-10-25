import { TinyRenderer, PerspectiveCamera } from "../src/index"
import { FastDiffuseTangentNormalSpecular } from "../src/utils/shaders"
import { Loader } from "../src/utils/Loader"
import { neg, normalize } from "../src/utils/vecOps"

import model from "./obj/african_head.obj"
import diffuse from "./obj/african_head_diffuse.tga"
import specular from "./obj/african_head_spec.tga"
import tangentNM from "./obj/african_head_nm_tangent.tga"

let loader = new Loader()
loader.addModel("model", model)
loader.addTexture("diffuse", diffuse)
loader.addTexture("specular", specular)
loader.addTexture("normal", tangentNM)

let renderer = new TinyRenderer({ target: document.getElementById("app") })
renderer.setSize(800, 800)

let initialCameraPos = [0, 0, 3]
let initialLightDir = neg(normalize([-3, -2, -3]))

let camera = new PerspectiveCamera({
  position: initialCameraPos,
  viewport: [800, 800],
})
let light = {
  dir: initialLightDir,
}

let scene = {
  light,
}

loader.all().then(({ model, ...textures }) => {
  let uniform = {
    model,
    ...textures,
  }
  model.shader = new FastDiffuseTangentNormalSpecular(uniform)
  scene.model = model

  renderer.render(scene, camera)

  // assume initial position is front-facing
  let deg = (rad * 180) / Math.PI
  slider.value = deg > 180 ? deg - 360 : deg
  if (playState === "PLAY") animate()
})

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
  rad = (rad + RAD_INC) % (2 * Math.PI)
  setRotatedPosition(rad)

  camera.update({ position: [x, 0, z] })
  renderer.render(scene, camera)

  let deg = (rad * 180) / Math.PI
  slider.value = deg > 180 ? deg - 360 : deg

  if (playState === "PAUSE") return
  requestAnimationFrame(animate)
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

  camera.update({ position: [x, 0, z] })
  renderer.render(scene, camera)
})

function setRotatedPosition(rad) {
  x = initialCameraPos[0]
  z = initialCameraPos[2]
  light.dir = initialLightDir
  ;[x, z] = [Math.cos(rad) * x - Math.sin(rad) * z, Math.sin(rad) * x + Math.cos(rad) * z]
  light.dir = [
    Math.cos(rad) * light.dir[0] - Math.sin(rad) * light.dir[2],
    light.dir[1],
    Math.sin(rad) * light.dir[0] + Math.cos(rad) * light.dir[2],
  ]
}

function startAnimate() {
  playState = "PLAY"
  button.textContent = "PAUSE"
  animate()
}

function stopAnimate() {
  playState = "PAUSE"
  button.textContent = "PLAY"
}
