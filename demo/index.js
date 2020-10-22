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

let camera = new PerspectiveCamera({
  position: [1, 1, 3],
  viewport: [800, 800],
})
let light = {
  dir: neg(normalize([-4, -2, -3])),
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
  animate()
})

// just rotate around y-axis (up)
let distance = 3
let deg = 0

function animate() {
  renderer.render(scene, camera)
  let x = Math.sin(deg) * distance
  let z = Math.cos(deg) * distance
  camera.update({ position: [x, 0, z] })
  deg += Math.PI / 36
  requestAnimationFrame(animate)
}
