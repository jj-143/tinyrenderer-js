import { drawModelWithZBuffer } from "./utils/drawer"

const canvas = document.getElementById("app")
const ctx = canvas.getContext("2d")
const w = canvas.width
const h = canvas.height

let imgData = ctx.getImageData(0, 0, w, h)
let data = imgData.data

const green = [100, 255, 100, 255]

import diffuseMap from "./obj/african_head_diffuse.tga"

drawModelWithZBuffer(data, green, w, diffuseMap).then(() => {
  ctx.putImageData(imgData, 0, 0)
})
