import { cross, subtract } from "./vecOps"

export function calcBC(v1, v2, v3, p) {
  let u = cross(
    [v3[0] - v1[0], v2[0] - v1[0], v1[0] - p[0]],
    [v3[1] - v1[1], v2[1] - v1[1], v1[1] - p[1]],
  )
  if (Math.abs(u[2]) < 1) return [-1, 0, 0]
  return [1 - (u[0] + u[1]) / u[2], u[1] / u[2], u[0] / u[2]]
}

/**
 * **only** use camera's **z** value.
 *
 * camera on (x,y) = (0,0) in lesson 4
 */
export function perspectiveTrx(v, c) {
  // r = - 1 / z
  let r = -1 / c[2]

  // 1 / (1 + rz)
  let m = 1 / (1 + r * v[2])

  return v.map(x => x * m)
}
