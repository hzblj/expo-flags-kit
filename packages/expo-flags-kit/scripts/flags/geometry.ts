import svgpath from 'svgpath'

// [a, b, c, d, e, f] maps (x, y) to (a·x + c·y + e, b·x + d·y + f), as in SVG.
export type Matrix = readonly [number, number, number, number, number, number]

export type Point = readonly [number, number]

export type Box = {height: number; width: number; x: number; y: number}

export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]

// The result applies `inner` first, then `outer`.
export const multiply = (outer: Matrix, inner: Matrix): Matrix => [
  outer[0] * inner[0] + outer[2] * inner[1],
  outer[1] * inner[0] + outer[3] * inner[1],
  outer[0] * inner[2] + outer[2] * inner[3],
  outer[1] * inner[2] + outer[3] * inner[3],
  outer[0] * inner[4] + outer[2] * inner[5] + outer[4],
  outer[1] * inner[4] + outer[3] * inner[5] + outer[5],
]

export const translation = (x: number, y: number): Matrix => [1, 0, 0, 1, x, y]

const rotation = (degrees: number): Matrix => {
  const radians = (degrees * Math.PI) / 180

  return [Math.cos(radians), Math.sin(radians), -Math.sin(radians), Math.cos(radians), 0, 0]
}

const transformMatrix = (name: string, args: number[]): Matrix => {
  const [first = 0, second, third] = args

  switch (name) {
    case 'matrix': {
      if (args.length !== 6) {
        throw new Error(`matrix() takes 6 arguments, got ${args.length}`)
      }

      return args as unknown as Matrix
    }
    case 'translate':
      return translation(first, second ?? 0)
    case 'scale':
      return [first, 0, 0, second ?? first, 0, 0]
    case 'rotate':
      return second === undefined
        ? rotation(first)
        : multiply(translation(second, third ?? 0), multiply(rotation(first), translation(-second, -(third ?? 0))))
    case 'skewX':
      return [1, 0, Math.tan((first * Math.PI) / 180), 1, 0, 0]
    case 'skewY':
      return [1, Math.tan((first * Math.PI) / 180), 0, 1, 0, 0]
    default:
      throw new Error(`Unsupported transform ${name}()`)
  }
}

export const parseTransform = (value: string | null): Matrix => {
  if (!value) {
    return IDENTITY
  }

  let matrix = IDENTITY

  for (const [, name = '', args = ''] of value.matchAll(/([a-zA-Z]+)\s*\(([^)]*)\)/g)) {
    const numbers = args
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)

    matrix = multiply(matrix, transformMatrix(name, numbers))
  }

  return matrix
}

export const applyMatrix = (matrix: Matrix, [x, y]: Point): Point => [
  matrix[0] * x + matrix[2] * y + matrix[4],
  matrix[1] * x + matrix[3] * y + matrix[5],
]

// Uniform scale of the matrix, or null when it stretches or skews: a stroke width can only be carried
// into flattened path data when every direction scales the same.
export const uniformScale = (matrix: Matrix): number | null => {
  const [a, b, c, d] = matrix
  const scaleX = Math.hypot(a, b)
  const scaleY = Math.hypot(c, d)
  const isOrthogonal = Math.abs(a * c + b * d) < 1e-9

  return isOrthogonal && Math.abs(scaleX - scaleY) < 1e-9 ? scaleX : null
}

const cubicExtrema = (p0: number, p1: number, p2: number, p3: number): number[] => {
  const a = p1 - p0
  const b = p2 - p1
  const c = p3 - p2
  const qa = a - 2 * b + c
  const qb = 2 * (b - a)
  const roots: number[] = []

  if (Math.abs(qa) < 1e-12) {
    if (Math.abs(qb) > 1e-12) {
      roots.push(-a / qb)
    }
  } else {
    const discriminant = qb * qb - 4 * qa * a

    if (discriminant >= 0) {
      const sqrt = Math.sqrt(discriminant)
      roots.push((-qb + sqrt) / (2 * qa), (-qb - sqrt) / (2 * qa))
    }
  }

  return roots
    .filter(t => t > 0 && t < 1)
    .map(t => (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3)
}

const quadraticExtrema = (p0: number, p1: number, p2: number): number[] => {
  const denominator = p0 - 2 * p1 + p2

  if (Math.abs(denominator) < 1e-12) {
    return []
  }

  const t = (p0 - p1) / denominator

  return t > 0 && t < 1 ? [(1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2] : []
}

// The tight bounding box of the geometry (curve extrema, not control points), which is what
// objectBoundingBox gradients are relative to.
export const boundingBox = (pathData: string): Box => {
  const xs: number[] = []
  const ys: number[] = []

  svgpath(pathData)
    .abs()
    .unarc()
    .unshort()
    .iterate((segment, _index, x, y) => {
      switch (segment[0]) {
        case 'M':
        case 'L':
          xs.push(segment[1])
          ys.push(segment[2])
          break
        case 'H':
          xs.push(segment[1])
          break
        case 'V':
          ys.push(segment[1])
          break
        case 'C':
          xs.push(segment[5], ...cubicExtrema(x, segment[1], segment[3], segment[5]))
          ys.push(segment[6], ...cubicExtrema(y, segment[2], segment[4], segment[6]))
          break
        case 'Q':
          xs.push(segment[3], ...quadraticExtrema(x, segment[1], segment[3]))
          ys.push(segment[4], ...quadraticExtrema(y, segment[2], segment[4]))
          break
        default:
          break
      }
    })

  const minX = Math.min(...xs)
  const minY = Math.min(...ys)

  return {height: Math.max(...ys) - minY, width: Math.max(...xs) - minX, x: minX, y: minY}
}
