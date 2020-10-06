import { triangleWithZBuffer } from "./utils/drawer"
import { GouraudShader, ShaderWithTexture } from "./utils/shaders"
import { identity_4, matmul, neg, normalize } from "./utils/vecOps"
import { calcModelViewMatrix, calcPerspectiveMatrix, calcViewportMatrix } from "./utils/utils"
import { parseModel } from "./utils/parser"

import { loadTGA } from "./utils/loader"

// setup
const canvas = document.getElementById("app")
const ctx = canvas.getContext("2d")
const w = canvas.width
const h = canvas.height

let imgData = ctx.getImageData(0, 0, w, h)
let data = imgData.data

// scene
let cameraPosition = [0, 0, 4]
let cameraUp = normalize([0, 1, 0])
let cameraLookAt = [0, 0, 0]
let lightDir = neg(normalize([0, 0, -1]))

let modelView = calcModelViewMatrix(cameraPosition, cameraUp, cameraLookAt)
let perspective = calcPerspectiveMatrix(cameraPosition)
// FIXME: the depth resolution affects brightness now.
// might need normalizing value somewhere.
let viewport = calcViewportMatrix(0, 0, w, w, w / 2)

let combined = [viewport, perspective, modelView].reduce((acc, m) => matmul(acc, m), identity_4)

let zBuffer = [...Array(data.length).keys()].map(_ => -Infinity)

import diffuseMap from "./obj/african_head_diffuse.tga"

// render
let resourceLoaderTime = new Date()
Promise.all([parseModel(), loadTGA(diffuseMap)]).then(([[vertices, faces, vts, vns], diffuse]) => {
  let res = {
    vertices,
    faces,
    vts,
    vns,
    diffuse,
  }
  console.log("resource load: ", new Date() - resourceLoaderTime, "ms")

  let shader = new ShaderWithTexture(combined, res, lightDir)

  let renderingTime = new Date()

  // little change to sig. of shader.vertex due to the resource structure
  for (let fi = 0; fi < faces.length; fi++) {
    let coords = []
    for (let vi = 0; vi < 3; vi++) {
      coords[vi] = shader.vertex(fi, vi)
    }
    triangleWithZBuffer(...coords, shader, zBuffer, data, w)
  }

  console.log("rendering took: ", new Date() - renderingTime, "ms")
  ctx.putImageData(imgData, 0, 0)
})
