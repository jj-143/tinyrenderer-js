const { line, triangle } = require("./src/utils/drawer")

const canvas = document.getElementById('app')
const ctx = canvas.getContext('2d')
let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
let data = imgData.data

// let y = 50

// for (let i = 0; i < canvas.width; i++) {
//   drawData(data, y * canvas.width + i, [100, 255, 100, 255])
// }
const green = [100, 255, 100, 255]
const white = [255, 255, 255, 255]

// p1 = [20, 20]
// p2 = [40, 40]
// p2 = [80, 80]

// for (let i = 0; i < 1; i++) {
// for (let i = 0; i < 1_000_000; i++) {
//   line([13, 20], [80, 40], data, white, canvas.width);
//   line([20, 13], [40, 80], data, green, canvas.width);
//   line([80, 40], [13, 20], data, green, canvas.width);
// }

let p1 = [25, 25]
let p2 = [75, 75]

// function draw() {
//   line(p1, p2, data, green, canvas.width)
//   ctx.putImageData(imgData, 0, 0)
// }

let t = 0
let T = 2000
const k = 2 * Math.PI / T
const w = canvas.width
const h = canvas.height

let [bx, by] = [50, 50]
function run(t) {
  ctx.clearRect(0, 0, w, h)
  imgData = ctx.getImageData(0, 0, w, h)
  data = imgData.data

  p1[0] = parseInt(25 * Math.cos(k * t) + bx)
  p1[1] = parseInt(25 * Math.sin(k * t) + by)

  p2[0] = parseInt(25 * Math.cos(k * (t + T / 4)) + bx)
  p2[1] = parseInt(25 * Math.sin(k * (t + T / 4)) + by)

  line(p1, p2, data, green, canvas.width)
  ctx.putImageData(imgData, 0, 0)
  requestAnimationFrame(run)
}

import { drawModel } from './src/utils/parser'

// drawModel(data, w, green)
//   .then(() => {
//     ctx.putImageData(imgData, 0, 0)
//   })

triangle([10, 70], [50, 160], [70, 80], data, green, w)
triangle([10, 10], [80, 10], [30, 80], data, green, w)
triangle([180, 50], [150, 1], [70, 180], data, green, w)
triangle([120, 180], [180, 180], [150, 80], data, green, w)
// triangle([180, 150], [120, 160], [130, 180], data, green, w)
ctx.putImageData(imgData, 0, 0)