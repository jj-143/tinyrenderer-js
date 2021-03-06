export const cross = (v1, v2) => [
  v1[1] * v2[2] - v1[2] * v2[1],
  -v1[0] * v2[2] + v1[2] * v2[0],
  v1[0] * v2[1] - v1[1] * v2[0],
]

export const subtract = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]]

export const dot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
export const abs = v => Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
export const normalize = v => {
  let length = abs(v)
  return v.map(i => i / length)
}

/**
 * normalize **inplace**
 */
export const iNormalize3 = v => {
  let len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
  v[0] /= len
  v[1] /= len
  v[2] /= len
  return v
}

export const neg = v => v.map(i => -i)

/**
 * @param {Square Matirx} m
 * @returns {Square Matirx} 1 less dimension of m
 */
const removedRowCol = (m, row, col) => {
  return [...Array(m.length - 1).keys()].map(i => {
    i = i < row ? i : i + 1
    return [...m[i].slice(0, col), ...m[i].slice(col + 1)]
  })
}

/**
 * @param {Square Matrix} m
 */
export const determinant = m => {
  if (m.length == 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0]
  return m[0].reduce(
    (acc, val, j) => val * (j % 2 ? -1 : 1) * determinant(removedRowCol(m, 0, j)) + acc,
    0,
  )
}

export const determinant3 = m => {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  )
}

const adj = m => {
  return m.map((row, i) =>
    row.map((_, j) => ((i + j) % 2 ? -1 : 1) * determinant(removedRowCol(m, j, i))),
  )
}

export const vecdiv = (v, scalar) => v.map(x => x / scalar)

export const inverse = m => {
  let det = determinant(m)
  return adj(m).map(v => vecdiv(v, det))
}

// this reduces render time significantly as
// opposed to using inverse()
export const inverse3 = m => {
  let det =
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])

  return [
    [
      (m[1][1] * m[2][2] - m[1][2] * m[2][1]) / det,
      (-m[0][1] * m[2][2] + m[0][2] * m[2][1]) / det,
      (m[0][1] * m[1][2] - m[0][2] * m[1][1]) / det,
    ],
    [
      (-m[1][0] * m[2][2] + m[1][2] * m[2][0]) / det,
      (m[0][0] * m[2][2] - m[0][2] * m[2][0]) / det,
      (-m[0][0] * m[1][2] + m[0][2] * m[1][0]) / det,
    ],
    [
      (m[1][0] * m[2][1] - m[1][1] * m[2][0]) / det,
      (-m[0][0] * m[2][1] + m[0][1] * m[2][0]) / det,
      (m[0][0] * m[1][1] - m[0][1] * m[1][0]) / det,
    ],
  ]
}

export const columnVector = a => {
  return a.map(v => [v])
}

export const transpose = a => {
  let m = a.length
  let n = a[0].length

  if (n === undefined) return a.map(v => [v])

  return [...Array(n).keys()].map(i => [...Array(m).keys()].map(j => a[j][i]))
}

export const matmulvec = (m, v) => {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ]
}

export const matmulvec4aug = (m, v, aug) => {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2] + m[0][3] * aug,
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2] + m[1][3] * aug,
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2] + m[2][3] * aug,
    m[3][0] * v[0] + m[3][1] * v[1] + m[3][2] * v[2] + m[3][3] * aug,
  ]
}

export const matmul4 = (a, b) => {
  let result = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let val = 0
      for (let k = 0; k < 4; k++) {
        val += a[i][k] * b[k][j]
      }
      result[i][j] = val
    }
  }
  return result
}

export const matmul = (a, b, out) => {
  if (a[0].length != b.length || !a[0].length || !b[0].length) throw Error("Dimension error")
  let m = a.length
  let n = b[0].length
  let o = a[0].length

  let result = out ?? Array.from(Array(m)).map(_ => [])
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let val = 0
      for (let k = 0; k < o; k++) {
        val += a[i][k] * b[k][j]
      }
      result[i][j] = val
    }
  }
  return result
}

export const identity_4 = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
]

export const mToV = m => vecdiv(m, m[3]).slice(0, 3)
