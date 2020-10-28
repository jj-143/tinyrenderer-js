import { calcModelViewMatrix, calcPerspectiveMatrix, calcViewportMatrix } from "./utils"
import { abs, matmul, subtract, transpose } from "./vecOps"

export class PerspectiveCamera {
  constructor({ position, lookAt = [0, 0, 0], up = [0, 1, 0], viewport }) {
    this.position = position
    this.lookAt = lookAt
    this.up = up

    // FIXME
    // this "size" probably not a viewport size in THREE.js
    // THREE.js use **two** versions of width and height
    // for each camera and viewport
    // here, use one as viewport
    this.vW = viewport[0]
    this.vH = viewport[1]

    let perspective = calcPerspectiveMatrix(-1 / abs(subtract(position, lookAt)))
    let modelView = calcModelViewMatrix(position, up, lookAt)
    this.uniM = matmul(perspective, modelView)
    this.viewport = calcViewportMatrix(0, 0, this.vW, this.vH, 255)
    this.viewportTr = transpose(this.viewport)
  }

  update({ position, lookAt, up, perspective }) {
    this.position = position ?? this.position
    this.lookAt = lookAt ?? this.lookAt
    this.up = up ?? this.up

    perspective = perspective ?? -1 / abs(subtract(this.position, this.lookAt))
    let perspectiveM = calcPerspectiveMatrix(perspective)
    let modelView = calcModelViewMatrix(this.position, this.up, this.lookAt)
    this.uniM = matmul(perspectiveM, modelView)
  }
}
