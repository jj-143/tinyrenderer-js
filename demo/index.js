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

let cameraPosition = [1, 0, 3]
let camera = new PerspectiveCamera({
  position: cameraPosition,
  viewport: [800, 800],
})
let light = {
  dir: neg(normalize([1, -0, -1])),
}
let scene = {
  light,
}
let uniform

loader.all().then(({ model, ...textures }) => {
  uniform = {
    model,
    ...textures,
    bufferWidth: camera.vW,
  }

  scene.model = model
  animate()
})

function render() {
  uniform.viewport = camera.viewport
  camera.update({ position: light.dir, perspective: 0 })

  let { model } = scene
  model.shader = new DepthShader(uniform)
  renderer.render(scene, camera, { draw: false })

  let objectToDepth = matmul4(camera.viewport, model.shader.uniM)
  let shadowBuffer = renderer.zBuffer

  camera.update({ position: cameraPosition })

  uniform.objectToDepth = objectToDepth
  model.shader = new WithShadowMapping(uniform, shadowBuffer)
  renderer.zBuffer = new Float32Array(camera.vW * camera.vH)

  renderer.render(scene, camera)
}

// rotate camera & lightDir around y-axis (up)
let deg = -Math.PI / 36
let x = 0
let z = 3

function animate() {
  render()
  ;[x, z] = [Math.cos(deg) * x - Math.sin(deg) * z, Math.sin(deg) * x + Math.cos(deg) * z]
  light.dir = [
    Math.cos(deg) * light.dir[0] - Math.sin(deg) * light.dir[2],
    light.dir[1],
    Math.sin(deg) * light.dir[0] + Math.cos(deg) * light.dir[2],
  ]
  cameraPosition = [x, 0, z]
  camera.update({ position: cameraPosition })
  requestAnimationFrame(animate)
}
