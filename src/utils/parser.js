import model_head from '../obj/african_head.obj'

export function read(model) {
  return fetch(model).then(
    r =>
      r.text()
  ).then(text =>
    text.split("\n")
  )
}

export function getVF(lines, halfW) {
  let vs = []
  let fs = []

  lines.forEach(line => {
    if (line.split(" ", 1)[0] === 'v') {
      vs.push(line.split(" ").splice(1).map(v => Number(v)))
    } else if (line[0] === 'f') {
      fs.push(Array.from(line.matchAll(/ (\d+)\//g)).map(k => Number(k[1]) - 1))
    }
  })
  return [vs, fs]
}

export function parseModel(model) {
  if (!model) {
    model = model_head
  }
  return read(model).then(lines =>
    getVF(lines)
  )
}