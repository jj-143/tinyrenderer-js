import {
  inverse3,
  inverse,
  dot,
  matmul,
  matmulvec,
  subtract,
  transpose,
  iNormalize3,
  matmulvec4aug,
  vecdiv,
  matmul4,
} from "./vecOps"

class Shader {
  updateUniform(uniform) {
    this.uniM = uniform.uniM ?? this.uniM
    this.uniMIT = uniform.uniM ? inverse(transpose(this.uniM)) : this.uniMIT
    this.lightDirTrx =
      uniform.uniM || uniform.lightDir
        ? iNormalize3(matmulvec4aug(this.uniM, uniform.lightDir, 1).slice(0, 3))
        : this.lightDirTrx
  }
}

export class GouraudShader extends Shader {
  constructor(uniform) {
    super()
    this.model = uniform.model
    this.varyingIntensity = []
  }

  vertex(fi, vi) {
    let vertexNumber = this.model.faces[fi].v[vi]
    let vertex = this.model.vertices[vertexNumber]
    let vertexNormal = iNormalize3(
      matmulvec4aug(this.uniMIT, this.model.vns[vertexNumber], 0).slice(0, 3),
    )

    let coord = matmulvec4aug(this.uniM, vertex, 1)
    this.varyingIntensity[vi] = dot(vertexNormal, this.lightDirTrx)
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
export class ShaderWithTexture extends Shader {
  constructor(uniform) {
    super()
    this.model = uniform.model
    this.diffuse = uniform.diffuse

    this.diffuseW = this.diffuse.header.width
    this.diffuseH = this.diffuse.header.height
    this.varyingIntensity = []
    this.varyingVertexTextureUV = []
  }

  vertex(fi, vi) {
    let vertexNumber = this.model.faces[fi].v[vi]
    let vertex = this.model.vertices[vertexNumber]
    let vertexNormal = iNormalize3(
      matmulvec4aug(this.uniMIT, this.model.vns[vertexNumber], 0).slice(0, 3),
    )

    let coord = matmulvec4aug(this.uniM, vertex, 1)
    this.varyingIntensity[vi] = Math.max(0, dot(vertexNormal, this.lightDirTrx))

    let vertexTextureNumber = this.model.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.model.vts[vertexTextureNumber]
    return coord
  }

  fragment(bc, color) {
    let intensity = dot(this.varyingIntensity, bc)
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v * 1024))
    let k = u + (this.diffuseH - 1 - v) * this.diffuseW
    color[0] = this.diffuse.imageData[4 * k] * intensity
    color[1] = this.diffuse.imageData[4 * k + 1] * intensity
    color[2] = this.diffuse.imageData[4 * k + 2] * intensity
    return false
  }
}

export class TextureAndNormalMap extends Shader {
  constructor(uniform) {
    super()
    this.model = uniform.model
    this.diffuse = uniform.diffuse
    this.normal = uniform.normal

    this.diffuseW = this.diffuse.header.width
    this.diffuseH = this.diffuse.header.height
    this.varyingVertexTextureUV = []
  }

  vertex(fi, vi) {
    let vertexNumber = this.model.faces[fi].v[vi]
    let vertex = this.model.vertices[vertexNumber]
    let coord = matmulvec4aug(this.uniM, vertex, 1)

    let vertexTextureNumber = this.model.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.model.vts[vertexTextureNumber]
    return coord
  }

  fragment(bc, color) {
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v * 1024))
    let k = u + (this.diffuseH - 1 - v) * this.diffuseW

    let normalData = iNormalize3([
      // FIXME: not tangentNM, it's global but stick to name for now.
      (this.normal.imageData[4 * k] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 1] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 2] / 255) * 2 - 1,
      // based on the ssloy's normal(facei, vi)
      // this effectively switch x with z
      // this makes no change to render weirdly.
      // .reverse(),
    ])

    let normal = iNormalize3(matmulvec4aug(this.uniMIT, normalData, 0).slice(0, 3))
    let intensity = Math.min(1, Math.max(0, dot(normal, this.lightDirTrx)))

    color[0] = this.diffuse.imageData[4 * k] * intensity
    color[1] = this.diffuse.imageData[4 * k + 1] * intensity
    color[2] = this.diffuse.imageData[4 * k + 2] * intensity
    color[3] = this.diffuse.imageData[4 * k + 3]
    return false
  }
}

// Phong lighting
export class DiffuseNormalSpecular extends Shader {
  constructor(uniform) {
    super()
    this.model = uniform.model
    this.diffuse = uniform.diffuse
    this.normal = uniform.normal
    this.specular = uniform.specular

    this.diffuseW = this.diffuse.header.width
    this.diffuseH = this.diffuse.header.height
    this.varyingVertexTextureUV = []
  }

  vertex(fi, vi) {
    let vertexNumber = this.model.faces[fi].v[vi]
    let vertex = this.model.vertices[vertexNumber]
    let coord = matmulvec4aug(this.uniM, vertex, 1)

    let vertexTextureNumber = this.model.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.model.vts[vertexTextureNumber]
    return coord
  }

  fragment(bc, color) {
    let [u, v] = matmul([bc], this.varyingVertexTextureUV)[0].map(v => parseInt(v * 1024))
    let k = u + (this.diffuseH - 1 - v) * this.diffuseW

    let normalData = iNormalize3([
      (this.normal.imageData[4 * k] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 1] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 2] / 255) * 2 - 1,
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
    let specData = this.specular.imageData[4 * k]
    let spec = Math.max(0, reflection[2]) ** specData
    let value = diff + spec * 0.6
    color[0] = Math.min(255, 5 + this.diffuse.imageData[4 * k] * value)
    color[1] = Math.min(255, 5 + this.diffuse.imageData[4 * k + 1] * value)
    color[2] = Math.min(255, 5 + this.diffuse.imageData[4 * k + 2] * value)
    color[3] = this.diffuse.imageData[4 * k + 3]
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
export class DiffuseTangentNormalSpecular extends Shader {
  constructor(uniform) {
    super()
    this.model = uniform.model
    this.diffuse = uniform.diffuse
    this.normal = uniform.normal
    this.specular = uniform.specular

    this.diffuseW = this.diffuse.header.width
    this.diffuseH = this.diffuse.header.height
    this.varyingVertexTextureUV = []
    this.vertexNormals = []
    this.varyingCoord = []
  }

  vertex(fi, vi) {
    let vertexNumber = this.model.faces[fi].v[vi]
    let vertex = this.model.vertices[vertexNumber]

    // apply viewport after, only proj, modelview here
    // it doesn't feel right to apply viewport here
    // since coordinate values are used to calculate
    // TNB matrix
    let coords = matmulvec4aug(this.uniM, vertex, 1)
    this.varyingCoord[vi] = [coords[0] / coords[3], coords[1] / coords[3], coords[2] / coords[3]]

    let vertexTextureNumber = this.model.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.model.vts[vertexTextureNumber]

    this.vertexNormals[vi] = iNormalize3(
      matmulvec4aug(this.uniMIT, this.model.vns[this.model.faces[fi].vn[vi]], 0).slice(0, 3),
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
      (this.normal.imageData[4 * k] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 1] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 2] / 255) * 2 - 1,
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
    let specData = this.specular.imageData[4 * k]
    let spec = Math.max(0, reflection[2]) ** specData
    let value = diff + spec * 0.6

    color[0] = Math.min(255, 5 + this.diffuse.imageData[4 * k] * value)
    color[1] = Math.min(255, 5 + this.diffuse.imageData[4 * k + 1] * value)
    color[2] = Math.min(255, 5 + this.diffuse.imageData[4 * k + 2] * value)
    color[3] = this.diffuse.imageData[4 * k + 3]
    return false
  }
}

/**
 * Faster version of above [DiffuseTangentNormalSpecular]
 * hardcoded some calculations. Takes about half (2000ms -> 800ms)
 */
export class FastDiffuseTangentNormalSpecular extends Shader {
  constructor(uniform) {
    super()
    // FIXME feels awkard to set model as uniform, fine for now tho
    this.model = uniform.model
    this.diffuse = uniform.diffuse
    this.normal = uniform.normal
    this.specular = uniform.specular

    this.diffuseW = this.diffuse.header.width
    this.diffuseH = this.diffuse.header.height
    this.varyingVertexTextureUV = []
    this.vertexNormals = []
    this.varyingCoord = []
  }

  vertex(fi, vi) {
    let vertexNumber = this.model.faces[fi].v[vi]
    let vertex = this.model.vertices[vertexNumber]

    let coords = matmulvec4aug(this.uniM, vertex, 1)
    this.varyingCoord[vi] = [coords[0] / coords[3], coords[1] / coords[3], coords[2] / coords[3]]

    let vertexTextureNumber = this.model.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.model.vts[vertexTextureNumber]

    this.vertexNormals[vi] = iNormalize3(
      matmulvec4aug(this.uniMIT, this.model.vns[this.model.faces[fi].vn[vi]], 0).slice(0, 3),
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
      (this.normal.imageData[4 * k] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 1] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 2] / 255) * 2 - 1,
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

    let dotted = 2 * dot(normal, this.lightDirTrx)
    let reflection = iNormalize3(
      subtract(
        normal.map(v => v * dotted),
        this.lightDirTrx,
      ),
    )

    // spec is 1024 * 1024 * 8bit data but TGALoader reads 32bits as [v,v,v,255]
    let specData = this.specular.imageData[4 * k]
    let spec = Math.max(0, reflection[2]) ** specData
    let value = diff + spec * 0.6

    color[0] = Math.min(255, 5 + this.diffuse.imageData[4 * k] * value)
    color[1] = Math.min(255, 5 + this.diffuse.imageData[4 * k + 1] * value)
    color[2] = Math.min(255, 5 + this.diffuse.imageData[4 * k + 2] * value)
    color[3] = this.diffuse.imageData[4 * k + 3]
    return false
  }
}

export class DepthShader extends Shader {
  constructor(uniform) {
    super()
    this.model = uniform.model
    this.viewport = uniform.viewport
  }

  vertex(fi, vi) {
    let vertexNumber = this.model.faces[fi].v[vi]
    let vertex = this.model.vertices[vertexNumber]
    let coord = matmulvec4aug(this.uniM, vertex, 1)
    return coord
  }

  fragment(bc, color) {
    return false
  }
}

export class WithShadowMapping extends Shader {
  constructor(uniform, shadowBuffer) {
    super()
    this.model = uniform.model
    this.diffuse = uniform.diffuse
    this.normal = uniform.normal
    this.specular = uniform.specular

    this.diffuseW = this.diffuse.header.width
    this.diffuseH = this.diffuse.header.height
    this.varyingVertexTextureUV = []
    this.vertexNormals = []
    this.varyingCoord = [[], [], []]
    this.varyingCoordNotViewport = []

    // using depthShader
    this.viewport = uniform.viewport
    this.bufferWidth = uniform.bufferWidth
    this.shadowBuffer = shadowBuffer
    this.uniform = uniform
  }

  updateUniform(uniform) {
    this.uniM = uniform.uniM ?? this.uniM
    this.uniMIT = uniform.uniM ? inverse(transpose(this.uniM)) : this.uniMIT
    this.lightDirTrx =
      uniform.uniM || uniform.lightDir
        ? iNormalize3(matmulvec4aug(this.uniM, uniform.lightDir, 1).slice(0, 3))
        : this.lightDirTrx

    // override to do below
    let frameToObject = inverse(matmul(this.viewport, this.uniM))
    let objectToDepth = this.objectToDepth

    this.frameToDepthBuffer = matmul4(objectToDepth, frameToObject)
  }

  vertex(fi, vi) {
    let vertexNumber = this.model.faces[fi].v[vi]
    let vertex = this.model.vertices[vertexNumber]

    let coords = matmulvec4aug(this.uniM, vertex, 1)

    // use viewported varyingCoord
    let withViewport = matmul4(this.viewport, this.uniM)
    let viewported = matmulvec4aug(withViewport, vertex, 1)

    // column vectors
    // TODO also apply this to (and in calc TBN in fragment())
    this.varyingCoord[0][vi] = viewported[0] / viewported[3]
    this.varyingCoord[1][vi] = viewported[1] / viewported[3]
    this.varyingCoord[2][vi] = viewported[2] / viewported[3]

    let vertexTextureNumber = this.model.faces[fi].vt[vi]
    this.varyingVertexTextureUV[vi] = this.model.vts[vertexTextureNumber]

    this.vertexNormals[vi] = iNormalize3(
      matmulvec4aug(this.uniMIT, this.model.vns[this.model.faces[fi].vn[vi]], 0).slice(0, 3),
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
      (this.normal.imageData[4 * k] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 1] / 255) * 2 - 1,
      (this.normal.imageData[4 * k + 2] / 255) * 2 - 1,
    ]

    let iE = inverse3([
      [
        this.varyingCoord[0][1] - this.varyingCoord[0][0],
        this.varyingCoord[1][1] - this.varyingCoord[1][0],
        this.varyingCoord[2][1] - this.varyingCoord[2][0],
      ],
      [
        this.varyingCoord[0][2] - this.varyingCoord[0][0],
        this.varyingCoord[1][2] - this.varyingCoord[1][0],
        this.varyingCoord[2][2] - this.varyingCoord[2][0],
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

    let dotted = 2 * dot(normal, this.lightDirTrx)
    let reflection = iNormalize3(
      subtract(
        normal.map(v => v * dotted),
        this.lightDirTrx,
      ),
    )

    let specData = this.specular.imageData[4 * k]
    let spec = Math.max(0, reflection[2]) ** (5 + specData)

    //
    // shadow mapping stuff
    let pixel = matmulvec(this.varyingCoord, bc)

    let shadowBufferPixel = matmulvec4aug(this.frameToDepthBuffer, pixel, 1)
    shadowBufferPixel = vecdiv(shadowBufferPixel, shadowBufferPixel[3])
    let shadowBufferIdx =
      (this.bufferWidth - 1 - parseInt(shadowBufferPixel[1])) * this.bufferWidth +
      parseInt(shadowBufferPixel[0])

    // it is "exposed to light" when this pixel, mapped to view from light,
    // has higher z value (closer to camera, or light here) than closest value
    // seen from the light, which stored in shadow buffer
    // magic 5 for 255 depth, 15 for width (800)
    let isExposed = this.shadowBuffer[shadowBufferIdx] < shadowBufferPixel[2] + 5
    let shadow = 0.3 + 0.7 * isExposed

    let value = shadow * (1.2 * diff + spec * 0.6)

    color[0] = 20 + this.diffuse.imageData[4 * k] * value
    color[1] = 20 + this.diffuse.imageData[4 * k + 1] * value
    color[2] = 20 + this.diffuse.imageData[4 * k + 2] * value
    color[3] = this.diffuse.imageData[4 * k + 3]
    return false
  }
}
