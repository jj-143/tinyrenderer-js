import TGALoader from "tga-js"

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

export function loadModel(objFile) {
  return fetch(objFile)
    .then(r => r.text())
    .then(text => text.split("\n"))
    .then(lines => {
      let vs = []
      let fs = []
      let vts = []
      let vns = []

      lines.forEach(line => {
        let type = line.split(" ", 1)[0]
        if (type === "v") {
          vs.push(
            line
              .split(" ")
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
          fs.push(face)
        }
      })
      return [vs, fs, vts, vns]
    })
}
