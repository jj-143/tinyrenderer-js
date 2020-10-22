import TGALoader from "tga-js"

export class Loader {
  constructor() {
    this.items = new Map()
  }

  // returns key-mapped asset collection object
  all() {
    return Promise.all(this.items.values()).then(values => {
      let out = {}
      ;[...this.items.keys()].forEach((key, idx) => (out[key] = values[idx]))
      return out
    })
  }

  addModel(key, src) {
    this.items.set(key, loadModel(src))
  }

  addTexture(key, src) {
    this.items.set(key, loadTGA(src))
  }
}

export function loadTGA(src) {
  return new Promise(resolve => {
    const tgaLoader = new TGALoader()
    tgaLoader.open(src, () => {
      resolve({
        imageData: tgaLoader.getImageData().data,
        header: tgaLoader.header,
      })
    })
  })
}

export function loadModel(src) {
  return fetch(src)
    .then(r => r.text())
    .then(text => text.split("\n"))
    .then(lines => {
      let vertices = []
      let faces = []
      let vts = []
      let vns = []

      lines.forEach(line => {
        let type = line.split(" ", 1)[0]
        if (type === "v") {
          vertices.push(
            line
              .split(" ")
              .filter(_ => _ != "")
              .splice(1)
              .map(v => Number(v)),
          )
        } else if (type === "vt") {
          vts.push(
            line
              .match(/ [\d.]+/g)
              .slice(0, 2)
              .map(Number),
          )
        } else if (type === "vn") {
          vns.push(
            line
              .split(" ")
              .filter(_ => _ != "")
              .splice(1)
              .map(v => Number(v)),
          )
        } else if (type === "f") {
          let matches = Array.from(line.matchAll(/ (\d+)\/(\d+)\/(\d+)/g))
          let face = {
            v: matches.map(m => Number(m[1]) - 1),
            vt: matches.map(m => Number(m[2]) - 1),
            vn: matches.map(m => Number(m[3]) - 1),
          }
          faces.push(face)
        }
      })
      return { vertices, faces, vts, vns }
    })
}
