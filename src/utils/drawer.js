import { dot, matmul, vecdiv } from "./vecOps"
import { barycentric } from "./utils"

export function triangleWithZBuffer(v0, v1, v2, shader, zBuffer, data, width, viewportTr, draw) {
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
      let bc = barycentric(v0, v1, v2, x, y)

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

        // bypass in multi-pass rendering
        if (!draw) continue
        data[bufferIdx * 4] = color[0]
        data[bufferIdx * 4 + 1] = color[1]
        data[bufferIdx * 4 + 2] = color[2]
        data[bufferIdx * 4 + 3] = color[3]
      }
    }
  }
}
