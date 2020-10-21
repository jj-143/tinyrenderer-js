import { triangleWithZBuffer } from "./utils/drawer"
import { FastDiffuseTangentNormalSpecular } from "./utils/shaders"
import {
  subtract,
  identity_4,
  inverse,
  matmul,
  neg,
  normalize,
  transpose,
  abs,
} from "./utils/vecOps"
import { calcModelViewMatrix, calcPerspectiveMatrix, calcViewportMatrix } from "./utils/utils"
import { loadModel, loadTGA } from "./utils/loader"

// setup
const canvas = document.getElementById("app")
const ctx = canvas.getContext("2d")
const w = canvas.width
const h = canvas.height

let imgData = ctx.getImageData(0, 0, w, h)
let data = imgData.data

// scene
let cameraPosition = [1, 1, 3]
let cameraUp = normalize([0, 1, 0])
let cameraLookAt = [0, 0, 0]
let lightDir = neg(normalize([-1, -1, -1]))

let modelView = calcModelViewMatrix(cameraPosition, cameraUp, cameraLookAt)
let perspective = calcPerspectiveMatrix(abs(subtract(cameraPosition, cameraLookAt)))
let viewport = calcViewportMatrix(0, 0, w, w, 255)

// without viewport, based on ssloy's code.
// guess I shouldn't apply viewport to direction vectors?
// using combined(light) & combinedIT(normal) generates 'greasy' look
let uniM = [perspective, modelView].reduce((acc, m) => matmul(acc, m), identity_4)
let uniMIT = inverse(transpose(uniM))
let viewportTr = transpose(viewport)

let zBuffer = [...Array(data.length).keys()].map(_ => -Infinity)

import modelHead from "./obj/african_head.obj"
import diffuseMap from "./obj/african_head_diffuse.tga"
import nm from "./obj/african_head_nm.tga"
import spec from "./obj/african_head_spec.tga"
import tangentNM from "./obj/african_head_nm_tangent.tga"

// render
let resourceLoaderTime = new Date()
Promise.all([
  loadModel(modelHead),
  loadTGA(diffuseMap),
  loadTGA(nm),
  loadTGA(spec),
  loadTGA(tangentNM),
]).then(([[vertices, faces, vts, vns], diffuse, normalMap, spec, tangentNM]) => {
  let res = {
    vertices,
    faces,
    vts,
    vns,
    diffuse,
    normalMap,
    spec,
    tangentNM,
  }
  console.log("resource load: ", new Date() - resourceLoaderTime, "ms")

  let shader = new FastDiffuseTangentNormalSpecular(res, lightDir, uniM, uniMIT)
  let coords = []

  let renderingTime = new Date()
  // little change to sig. of shader.vertex due to the resource structure
  for (let fi = 0; fi < faces.length; fi++) {
    for (let vi = 0; vi < 3; vi++) {
      coords[vi] = shader.vertex(fi, vi)
    }
    triangleWithZBuffer(...coords, shader, zBuffer, data, w, viewportTr)
  }

  console.log("rendering took: ", new Date() - renderingTime, "ms")
  ctx.putImageData(imgData, 0, 0)
})
