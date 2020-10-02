import { matmul, cross, normalize, subtract } from "./vecOps"

export function calcBC(v1, v2, v3, p) {
  let u = cross(
    [v3[0] - v1[0], v2[0] - v1[0], v1[0] - p[0]],
    [v3[1] - v1[1], v2[1] - v1[1], v1[1] - p[1]],
  )
  if (Math.abs(u[2]) < 1) return [-1, 0, 0]
  return [1 - (u[0] + u[1]) / u[2], u[1] / u[2], u[0] / u[2]]
}

export function calcModelViewMatrix(cameraPosition, cameraUp, center) {
  let z = normalize(subtract(cameraPosition, center))
  let x = normalize(cross(cameraUp, z))
  let y = normalize(cross(z, x))

  // "Minv" in the Lesson
  let basisMatrix = [
    [...x, 0],
    [...y, 0],
    [...z, 0],
    [0, 0, 0, 1],
  ]
  let translate = [
    [1, 0, 0, -center[0]],
    [0, 1, 0, -center[1]],
    [0, 0, 1, -center[2]],
    [0, 0, 0, 1],
  ]

  return matmul(basisMatrix, translate)
}

export function calcPerspectiveMatrix(c) {
  // it looks like the final operation of
  // "div by the augmented 4th coordinate value to make it 1"
  // can be separated.
  // so it's possible to multiply all rest of matrix first

  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, -1 / c[2], 1],
  ]
}

/**
 * it's more of "mapping model to the screen"
 *
 * x,y is relative to the screen
 *
 * d is for resolution for z
 */
export function calcViewportMatrix(x, y, width, height, d = 255) {
  return [
    [width / 2, 0, 0, x + width / 2],
    [0, height / 2, 0, y + height / 2],
    [0, 0, d, d / 2],
    [0, 0, 0, 1],
  ]
}
