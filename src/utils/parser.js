import model_head from "../obj/african_head.obj"

export function read(model) {
  return fetch(model)
    .then(r => r.text())
    .then(text => text.split("\n"))
}

export function getVF(lines, halfW) {
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
      let matches = Array.from(line.matchAll(/ (\d+)\/(\d+)\//g))
      let face = {
        v: matches.map(m => Number(m[1]) - 1),
        vt: matches.map(m => Number(m[2]) - 1),
      }
      fs.push(face)
    }
  })
  return [vs, fs, vts, vns]
}

export function parseModel(model) {
  if (!model) {
    model = model_head
  }
  return read(model).then(getVF)
}
