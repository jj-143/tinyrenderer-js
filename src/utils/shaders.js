import {
  inverse,
  dot,
  columnVector,
  matmul,
  mToV,
  normalize,
  subtract,
  transpose,
  vecdiv,
} from "./vecOps"

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

export class TextureAndNormalMap {
  constructor(combinedMatrix, res, lightDir, uniM, uniMIT) {
    this.varyingVertexTextureUV = []
    this.combinedMatrix = combinedMatrix
    this.res = res
    this.lightDir = lightDir

    this.diffuseW = this.res.diffuse.header.width
    this.diffuseH = this.res.diffuse.header.height

    this.uniM = uniM
    this.uniMIT = uniMIT
    this.lightDirTrx = normalize(matmul(this.uniM, columnVector([...lightDir, 1])).slice(0, 3))
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]
    let coord = mToV(matmul(this.combinedMatrix, columnVector([...vertex, 1])))

    let vertexTextureNumber = this.res.faces[fi].vt[vi]
    let uv = this.res.vts[vertexTextureNumber]
    this.varyingVertexTextureUV[vi] = [uv[0] * this.diffuseW, uv[1] * this.diffuseH]
    return coord
  }

  fragment(bc, color) {
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v))

    let k = u + (this.diffuseH - 1 - v) * this.diffuseW

    let normalData = normalize(
      // TO NOT STAY IN [uint8Array]
      [...this.res.normalMap.imageData.slice(4 * k, 4 * k + 3)].map(v => (v / 255) * 2 - 1),
      // based on the ssloy's normal(facei, vi)
      // this effectively switch x with z
      // this makes no change to render weirdly.
      // .reverse(),
    )

    let normal = normalize(
      // TODO: check <embed>4 does aug 0 or aug 1
      // and check which is correct: 1 yields less contrast, bright image
      matmul(this.uniMIT, columnVector([...normalData, 0]))
        .map(v => v[0])
        .slice(0, 3),
    )
    let intensity = Math.min(1, Math.max(0, dot(normal, this.lightDirTrx)))

    color[0] = this.res.diffuse.imageData[4 * k] * intensity
    color[1] = this.res.diffuse.imageData[4 * k + 1] * intensity
    color[2] = this.res.diffuse.imageData[4 * k + 2] * intensity
    color[3] = this.res.diffuse.imageData[4 * k + 3]
    return false
  }
}

// Phong lighting
export class DiffuseNormalSpecular {
  constructor(combinedMatrix, res, lightDir, uniM, uniMIT) {
    this.varyingVertexTextureUV = []
    this.combinedMatrix = combinedMatrix
    this.res = res
    this.lightDir = lightDir

    this.diffuseW = this.res.diffuse.header.width
    this.diffuseH = this.res.diffuse.header.height

    this.uniM = uniM
    this.uniMIT = uniMIT
    this.lightDirTrx = normalize(matmul(this.uniM, columnVector([...lightDir, 1])).slice(0, 3))
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]
    let coord = mToV(matmul(this.combinedMatrix, columnVector([...vertex, 1])))

    let vertexTextureNumber = this.res.faces[fi].vt[vi]
    let uv = this.res.vts[vertexTextureNumber]
    this.varyingVertexTextureUV[vi] = [uv[0] * this.diffuseW, uv[1] * this.diffuseH]
    return coord
  }

  fragment(bc, color) {
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v))

    let k = u + (this.diffuseH - 1 - v) * this.diffuseW

    let normalData = normalize(
      [...this.res.normalMap.imageData.slice(4 * k, 4 * k + 3)].map(v => (v / 255) * 2 - 1),
    )

    let normal = normalize(
      // TODO: check <embed>4 does aug 0 or aug 1
      // and check which is correct: 1 yields less contrast, bright image
      matmul(this.uniMIT, columnVector([...normalData, 0]))
        .map(v => v[0])
        .slice(0, 3),
    )

    // "intensity" before
    let diff = Math.min(1, Math.max(0, dot(normal, this.lightDirTrx)))

    // n * (2n * l) - l
    let dotted = 2 * dot(normal, this.lightDirTrx)
    let reflection = normalize(
      subtract(
        normal.map(v => v * dotted),
        this.lightDirTrx,
      ),
    )

    // spec is 1024 * 1024 * 8bit data but TGALoader reads 32bits as [v,v,v,255]
    let specData = this.res.spec.imageData[4 * k]
    let spec = Math.max(0, reflection[2]) ** specData
    spec = 0
    let value = diff + spec * 0.6
    color[0] = value * 255
    color[1] = value * 255
    color[2] = value * 255
    color[3] = this.res.diffuse.imagedata[4 * k + 3]
    return false
  }
}

/**
 * Phong lighting using Tangent-Space Normal Map
 *
 * materials for Tangent-Space NM TNB matrix:
 * http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-13-normal-mapping/
 * https://learnopengl.com/Advanced-Lighting/Normal-Mapping
 */
export class DiffuseTangentNormalSpecular {
  constructor(combinedMatrix, res, lightDir, uniM, uniMIT) {
    this.varyingVertexTextureUV = []
    this.combinedMatrix = combinedMatrix
    this.res = res
    this.lightDir = lightDir

    this.diffuseW = this.res.diffuse.header.width
    this.diffuseH = this.res.diffuse.header.height

    this.uniM = uniM
    this.uniMIT = uniMIT
    this.lightDirTrx = normalize(matmul(this.uniM, columnVector([...lightDir, 1])).slice(0, 3))

    this.vertexNormals = []
    this.varyingCoord = []
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]

    // apply viewport after, only proj, modelview here
    // it doesn't feel right to apply viewport here
    // since coordinate values are used to calculate
    let coords = matmul(this.uniM, columnVector([...vertex, 1])).map(v => v[0])
    this.varyingCoord[vi] = coords

    let vertexTextureNumber = this.res.faces[fi].vt[vi]
    let uv = this.res.vts[vertexTextureNumber]
    this.varyingVertexTextureUV[vi] = [uv[0], uv[1]]

    this.vertexNormals[vi] = normalize(
      matmul(this.uniMIT, columnVector([...this.res.vns[this.res.faces[fi].vn[vi]], 0]))
        .map(v => v[0])
        .slice(0, 3),
    )
    return coords
  }

  fragment(bc, color) {
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v * 1024))
    let k = u + (this.diffuseH - 1 - v) * this.diffuseW

    let intN = normalize(matmul([bc], this.vertexNormals)[0])

    let v0 = vecdiv(this.varyingCoord[0], this.varyingCoord[0][3])
    let v1 = vecdiv(this.varyingCoord[1], this.varyingCoord[1][3])
    let v2 = vecdiv(this.varyingCoord[2], this.varyingCoord[2][3])

    let e1 = subtract(v1, v0)
    let e2 = subtract(v2, v0)

    // NOTE: d(E) = d(UV) as in applying component vector
    // dT = du, dB = dv
    //
    // E_xyz * dT = UV_u
    // E_xyz * dB = UV_v
    //
    // i.e, E * TBN = UV
    // TBN = inv(E) * UV
    let E = [e1, e2, intN]

    let t1 = subtract(this.varyingVertexTextureUV[1], this.varyingVertexTextureUV[0])
    let t2 = subtract(this.varyingVertexTextureUV[2], this.varyingVertexTextureUV[0])
    t1[2] = 0
    t2[2] = 0

    let TBN = matmul(inverse(E), [t1, t2, [0, 0, 0]])

    let tangentNormal = [...this.res.tangentNM.imageData.slice(4 * k, 4 * k + 3)].map(
      v => (v / 255) * 2 - 1,
    )

    TBN = transpose(TBN)
    TBN[0] = normalize(TBN[0])
    TBN[1] = normalize(TBN[1])
    TBN[2] = intN

    let normal = normalize(matmul([tangentNormal], TBN)[0])
    let diff = Math.max(0, dot(normal, this.lightDirTrx))

    // specular
    // n * (2n * l) - l
    let dotted = 2 * dot(normal, this.lightDirTrx)
    let reflection = normalize(
      subtract(
        normal.map(v => v * dotted),
        this.lightDirTrx,
      ),
    )

    // spec is 1024 * 1024 * 8bit data but TGALoader reads 32bits as [v,v,v,255]
    let specData = this.res.spec.imageData[4 * k]
    let spec = Math.max(0, reflection[2]) ** specData
    let value = diff + spec * 0.6

    color[0] = Math.min(255, 5 + this.res.diffuse.imageData[4 * k] * value)
    color[1] = Math.min(255, 5 + this.res.diffuse.imageData[4 * k + 1] * value)
    color[2] = Math.min(255, 5 + this.res.diffuse.imageData[4 * k + 2] * value)
    color[3] = this.res.diffuse.imageData[4 * k + 3]
    return false
  }
}
