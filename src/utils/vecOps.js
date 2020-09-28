export const cross = (v1, v2) => [
  v1[1] * v2[2] - v1[2] * v2[1],
  -v1[0] * v2[2] + v1[2] * v2[0],
  v1[0] * v2[1] - v1[1] * v2[0],
]

export const subtract = (v1, v2) => [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]]

export const dot = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
export const abs = v => Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
export const normalize = v => v.map(i => i / abs(v))
export const neg = v => v.map(i => -i)
