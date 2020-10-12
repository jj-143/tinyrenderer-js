import { getVF, _fetch } from "./parser"

import { dot, cross, normalize, subtract, neg, matmul, identity_4, inverse, vecdiv } from "./vecOps"
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

export function triangleWithZBuffer(v0, v1, v2, shader, zBuffer, data, width, viewportTr) {
  // apply viewport, div by aug here
  ;[v0, v1, v2] = matmul([v0, v1, v2], viewportTr).map(v => vecdiv(v.slice(0, 3), v[3]))

  let bbmin = [
    Math.max(0, parseInt(Math.min(v0[0], v1[0], v2[0]))),
    Math.max(0, parseInt(Math.min(v0[1], v1[1], v2[1]))),
  ]
  let bbmax = [
    Math.min(width, parseInt(Math.max(v0[0], v1[0], v2[0]))),
    Math.min(width, parseInt(Math.max(v0[1], v1[1], v2[1]))),
  ]

  for (let x = bbmin[0]; x <= bbmax[0]; x++) {
    for (let y = bbmin[1]; y <= bbmax[1]; y++) {
      let bc = calcBC(v0, v1, v2, x, y)

      if (bc[0] < 0 || bc[1] < 0 || bc[2] < 0) continue

      // NOTE: ssloy uses sum of weighted z,
      // depth = sum(z) / sum(w: 4th value)
      // whereas I (and in his previous lessons)
      // use sum of z divided by aug value.
      // the render doesn't change visually, perhaps lack of many competing
      // z values in this model / scene.
      let z = dot([v0[2], v1[2], v2[2]], bc)

      let bufferIdx = (width - 1 - y) * width + x
      if (zBuffer[bufferIdx] > z) continue

      let color = [0, 0, 0, 255]
      let discard = shader.fragment(bc, color)

      if (!discard) {
        zBuffer[bufferIdx] = z
        data[bufferIdx * 4] = color[0]
        data[bufferIdx * 4 + 1] = color[1]
        data[bufferIdx * 4 + 2] = color[2]
        data[bufferIdx * 4 + 3] = color[3]
      }
      continue

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

//
// Previous lessons, attempts
//

// deprecated: too little code, do it in the main script
function renderFace(face, data, shader, zBuffer, width) {
  let [v0, v1, v2] = face.v.map(vi => shader.vertex(vi))
  triangleWithZBuffer(v0, v1, v2, shader, zBuffer, data, width)
  return

  for (let f of faces) {
    // let [t0, t1, t2] = f.v.map(vi => mToV(matmul(combined, columnVector([...vertices[vi], 1]))))
    // let normals = matmul(
    //   f.v.map(vi => [...vns[vi], 0]),
    //   combinedNormalTr,
    // ).map(n => normalize(n.slice(0, 3)))

    let screenCoords = f.v.map(shader.vertex)

    // matmul is not faster in here, and avoiding flatten and transpose
    // let varyingIntensity = normals.map(n => Math.max(0, dot(n, lightDir)))

    // let [vt0, vt1, vt2] = f.vt.map(vti => vts[vti].map((v, i) => v * diffSize[i]))
    // diffData.vt[0] = vt0
    // diffData.vt[1] = vt1
    // diffData.vt[2] = vt2

    triangleWithZBuffer(t0, t1, t2, shader, zBuffer, data, width)
  }
  console.log("rendering :", new Date() - renderTime, "ms")
  return

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
  })
}

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
  return _fetch().then(lines => {
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
