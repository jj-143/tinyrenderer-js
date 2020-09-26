const { line, triangle, drawModelWithZBuffer } = require("./src/utils/drawer")

const canvas = document.getElementById('app')

// canvas.width = 200
// canvas.height = 200
const ctx = canvas.getContext('2d')
const w = canvas.width
const h = canvas.height
// ctx.fillStyle = 'black'
// ctx.fillRect(0, 0, w, h)

let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
let data = imgData.data

const green = [100, 255, 100, 255]

drawModelWithZBuffer(data, [255, 255, 255, 255], w, 'diff.tga').then(() => {
  ctx.putImageData(imgData, 0, 0)
})


// triangle([10, 70], [50, 160], [70, 80], data, green, w)
// triangle([10, 10], [80, 10], [30, 80], data, [255, 0, 0, 255], w)
// triangle([180, 50], [150, 1], [70, 180], data, [255, 255, 0, 255], w)
// triangle([120, 180], [180, 180], [150, 80], data, [0, 0, 255, 255], w)
// triangle([180, 150], [120, 160], [130, 180], data, green, w)


// {
//   import('./src/utils/tga')
//     .then(({ default: TGAL }) => {

//       console.log(TGAL);

//       const tga = new TGAL()

//       tga.open('diff.tga', () => {
//         //TODO:
//         //this is 1024 * 1024 * 3 color data
//         console.log(tga.imageData)
//       })

//     })
// }