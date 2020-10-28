import { triangleWithZBuffer } from "./utils/drawer"
export { PerspectiveCamera } from "./utils/PerspectiveCamera"
export { TinyRenderer }

/**
 * Simple class to use in other scripts easily.
 * Tried to follow the structure of THREE.js'
 */
class TinyRenderer {
  constructor({ target }) {
    let canvas = (this.domElement = target || document.createElement("canvas"))
    this.ctx = canvas.getContext("2d")
  }

  setSize(width, height) {
    this.domElement.width = width
    this.domElement.height = height
    this.canvasWidth = width
    this.canvasHeight = height
    this.imgData = this.ctx.getImageData(0, 0, width, height)
    this.data = this.imgData.data
    this.zBuffer = new Float32Array(width * height)
    this.zBuffer.fill(-Infinity)
  }

  render(scene, camera, { clear = true, draw = true } = { clear: true, draw: true }) {
    // for the multi-pass rendering
    if (clear) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      this.imgData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight)
      this.data = this.imgData.data
      this.zBuffer.fill(-Infinity)
    }

    let { imgData, data } = this

    // setup
    let { model, light } = scene
    let { shader } = model
    let { viewportTr } = camera

    shader.updateUniform({
      uniM: camera.uniM,
      lightDir: light.dir,
    })

    // render a model
    let renderingTime = new Date()
    let coords = []
    for (let fi = 0; fi < model.faces.length; fi++) {
      for (let vi = 0; vi < 3; vi++) {
        coords[vi] = shader.vertex(fi, vi)
      }
      triangleWithZBuffer(...coords, shader, this.zBuffer, data, this.canvasWidth, viewportTr, draw)
    }
    console.log("render: ", new Date() - renderingTime, "ms")
    this.ctx.putImageData(imgData, 0, 0)
  }
}
