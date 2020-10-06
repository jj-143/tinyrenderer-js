import { dot, columnVector, matmul, mToV } from "./vecOps"

export class GouraudShader {
  constructor(combinedMatrix, res, lightDir) {
    this.varyingIntensity = []
    this.combinedMatrix = combinedMatrix
    this.res = res
    this.lightDir = lightDir
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]
    let vertexNormal = this.res.vns[vertexNumber]

    let coord = mToV(matmul(this.combinedMatrix, columnVector([...vertex, 1])))
    this.varyingIntensity[vi] = Math.max(0, dot(vertexNormal, this.lightDir))
    return coord
  }

  fragment(bc, color) {
    let intensity = dot(this.varyingIntensity, bc)
    color[0] = intensity * 255
    color[1] = intensity * 255
    color[2] = intensity * 255
    return false
  }
}
