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

// Texture + Intensity by light * interpolated vertex normal
export class ShaderWithTexture {
  constructor(combinedMatrix, res, lightDir) {
    this.varyingIntensity = []
    this.varyingVertexTextureUV = []
    this.combinedMatrix = combinedMatrix
    this.res = res
    this.lightDir = lightDir

    this.diffuseW = this.res.diffuse.header.width
    this.diffuseH = this.res.diffuse.header.height
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]
    let vertexNormal = this.res.vns[vertexNumber]

    let coord = mToV(matmul(this.combinedMatrix, columnVector([...vertex, 1])))
    this.varyingIntensity[vi] = Math.max(0, dot(vertexNormal, this.lightDir))

    let vertexTextureNumber = this.res.faces[fi].vt[vi]
    let uv = this.res.vts[vertexTextureNumber]
    this.varyingVertexTextureUV[vi] = [uv[0] * this.diffuseW, uv[1] * this.diffuseH]
    return coord
  }

  fragment(bc, color) {
    let intensity = dot(this.varyingIntensity, bc)
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v))
    let k = u + (this.diffuseH - 1 - v) * this.diffuseW
    color[0] = this.res.diffuse.imageData[4 * k] * intensity
    color[1] = this.res.diffuse.imageData[4 * k + 1] * intensity
    color[2] = this.res.diffuse.imageData[4 * k + 2] * intensity
    return false
  }
}
