import { triangleWithZBuffer } from "./utils/drawer"
import { GouraudShader, ShaderWithTexture, TextureAndNormalMap } from "./utils/shaders"
import {
  columnVector,
  identity_4,
  inverse,
  matmul,
  mToV,
  neg,
  normalize,
  transpose,
} from "./utils/vecOps"
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
let cameraPosition = [1, 1, 3]
let cameraUp = normalize([0, 1, 0])
let cameraLookAt = [0, 0, 0]
let lightDir = neg(normalize([-1, -1, -1]))

let modelView = calcModelViewMatrix(cameraPosition, cameraUp, cameraLookAt)
//FIXME: it should be eye - center. coeff = -1 / (eye - center)
let perspective = calcPerspectiveMatrix(cameraPosition)
let viewport = calcViewportMatrix(0, 0, w, w, 255)

let combined = [viewport, perspective, modelView].reduce((acc, m) => matmul(acc, m), identity_4)

// without viewport, based on ssloy's code.
// guess I shouldn't apply viewport to direction vectors?
// using combined(light) & combinedIT(normal) generates 'greasy' look
// + this also removes brightness changes by viewport's depth value
let uniM = [perspective, modelView].reduce((acc, m) => matmul(acc, m), identity_4)
let uniMIT = inverse(transpose(uniM))

let zBuffer = [...Array(data.length).keys()].map(_ => -Infinity)

import diffuseMap from "./obj/african_head_diffuse.tga"
import nm from "./obj/african_head_nm.tga"

// render
let resourceLoaderTime = new Date()
Promise.all([parseModel(), loadTGA(diffuseMap), loadTGA(nm)]).then(
  ([[vertices, faces, vts, vns], diffuse, normalMap]) => {
    let res = {
      vertices,
      faces,
      vts,
      vns,
      diffuse,
      normalMap,
    }
    console.log("resource load: ", new Date() - resourceLoaderTime, "ms")

    let shader = new TextureAndNormalMap(combined, res, lightDir, uniM, uniMIT)

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
  },
)
