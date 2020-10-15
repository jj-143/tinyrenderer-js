import {
  inverse3,
  inverse,
  dot,
  columnVector,
  matmul,
  matmulvec,
  normalize,
  subtract,
  transpose,
  vecdiv,
  iNormalize3,
  sqrt,
  matmulvec4aug,
} from "./vecOps"

export class GouraudShader {
  constructor(res, lightDir, uniM) {
    this.res = res
    this.lightDir = lightDir
    this.uniM = uniM
    this.varyingIntensity = []
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]
    let vertexNormal = this.res.vns[vertexNumber]

    let coord = matmulvec4aug(this.uniM, vertex, 1)
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
  constructor(res, lightDir, uniM) {
    this.res = res
    this.lightDir = lightDir
    this.uniM = uniM

    this.diffuseW = this.res.diffuse.header.width
    this.diffuseH = this.res.diffuse.header.height
    this.varyingIntensity = []
    this.varyingVertexTextureUV = []
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]
    let vertexNormal = this.res.vns[vertexNumber]

    let coord = matmulvec4aug(this.uniM, vertex, 1)
    this.varyingIntensity[vi] = Math.max(0, dot(vertexNormal, this.lightDir))

    let vertexTextureNumber = this.res.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.res.vts[vertexTextureNumber]
    return coord
  }

  fragment(bc, color) {
    let intensity = dot(this.varyingIntensity, bc)
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v * 1024))
    let k = u + (this.diffuseH - 1 - v) * this.diffuseW
    color[0] = this.res.diffuse.imageData[4 * k] * intensity
    color[1] = this.res.diffuse.imageData[4 * k + 1] * intensity
    color[2] = this.res.diffuse.imageData[4 * k + 2] * intensity
    return false
  }
}

export class TextureAndNormalMap {
  constructor(res, lightDir, uniM, uniMIT) {
    this.res = res
    this.lightDir = lightDir
    this.uniM = uniM
    this.uniMIT = uniMIT

    this.diffuseW = this.res.diffuse.header.width
    this.diffuseH = this.res.diffuse.header.height
    this.varyingVertexTextureUV = []
    this.lightDirTrx = iNormalize3(matmulvec4aug(this.uniM, lightDir, 1).slice(0, 3))
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]
    let coord = matmulvec4aug(this.uniM, vertex, 1)

    let vertexTextureNumber = this.res.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.res.vts[vertexTextureNumber]
    return coord
  }

  fragment(bc, color) {
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v * 1024))
    let k = u + (this.diffuseH - 1 - v) * this.diffuseW

    let normalData = iNormalize3([
      (this.res.normalMap.imageData[4 * k] / 255) * 2 - 1,
      (this.res.normalMap.imageData[4 * k + 1] / 255) * 2 - 1,
      (this.res.normalMap.imageData[4 * k + 2] / 255) * 2 - 1,
      // based on the ssloy's normal(facei, vi)
      // this effectively switch x with z
      // this makes no change to render weirdly.
      // .reverse(),
    ])

    let normal = iNormalize3(matmulvec4aug(this.uniMIT, normalData, 0).slice(0, 3))
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
  constructor(res, lightDir, uniM, uniMIT) {
    this.varyingVertexTextureUV = []
    this.res = res
    this.lightDir = lightDir

    this.diffuseW = this.res.diffuse.header.width
    this.diffuseH = this.res.diffuse.header.height

    this.uniM = uniM
    this.uniMIT = uniMIT
    this.lightDirTrx = iNormalize3(matmulvec4aug(this.uniM, lightDir, 1).slice(0, 3))
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]
    let coord = matmulvec4aug(this.uniM, vertex, 1)

    let vertexTextureNumber = this.res.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.res.vts[vertexTextureNumber]
    return coord
  }

  fragment(bc, color) {
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v * 1024))
    let k = u + (this.diffuseH - 1 - v) * this.diffuseW

    let normalData = iNormalize3([
      (this.res.normalMap.imageData[4 * k] / 255) * 2 - 1,
      (this.res.normalMap.imageData[4 * k + 1] / 255) * 2 - 1,
      (this.res.normalMap.imageData[4 * k + 2] / 255) * 2 - 1,
    ])

    let normal = iNormalize3(
      // TODO: check <embed>4 does aug 0 or aug 1
      // and check which is correct: 1 yields less contrast, bright image
      // matmul(this.uniMIT, columnVector([...normalData, 0]))
      //   .map(v => v[0])
      //   .slice(0, 3),
      matmulvec4aug(this.uniMIT, normalData, 0).slice(0, 3),
    )

    // "intensity" before
    let diff = Math.min(1, Math.max(0, dot(normal, this.lightDirTrx)))

    // n * (2n * l) - l
    let dotted = 2 * dot(normal, this.lightDirTrx)
    let reflection = iNormalize3([
      normal[0] * dotted - this.lightDirTrx[0],
      normal[1] * dotted - this.lightDirTrx[1],
      normal[2] * dotted - this.lightDirTrx[2],
    ])

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

/**
 * Phong lighting using Tangent-Space Normal Map
 *
 * materials for Tangent-Space NM TNB matrix:
 * http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-13-normal-mapping/
 * https://learnopengl.com/Advanced-Lighting/Normal-Mapping
 */
export class DiffuseTangentNormalSpecular {
  constructor(res, lightDir, uniM, uniMIT) {
    this.res = res
    this.lightDir = lightDir
    this.uniM = uniM
    this.uniMIT = uniMIT

    this.diffuseW = this.res.diffuse.header.width
    this.diffuseH = this.res.diffuse.header.height
    this.varyingVertexTextureUV = []
    this.vertexNormals = []
    this.varyingCoord = []
    this.lightDirTrx = iNormalize3(matmulvec4aug(this.uniM, lightDir, 1).slice(0, 3))
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]

    // apply viewport after, only proj, modelview here
    // it doesn't feel right to apply viewport here
    // since coordinate values are used to calculate
    // TNB matrix
    let coords = matmulvec4aug(this.uniM, vertex, 1)
    this.varyingCoord[vi] = [coords[0] / coords[3], coords[1] / coords[3], coords[2] / coords[3]]

    let vertexTextureNumber = this.res.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.res.vts[vertexTextureNumber]

    this.vertexNormals[vi] = iNormalize3(
      matmulvec4aug(this.uniMIT, this.res.vns[this.res.faces[fi].vn[vi]], 0).slice(0, 3),
    )
    return coords
  }

  // some are not optimized as faster version below
  // for readability
  fragment(bc, color) {
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v * 1024))
    let k = u + (this.diffuseH - 1 - v) * this.diffuseW
    let intN = iNormalize3(matmul([bc], this.vertexNormals)[0])
    let tangentNormal = [
      (this.res.tangentNM.imageData[4 * k] / 255) * 2 - 1,
      (this.res.tangentNM.imageData[4 * k + 1] / 255) * 2 - 1,
      (this.res.tangentNM.imageData[4 * k + 2] / 255) * 2 - 1,
    ]

    let e1 = subtract(this.varyingCoord[1], this.varyingCoord[0])
    let e2 = subtract(this.varyingCoord[2], this.varyingCoord[0])

    // NOTE: d(E) = d(UV) as in applying component vector
    // dT = du, dB = dv
    //
    // E_xyz * dT = UV_u
    // E_xyz * dB = UV_v
    //
    // i.e, E * TBN = UV
    // TBN = inv(E) * UV
    let invE = inverse3([e1, e2, intN])

    let t1 = subtract(this.varyingVertexTextureUV[1], this.varyingVertexTextureUV[0])
    let t2 = subtract(this.varyingVertexTextureUV[2], this.varyingVertexTextureUV[0])
    t1[2] = 0
    t2[2] = 0

    let TBN = matmul(invE, [t1, t2, [0, 0, 0]])

    TBN = transpose(TBN)
    iNormalize3(TBN[0])
    iNormalize3(TBN[1])
    TBN[2] = intN

    let normal = iNormalize3(matmul([tangentNormal], TBN)[0])
    let diff = Math.max(0, dot(normal, this.lightDirTrx))

    // specular
    // n * (2n * l) - l
    let dotted = 2 * dot(normal, this.lightDirTrx)
    let reflection = iNormalize3([
      normal[0] * dotted - this.lightDirTrx[0],
      normal[1] * dotted - this.lightDirTrx[1],
      normal[2] * dotted - this.lightDirTrx[2],
    ])

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

/**
 * Faster version of above [DiffuseTangentNormalSpecular]
 * hardcoded some calculations. Takes about half (2000ms -> 800ms)
 */
export class FastDiffuseTangentNormalSpecular {
  constructor(res, lightDir, uniM, uniMIT) {
    this.res = res
    this.lightDir = lightDir
    this.uniM = uniM
    this.uniMIT = uniMIT

    this.diffuseW = this.res.diffuse.header.width
    this.diffuseH = this.res.diffuse.header.height
    this.varyingVertexTextureUV = [[], []]
    this.vertexNormals = []
    this.varyingCoord = []
    this.lightDirTrx = iNormalize3(matmulvec4aug(this.uniM, lightDir, 1).slice(0, 3))
  }

  vertex(fi, vi) {
    let vertexNumber = this.res.faces[fi].v[vi]
    let vertex = this.res.vertices[vertexNumber]

    let coords = matmulvec4aug(this.uniM, vertex, 1)
    this.varyingCoord[vi] = [coords[0] / coords[3], coords[1] / coords[3], coords[2] / coords[3]]

    let vertexTextureNumber = this.res.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.res.vts[vertexTextureNumber]

    this.vertexNormals[vi] = iNormalize3(
      matmulvec4aug(this.uniMIT, this.res.vns[this.res.faces[fi].vn[vi]], 0).slice(0, 3),
    )
    return coords
  }

  fragment(bc, color) {
    let [u, v] = [
      parseInt(
        (bc[0] * this.varyingVertexTextureUV[0][0] +
          bc[1] * this.varyingVertexTextureUV[1][0] +
          bc[2] * this.varyingVertexTextureUV[2][0]) *
          1024,
      ),
      parseInt(
        (bc[0] * this.varyingVertexTextureUV[0][1] +
          bc[1] * this.varyingVertexTextureUV[1][1] +
          bc[2] * this.varyingVertexTextureUV[2][1]) *
          1024,
      ),
      parseInt(
        (bc[0] * this.varyingVertexTextureUV[0][2] +
          bc[1] * this.varyingVertexTextureUV[1][2] +
          bc[2] * this.varyingVertexTextureUV[2][2]) *
          1024,
      ),
    ]

    let k = u + (this.diffuseH - 1 - v) * this.diffuseW

    let intN = iNormalize3([
      bc[0] * this.vertexNormals[0][0] +
        bc[1] * this.vertexNormals[1][0] +
        bc[2] * this.vertexNormals[2][0],
      bc[0] * this.vertexNormals[0][1] +
        bc[1] * this.vertexNormals[1][1] +
        bc[2] * this.vertexNormals[2][1],
      bc[0] * this.vertexNormals[0][2] +
        bc[1] * this.vertexNormals[1][2] +
        bc[2] * this.vertexNormals[2][2],
    ])

    let tangentNormal = [
      (this.res.tangentNM.imageData[4 * k] / 255) * 2 - 1,
      (this.res.tangentNM.imageData[4 * k + 1] / 255) * 2 - 1,
      (this.res.tangentNM.imageData[4 * k + 2] / 255) * 2 - 1,
    ]

    let iE = inverse3([
      [
        this.varyingCoord[1][0] - this.varyingCoord[0][0],
        this.varyingCoord[1][1] - this.varyingCoord[0][1],
        this.varyingCoord[1][2] - this.varyingCoord[0][2],
      ],
      [
        this.varyingCoord[2][0] - this.varyingCoord[0][0],
        this.varyingCoord[2][1] - this.varyingCoord[0][1],
        this.varyingCoord[2][2] - this.varyingCoord[0][2],
      ],
      intN,
    ])

    let t1 = [
      this.varyingVertexTextureUV[1][0] - this.varyingVertexTextureUV[0][0],
      this.varyingVertexTextureUV[1][1] - this.varyingVertexTextureUV[0][1],
      0,
    ]
    let t2 = [
      this.varyingVertexTextureUV[2][0] - this.varyingVertexTextureUV[0][0],
      this.varyingVertexTextureUV[2][1] - this.varyingVertexTextureUV[0][1],
      0,
    ]

    // hardcoded to optimize calculation, avoid function calls
    // fragment() takes about half
    // TBN = matmul(iE, [t1, t2, [0, 0, 0]])
    // + set 3rd column with intN
    // + normalize column 1, 2
    let TBN = []
    TBN[0] = [iE[0][0] * t1[0] + iE[0][1] * t2[0], iE[0][0] * t1[1] + iE[0][1] * t2[1], intN[0]]
    TBN[1] = [iE[1][0] * t1[0] + iE[1][1] * t2[0], iE[1][0] * t1[1] + iE[1][1] * t2[1], intN[1]]
    TBN[2] = [iE[2][0] * t1[0] + iE[2][1] * t2[0], iE[2][0] * t1[1] + iE[2][1] * t2[1], intN[2]]

    let tNorm = Math.sqrt(TBN[0][0] ** 2 + TBN[1][0] ** 2 + TBN[2][0] ** 2)
    let bNorm = Math.sqrt(TBN[0][1] ** 2 + TBN[1][1] ** 2 + TBN[2][1] ** 2)

    TBN[0][0] /= tNorm
    TBN[1][0] /= tNorm
    TBN[2][0] /= tNorm

    TBN[0][1] /= bNorm
    TBN[1][1] /= bNorm
    TBN[2][1] /= bNorm

    let normal = iNormalize3(matmulvec(TBN, tangentNormal))
    let diff = Math.max(0, dot(normal, this.lightDirTrx))

    // specular
    // n * (2n * l) - l
    let dotted = 2 * dot(normal, this.lightDirTrx)
    let reflection = iNormalize3(
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
