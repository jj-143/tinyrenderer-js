import { cross, subtract } from "./vecOps"

export function calcBC(v1, v2, v3, p) {
  let u = cross(
    [v3[0] - v1[0], v2[0] - v1[0], v1[0] - p[0]],
    [v3[1] - v1[1], v2[1] - v1[1], v1[1] - p[1]],
  )
  if (Math.abs(u[2]) < 1) return [-1, 0, 0]
  return [1 - (u[0] + u[1]) / u[2], u[1] / u[2], u[0] / u[2]]
}
