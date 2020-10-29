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

  // don't know how to deal with 2-pass thing yet,
  // so separate funtion it is.
  renderSSAO(scene, camera, { clear = true, draw = true } = { clear: true, draw: true }) {
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

    let renderingTime = new Date()
    let coords = []

    let width = camera.vW
    let height = camera.vH

    // first pass, using depth shader

    for (let fi = 0; fi < model.faces.length; fi++) {
      for (let vi = 0; vi < 3; vi++) {
        coords[vi] = shader.vertex(fi, vi)
      }
      triangleWithZBuffer(...coords, shader, this.zBuffer, data, this.canvasWidth, viewportTr, draw)
    }

    // second pass

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (this.zBuffer[(height - 1 - y) * width + x] < -1e5) continue

        let bufferIdx = (width - 1 - y) * width + x

        let total = 0
        // - 1e-4 for preventing extra round due to the float type
        // from ssloy's
        for (let deg = 0; deg < 2 * Math.PI - 1e-4; deg += Math.PI / 4) {
          let dx = Math.round(Math.cos(deg))
          let dy = Math.round(Math.sin(deg))

          let tx = x + dx
          let ty = y + dy
          let tIdx = (width - 1 - ty) * width + tx
          let diffZ = this.zBuffer[tIdx] - this.zBuffer[bufferIdx]

          if (diffZ < 0) {
            total += Math.PI / 2
            continue
          }
          let maxElevationAngle = Math.atan(diffZ / Math.sqrt(dx ** 2 + dy ** 2))
          total += Math.PI / 2 - maxElevationAngle
        }

        total /= Math.PI * 4
        total *= 255

        // total = Math.pow(total, 100) * 255
        data[bufferIdx * 4 + 0] = total
        data[bufferIdx * 4 + 1] = total
        data[bufferIdx * 4 + 2] = total
      }
    }

    console.log("render: ", new Date() - renderingTime, "ms")
    this.ctx.putImageData(imgData, 0, 0)
  }
}
