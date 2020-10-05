import { getVF, parseModel, read } from "./parser"

import TGALoader from "tga-js"
import {
  columnVector,
  dot,
  cross,
  normalize,
  subtract,
  neg,
  matmul,
  identity_4,
  mToV,
  transpose,
  inverse,
} from "./vecOps"
import { calcBC, calcModelViewMatrix, calcPerspectiveMatrix, calcViewportMatrix } from "./utils"

export function putPixel(x, y, data, rgba, width) {
  let pos = parseInt(width - 1 - y) * width + parseInt(x)
  data[pos * 4] = rgba[0]
  data[pos * 4 + 1] = rgba[1]
  data[pos * 4 + 2] = rgba[2]
  data[pos * 4 + 3] = 255
  // data[pos * 4 + 3] = rgba[3] ?? data[pos * 4 + 3]
}

// lightDir is used as negative value of it's original.
// and it's equivalent of directional plane light source.
// the neg'ed value is used in calculation as light after
// reflection at the model's surface.
let lightDir = neg(normalize([0, 0, -1]))

//TODO: light도 transform 해야 하나 해서 11시 방향으로 해준것. [-1, 0, -1]
// 근데 정작 계산시 노말들은 변형 후 화면을 바라보는 방향으로 변화된거고
// 그냥 화면방향 (직진 [0, 0, -1]) 하면 화면방향 정면으로 빛 방향 (즉 얼굴 측면방향으로 밝게)
// 되야되는데 이렇게 해야정면에서 준것처럼 나온다.
function triangleWithZBuffer(t0, t1, t2, zBuffer, data, color, width, diffData, normals, lightDir) {
  let bbmin = [
    Math.max(0, parseInt(Math.min(t0[0], t1[0], t2[0]))),
    Math.max(0, parseInt(Math.min(t0[1], t1[1], t2[1]))),
  ]
  let bbmax = [
    Math.min(width, parseInt(Math.max(t0[0], t1[0], t2[0]))),
    Math.min(width, parseInt(Math.max(t0[1], t1[1], t2[1]))),
  ]

  for (let x = bbmin[0]; x <= bbmax[0]; x++) {
    for (let y = bbmin[1]; y <= bbmax[1]; y++) {
      let bc = calcBC(t0, t1, t2, x, y)

      if (bc[0] < 0 || bc[1] < 0 || bc[2] < 0) continue

      let z = dot([t0[2], t1[2], t2[2]], bc)
      let bufferIdx = (width - 1 - y) * width + x
      if (zBuffer[bufferIdx] > z) continue

      zBuffer[bufferIdx] = z

      let intensity = dot(varyingIntensity, bc)

      let u = parseInt(
        dot(
          diffData.vt.map(k => k[0]),
          bc,
        ),
      )
      let v = parseInt(
        dot(
          diffData.vt.map(k => k[1]),
          bc,
        ),
      )

      let k = 4 * (u + (1023 - v) * 1024)

      data[bufferIdx * 4] = diffData.imageData[k] * intensity
      data[bufferIdx * 4 + 1] = diffData.imageData[k + 1] * intensity
      data[bufferIdx * 4 + 2] = diffData.imageData[k + 2] * intensity
      data[bufferIdx * 4 + 3] = 255
    }
  }
}

//TODO: separate data loader vs drawer.
export function drawModelWithZBuffer(data, color, width, diffuse) {
  let resourceLoaderTime = new Date()

  let diffuseLoad =
    diffuse &&
    new Promise(resolve => {
      const tgaLoader = new TGALoader()
      tgaLoader.open(diffuse, () => {
        resolve({
          imageData: tgaLoader.getImageData().data,
          header: tgaLoader.header,
        })
      })
    })

  let modelLoad = parseModel()

  return Promise.all([modelLoad, diffuseLoad]).then(([[vertices, faces, vts, vns], diff]) => {
    console.log("resource load: ", new Date() - resourceLoaderTime, "ms")

    let renderTime = new Date()

    let zBuffer = [...Array(data.length).keys()].map(_ => -Infinity)
    let diffSize = [diff.header.width, diff.header.height]
    let diffData = {
      imageData: diff.imageData,
      vt: [],
    }

    let cameraPosition = [0, 0, 4]
    let cameraUp = normalize([0, 1, 0])
    let cameraLookAt = [0, 0, 0]

    let modelView = calcModelViewMatrix(cameraPosition, cameraUp, cameraLookAt)
    let perspective = calcPerspectiveMatrix(cameraPosition)

    // FIXME: the depth resolution affects brightness now.
    // might need normalizing value somewhere.
    let viewport = calcViewportMatrix(0, 0, width, width, width / 2)

    let combined = [viewport, perspective, modelView].reduce((acc, m) => matmul(acc, m), identity_4)
    // using transposed value below.
    let combinedNormalTr = inverse(combined)

    for (let f of faces) {
      let [t0, t1, t2] = f.v.map(vi => mToV(matmul(combined, columnVector([...vertices[vi], 1]))))
      let normals = matmul(
        f.v.map(vi => [...vns[vi], 0]),
        combinedNormalTr,
      ).map(n => normalize(n.slice(0, 3)))

      // matmul is not faster in here, and avoiding flatten and transpose
      let varyingIntensity = normals.map(n => Math.max(0, dot(n, lightDir)))

      let [vt0, vt1, vt2] = f.vt.map(vti => vts[vti].map((v, i) => v * diffSize[i]))
      diffData.vt[0] = vt0
      diffData.vt[1] = vt1
      diffData.vt[2] = vt2

      triangleWithZBuffer(t0, t1, t2, zBuffer, data, color, width, diffData, varyingIntensity)
    }
    console.log("rendering :", new Date() - renderTime, "ms")
  })
}

//
// Previous lessons, attempts
//

function line1(p1, p2, data, rgba, width) {
  let [x1, y1] = p1
  let [x2, y2] = p2
  let steep = false
  if (x1 > x2) {
    let tmp = [x1, y1]
    ;[x1, y1] = [x2, y2]
    ;[x2, y2] = tmp
  }

  if (Math.abs(x2 - x1) < Math.abs(y2 - y1)) {
    ;[x1, y1] = [y1, x1]
    ;[x2, y2] = [y2, x2]
    steep = true
  }

  for (let x = x1; x <= x2; x++) {
    let y = Math.round(((y2 - y1) / (x2 - x1)) * (x - x1) + y1)
    if (steep) {
      putPixel(y, x, data, rgba, width)
    } else {
      putPixel(x, y, data, rgba, width)
    }
  }
}

function line2(p1, p2, data, rgba, width) {
  let [x1, y1] = p1
  let [x2, y2] = p2
  let steep = false
  if (x1 > x2) {
    let tmp = [x1, y1]
    ;[x1, y1] = [x2, y2]
    ;[x2, y2] = tmp
  }

  if (Math.abs(x2 - x1) < Math.abs(y2 - y1)) {
    ;[x1, y1] = [y1, x1]
    ;[x2, y2] = [y2, x2]
    steep = true
  }
  let a = (y2 - y1) / (x2 - x1)

  for (let x = x1; x <= x2; x++) {
    let y = Math.round(a * (x - x1) + y1)
    if (steep) {
      putPixel(y, x, data, rgba, width)
    } else {
      putPixel(x, y, data, rgba, width)
    }
  }
}

function line3(p1, p2, data, rgba, width) {
  let [x1, y1] = p1
  let [x2, y2] = p2
  let steep = false

  if (Math.abs(x2 - x1) < Math.abs(y2 - y1)) {
    ;[x1, y1] = [y1, x1]
    ;[x2, y2] = [y2, x2]
    steep = true
  }
  if (x1 > x2) {
    let tmp = [x1, y1]
    ;[x1, y1] = [x2, y2]
    ;[x2, y2] = tmp
  }
  let derror = Math.abs((y2 - y1) / (x2 - x1))
  let error = 0
  let y = parseInt(y1)

  for (let x = parseInt(x1); x <= x2; x++) {
    if (steep) {
      putPixel(y, x, data, rgba, width)
    } else {
      putPixel(x, y, data, rgba, width)
    }

    error += derror
    if (error > 0.5) {
      y += y2 > y1 ? 1 : -1
      error -= 1
    }
  }
}

export { line3 as line }

function drawModel(data, width, color) {
  return read().then(lines => {
    let [vertices, faces] = getVF(lines, width / 2)

    for (let f of faces) {
      let [v1, v2, v3] = f.v.map(vi => vertices[vi])
      let p1 = v1.slice(0, 2).map(k => ((1 + k) * width) / 2)
      let p2 = v2.slice(0, 2).map(k => ((1 + k) * width) / 2)
      let p3 = v3.slice(0, 2).map(k => ((1 + k) * width) / 2)

      let v13 = subtract(v3, v1)
      let v12 = subtract(v2, v1)

      let normal = cross(v13, v12)
      normal = normalize(normal)

      let intensity = dot(normal, lightDir)
      if (intensity > 0) {
        color[3] = 255 * intensity
        triangle(p1, p2, p3, data, color, width)
      }
    }
  })
}

/**
 * for div by zero in either parts,
 * the while clause is not executed since t1.y == t0.y
 * and t2.y == t1.y, repectively.
 */
function triangleOldMethod(t0, t1, t2, data, color, width) {
  // what if 3 pts lie on a single line?
  ;[t0, t1, t2] = [t0, t1, t2].sort((a, b) => a[1] - b[1])

  let a1 = Math.abs((t1[0] - t0[0]) / (t1[1] - t0[1]))
  let a2 = Math.abs((t2[0] - t0[0]) / (t2[1] - t0[1]))
  let e1 = 0
  let d1 = t1[0] > t0[0] ? 1 : -1
  let d2 = t2[0] > t0[0] ? 1 : -1
  let e2 = 0

  let y = t0[1]
  let x1 = t0[0]
  let x2 = t0[0]
  while (y < t1[1]) {
    line([x1, y], [x2, y], data, color, width)
    e1 += a1
    while (e1 >= 0.5) {
      x1 += d1
      e1 -= 1
    }
    e2 += a2
    while (e2 >= 0.5) {
      x2 += d2
      e2 -= 1
    }
    y += 1
  }

  a1 = Math.abs((t2[0] - t1[0]) / (t2[1] - t1[1]))
  d1 = t2[0] > t1[0] ? 1 : -1
  e1 = 0
  x1 = t1[0]

  while (y < t2[1]) {
    line([x1, y], [x2, y], data, color, width)
    e1 += a1
    while (e1 >= 0.5) {
      x1 += d1
      e1 -= 1
    }
    e2 += a2
    while (e2 >= 0.5) {
      x2 += d2
      e2 -= 1
    }
    y += 1
  }
}

/**
 * model's vertices are in [-1, 1] for x,y,z.
 * if we set zBuffers Max value 1,
 * it's seen as in z = 1
 *
 * if the z-plane is set z = 0,
 * it clips at z = 0 and the further part of head will be rendered.
 * i.e, if the model is the surface of the head,
 * the inner part of the second half of head is rendered.
 */
function triangleWithBC(t0, t1, t2, data, color, width) {
  let bbmin = [
    Math.max(0, Math.min(t0[0], t1[0], t2[0])),
    Math.max(0, Math.min(t0[1], t1[1], t2[1])),
  ]
  let bbmax = [
    Math.min(width, Math.max(t0[0], t1[0], t2[0])),
    Math.min(width, Math.max(t0[1], t1[1], t2[1])),
  ]

  for (let x = parseInt(bbmin[0]); x <= parseInt(bbmax[0]); x++) {
    for (let y = parseInt(bbmin[1]); y <= parseInt(bbmax[1]); y++) {
      let bc = calcBC(t0, t1, t2, [x, y])
      if (bc[0] < 0 || bc[1] < 0 || bc[2] < 0) continue
      putPixel(x, y, data, color, width)
    }
  }
}

export function triangle(t0, t1, t2, data, color, width) {
  triangleWithBC(t0, t1, t2, data, color, width)
}
