import { getVF, read } from "./parser"
import { dot, cross, normalize, subtract } from "./vecOps"

export function drawData(x, y, data, rgba, width) {
  let pos = parseInt(width - y) * width + parseInt(x)
  data[pos * 4] = rgba[0]
  data[pos * 4 + 1] = rgba[1]
  data[pos * 4 + 2] = rgba[2]
  data[pos * 4 + 3] = rgba[3] ?? data[pos * 4 + 3]
}

function line1(p1, p2, data, rgba, width) {
  let [x1, y1] = p1
  let [x2, y2] = p2
  let steep = false
  if (x1 > x2) {
    let tmp = [x1, y1];
    [x1, y1] = [x2, y2];
    [x2, y2] = tmp
  }

  if (Math.abs(x2 - x1) < Math.abs(y2 - y1)) {
    [x1, y1] = [y1, x1];
    [x2, y2] = [y2, x2];
    steep = true
  }

  for (let x = x1; x <= x2; x++) {
    let y = Math.round((y2 - y1) / (x2 - x1) * (x - x1) + y1)
    if (steep) {
      drawData(y, x, data, rgba, width)
    } else {
      drawData(x, y, data, rgba, width)
    }
  }
}

function line2(p1, p2, data, rgba, width) {
  let [x1, y1] = p1
  let [x2, y2] = p2
  let steep = false
  if (x1 > x2) {
    let tmp = [x1, y1];
    [x1, y1] = [x2, y2];
    [x2, y2] = tmp
  }

  if (Math.abs(x2 - x1) < Math.abs(y2 - y1)) {
    [x1, y1] = [y1, x1];
    [x2, y2] = [y2, x2];
    steep = true
  }
  let a = (y2 - y1) / (x2 - x1)

  for (let x = x1; x <= x2; x++) {
    let y = Math.round(a * (x - x1) + y1)
    if (steep) {
      drawData(y, x, data, rgba, width)
    } else {
      drawData(x, y, data, rgba, width)
    }
  }
}

function line3(p1, p2, data, rgba, width) {
  let [x1, y1] = p1
  let [x2, y2] = p2
  let steep = false

  if (Math.abs(x2 - x1) < Math.abs(y2 - y1)) {
    [x1, y1] = [y1, x1];
    [x2, y2] = [y2, x2];
    steep = true
  }
  if (x1 > x2) {
    let tmp = [x1, y1];
    [x1, y1] = [x2, y2];
    [x2, y2] = tmp
  }
  let derror = Math.abs((y2 - y1) / (x2 - x1))
  let error = 0
  let y = parseInt(y1)

  for (let x = parseInt(x1); x <= x2; x++) {
    if (steep) {
      drawData(y, x, data, rgba, width)
    } else {
      drawData(x, y, data, rgba, width)
    }

    error += derror
    if (error > .5) {
      y += (y2 > y1 ? 1 : -1)
      error -= 1;
    }
  }
}


export function line(p1, p2, data, rgba, width) {
  line1(p1, p2, data, rgba, width)
  // line2(p1, p2, data, rgba, width)
  line3(p1, p2, data, rgba, width)
}

// diagonal light (e.g [1, 0, -1]) would not render some faces 
// correctly. Maybe it's concave when seen from the light direction
// probably solve in later lectures.
let lightDir = normalize([0, 0, -1])

export function drawModel(data, width, color) {
  return read().then(lines => {
    let [vertices, faces] = getVF(lines, width / 2)

    for (let f of faces) {
      let [v1, v2, v3] = f.map(vi => vertices[vi])
      let p1 = v1.slice(0, 2).map(k => (1 + k) * width / 2)
      let p2 = v2.slice(0, 2).map(k => (1 + k) * width / 2)
      let p3 = v3.slice(0, 2).map(k => (1 + k) * width / 2)

      let v13 = subtract(v3, v1)
      let v12 = subtract(v2, v1)

      let normal = cross(v13, v12)
      normal = normalize(normal)

      let intensity = dot(normal, lightDir)
      if (intensity > 0) {
        color[3] = 255 * intensity
        triangle(p1, p2, p3, data, color, width)
      }
    }
  })
}

/**
 * for div by zero in either parts,
 * the while clause is not executed since t1.y == t0.y
 * and t2.y == t1.y, repectively.
 */
export function triangle(t0, t1, t2, data, color, width) {
  // what if 3 pts lie on a single line?
  ;[t0, t1, t2] = [t0, t1, t2].sort((a, b) => a[1] - b[1])

  let a1 = Math.abs((t1[0] - t0[0]) / (t1[1] - t0[1]))
  let a2 = Math.abs((t2[0] - t0[0]) / (t2[1] - t0[1]))
  let e1 = 0
  let d1 = t1[0] > t0[0] ? 1 : -1
  let d2 = t2[0] > t0[0] ? 1 : -1
  let e2 = 0

  let y = t0[1]
  let x1 = t0[0]
  let x2 = t0[0]
  while (y < t1[1]) {
    line([x1, y], [x2, y], data, color, width)
    e1 += a1
    while (e1 >= .5) {
      x1 += d1
      e1 -= 1
    }
    e2 += a2
    while (e2 >= .5) {
      x2 += d2
      e2 -= 1
    }
    y += 1
  }

  a1 = Math.abs((t2[0] - t1[0]) / (t2[1] - t1[1]))
  d1 = t2[0] > t1[0] ? 1 : -1
  e1 = 0
  x1 = t1[0]

  while (y < t2[1]) {
    line([x1, y], [x2, y], data, color, width)
    e1 += a1
    while (e1 >= .5) {
      x1 += d1
      e1 -= 1
    }
    e2 += a2
    while (e2 >= .5) {
      x2 += d2
      e2 -= 1
    }
    y += 1
  }
}
