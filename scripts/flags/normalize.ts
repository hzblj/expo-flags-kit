import {DOMParser, type Element} from '@xmldom/xmldom'
import svgpath from 'svgpath'

import {
  applyMatrix,
  boundingBox,
  IDENTITY,
  type Matrix,
  multiply,
  type Point,
  parseTransform,
  translation,
  uniformScale,
} from './geometry'

// FlagKit draws every flag on a 21 × 15 canvas.
export const FLAG_WIDTH = 21
export const FLAG_HEIGHT = 15

const PRECISION = 3

export type FillRule = 'evenodd' | 'nonzero'

export type GradientStop = {color: string; offset: number; opacity: number}

export type Paint = {color: string; type: 'color'} | {end: Point; start: Point; stops: GradientStop[]; type: 'linear'}

export type Clip = {pathData: string; rule: FillRule}

export type Fill = {opacity: number; paint: Paint; rule: FillRule}

export type Stroke = {
  linecap: 'butt' | 'round' | 'square'
  linejoin: 'bevel' | 'miter' | 'round'
  miterlimit: number
  opacity: number
  paint: Paint
  width: number
}

// A flattened shape: user-space path data with its paint and the clips around it, nothing left to resolve.
export type Shape = {clips: Clip[]; fill: Fill | null; pathData: string; stroke: Stroke | null}

export type Flag = {code: string; shapes: Shape[]}

type Style = {
  fill: string
  fillOpacity: number
  fillRule: FillRule
  stroke: string
  strokeLinecap: Stroke['linecap']
  strokeLinejoin: Stroke['linejoin']
  strokeMiterlimit: number
  strokeOpacity: number
  strokeWidth: number
}

type Context = {clips: Clip[]; matrix: Matrix; opacity: number; style: Style}

const DEFAULT_STYLE: Style = {
  fill: '#000000',
  fillOpacity: 1,
  fillRule: 'nonzero',
  stroke: 'none',
  strokeLinecap: 'butt',
  strokeLinejoin: 'miter',
  strokeMiterlimit: 4,
  strokeOpacity: 1,
  strokeWidth: 1,
}

const NAMED_COLORS: Record<string, string> = {black: '#000000', white: '#FFFFFF'}

const SKIPPED: ReadonlySet<string | null> = new Set([
  'defs',
  'desc',
  'filter',
  'linearGradient',
  'mask',
  'metadata',
  'title',
])

const SHAPES: ReadonlySet<string | null> = new Set(['circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect'])

const children = (element: Element): Element[] =>
  Array.from(element.childNodes).filter((node): node is Element => node.nodeType === node.ELEMENT_NODE)

const attribute = (element: Element, name: string): string | null => {
  const value = element.getAttribute(name)

  return value === null || value === '' ? null : value
}

const number = (element: Element, name: string, fallback = 0): number => {
  const value = attribute(element, name)

  return value === null ? fallback : Number.parseFloat(value)
}

// Gradient coordinates and stop offsets: "50%" or "0.5".
const fraction = (value: string | null, fallback: number): number => {
  if (value === null) {
    return fallback
  }

  return value.endsWith('%') ? Number.parseFloat(value) / 100 : Number.parseFloat(value)
}

const color = (value: string): string => {
  const named = NAMED_COLORS[value.toLowerCase()]

  if (named) {
    return named
  }

  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value)

  if (short) {
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toUpperCase()
  }

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value.toUpperCase()
  }

  throw new Error(`Unsupported color ${value}`)
}

const inheritStyle = (parent: Style, element: Element): Style => ({
  fill: attribute(element, 'fill') ?? parent.fill,
  fillOpacity: number(element, 'fill-opacity', parent.fillOpacity),
  fillRule: (attribute(element, 'fill-rule') as FillRule | null) ?? parent.fillRule,
  stroke: attribute(element, 'stroke') ?? parent.stroke,
  strokeLinecap: (attribute(element, 'stroke-linecap') as Stroke['linecap'] | null) ?? parent.strokeLinecap,
  strokeLinejoin: (attribute(element, 'stroke-linejoin') as Stroke['linejoin'] | null) ?? parent.strokeLinejoin,
  strokeMiterlimit: number(element, 'stroke-miterlimit', parent.strokeMiterlimit),
  strokeOpacity: number(element, 'stroke-opacity', parent.strokeOpacity),
  strokeWidth: number(element, 'stroke-width', parent.strokeWidth),
})

const points = (element: Element): string[] => {
  const values = (attribute(element, 'points') ?? '').trim().split(/[\s,]+/)
  const pairs: string[] = []

  for (let index = 0; index + 1 < values.length; index += 2) {
    pairs.push(`${values[index]} ${values[index + 1]}`)
  }

  return pairs
}

// Path data for a basic shape in its own coordinate system, or null when the shape renders nothing.
const shapePathData = (element: Element): string | null => {
  switch (element.localName) {
    case 'path':
      return attribute(element, 'd')
    case 'rect': {
      const x = number(element, 'x')
      const y = number(element, 'y')
      const width = number(element, 'width')
      const height = number(element, 'height')

      if (width <= 0 || height <= 0) {
        return null
      }

      const rxAttribute = attribute(element, 'rx')
      const ryAttribute = attribute(element, 'ry')
      const rx = Math.min(Number.parseFloat(rxAttribute ?? ryAttribute ?? '0'), width / 2)
      const ry = Math.min(Number.parseFloat(ryAttribute ?? rxAttribute ?? '0'), height / 2)

      if (rx <= 0 || ry <= 0) {
        return `M${x} ${y}H${x + width}V${y + height}H${x}Z`
      }

      return [
        `M${x + rx} ${y}H${x + width - rx}`,
        `A${rx} ${ry} 0 0 1 ${x + width} ${y + ry}V${y + height - ry}`,
        `A${rx} ${ry} 0 0 1 ${x + width - rx} ${y + height}H${x + rx}`,
        `A${rx} ${ry} 0 0 1 ${x} ${y + height - ry}V${y + ry}`,
        `A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`,
      ].join('')
    }
    case 'circle':
    case 'ellipse': {
      const cx = number(element, 'cx')
      const cy = number(element, 'cy')
      const rx = element.localName === 'circle' ? number(element, 'r') : number(element, 'rx')
      const ry = element.localName === 'circle' ? rx : number(element, 'ry')

      if (rx <= 0 || ry <= 0) {
        return null
      }

      return `M${cx + rx} ${cy}A${rx} ${ry} 0 1 1 ${cx - rx} ${cy}A${rx} ${ry} 0 1 1 ${cx + rx} ${cy}Z`
    }
    case 'line':
      return `M${number(element, 'x1')} ${number(element, 'y1')}L${number(element, 'x2')} ${number(element, 'y2')}`
    case 'polygon':
    case 'polyline': {
      const [first, ...rest] = points(element)

      if (!first) {
        return null
      }

      return `M${first}${rest.map(point => `L${point}`).join('')}${element.localName === 'polygon' ? 'Z' : ''}`
    }
    default:
      throw new Error(`Unsupported shape <${element.localName}>`)
  }
}

const subpathsOverlap = (pathData: string): boolean => {
  const boxes = svgpath(pathData).abs().toString().split(/(?=M)/).map(boundingBox)

  return boxes.some((box, index) =>
    boxes
      .slice(index + 1)
      .some(
        other =>
          box.x < other.x + other.width &&
          other.x < box.x + box.width &&
          box.y < other.y + other.height &&
          other.y < box.y + box.height
      )
  )
}

export const formatNumber = (value: number): string => {
  const rounded = Number(value.toFixed(PRECISION))

  return String(Object.is(rounded, -0) ? 0 : rounded)
}

class FlagNormalizer {
  private readonly elements = new Map<string, Element>()

  readonly notes: string[] = []

  constructor(
    private readonly code: string,
    private readonly root: Element
  ) {
    const index = (element: Element) => {
      const id = attribute(element, 'id')

      if (id !== null) {
        this.elements.set(id, element)
      }

      children(element).forEach(index)
    }

    index(root)
  }

  normalize(): Flag {
    const viewBox = attribute(this.root, 'viewBox')

    if (viewBox !== `0 0 ${FLAG_WIDTH} ${FLAG_HEIGHT}`) {
      throw new Error(`${this.code}: unexpected viewBox ${viewBox}`)
    }

    const shapes: Shape[] = []
    const context: Context = {clips: [], matrix: IDENTITY, opacity: 1, style: DEFAULT_STYLE}

    for (const child of children(this.root)) {
      this.walk(child, context, shapes)
    }

    return {code: this.code, shapes}
  }

  private reference(value: string | null, what: string): Element {
    const id = value?.match(/^url\(#(.+)\)$/)?.[1] ?? value?.match(/^#(.+)$/)?.[1]
    const element = id === undefined ? undefined : this.elements.get(id)

    if (!element) {
      throw new Error(`${this.code}: missing ${what} ${value}`)
    }

    return element
  }

  // Style that an element inherits from its ancestors in the document, for content such as a mask that is
  // rendered where it is defined rather than where it is referenced.
  private documentStyle(element: Element): Style {
    const ancestors: Element[] = []

    for (let node = element.parentNode; node && node.nodeType === node.ELEMENT_NODE; node = node.parentNode) {
      ancestors.unshift(node as Element)
    }

    return ancestors.reduce(inheritStyle, DEFAULT_STYLE)
  }

  // FlagKit's masks are white shapes, so each one is a clip path in the masked element's user space.
  private maskClip(value: string, matrix: Matrix): Clip {
    const mask = this.reference(value, 'mask')
    const shapes: Shape[] = []
    const context: Context = {clips: [], matrix, opacity: 1, style: this.documentStyle(mask)}
    const maskContext = this.enter(mask, context)

    for (const child of children(mask)) {
      this.walk(child, maskContext, shapes)
    }

    const [shape, ...rest] = shapes
    const isOpaqueWhite =
      shape?.fill?.paint.type === 'color' && shape.fill.paint.color === '#FFFFFF' && shape.fill.opacity === 1

    if (!shape || rest.length > 0 || !isOpaqueWhite || shape.stroke || shape.clips.length > 0) {
      throw new Error(`${this.code}: mask ${value} is not a single opaque white shape`)
    }

    // VectorDrawable clips are always non-zero. Even-odd gives the same area when no two subpaths overlap
    // and none crosses itself; verify.ts renders the result against the source to catch the second case.
    const rule = shape.fill?.rule === 'evenodd' && subpathsOverlap(shape.pathData) ? 'evenodd' : 'nonzero'

    return {pathData: shape.pathData, rule}
  }

  private enter(element: Element, parent: Context): Context {
    const matrix = multiply(parent.matrix, parseTransform(attribute(element, 'transform')))
    const mask = element.localName === 'mask' ? null : attribute(element, 'mask')

    return {
      clips: mask === null ? parent.clips : [...parent.clips, this.maskClip(mask, matrix)],
      matrix,
      opacity: parent.opacity * number(element, 'opacity', 1),
      style: inheritStyle(parent.style, element),
    }
  }

  private walk(element: Element, parent: Context, shapes: Shape[]) {
    if (SKIPPED.has(element.localName)) {
      return
    }

    // Sketch exports a drop shadow as a filtered copy of the shape. The shadows in FlagKit are 6 % black
    // and half a point wide, below what is visible at flag sizes, and neither target format has filters.
    if (attribute(element, 'filter') !== null) {
      this.notes.push(`dropped the shadow ${attribute(element, 'filter')}`)
      return
    }

    const context = this.enter(element, parent)

    if (element.localName === 'g' || element.localName === 'svg') {
      if (context.opacity < 1 && children(element).length > 1) {
        this.notes.push(`group opacity ${context.opacity} applied to each of its shapes`)
      }

      for (const child of children(element)) {
        this.walk(child, context, shapes)
      }

      return
    }

    if (element.localName === 'use') {
      const target = this.reference(attribute(element, 'xlink:href') ?? attribute(element, 'href'), 'use target')
      const offset = translation(number(element, 'x'), number(element, 'y'))

      this.walk(target, {...context, matrix: multiply(context.matrix, offset)}, shapes)
      return
    }

    if (!SHAPES.has(element.localName)) {
      throw new Error(`${this.code}: unsupported element <${element.localName}>`)
    }

    const shape = this.shape(element, context)

    if (shape) {
      shapes.push(shape)
    }
  }

  private shape(element: Element, context: Context): Shape | null {
    const local = shapePathData(element)

    if (local === null) {
      return null
    }

    const {style} = context
    const fillOpacity = context.opacity * style.fillOpacity
    const strokeOpacity = context.opacity * style.strokeOpacity
    const fillPaint = fillOpacity > 0 ? this.paint(style.fill, local, context.matrix) : null
    const strokePaint =
      strokeOpacity > 0 && style.strokeWidth > 0 ? this.paint(style.stroke, local, context.matrix) : null

    if (!fillPaint && !strokePaint) {
      return null
    }

    let stroke: Stroke | null = null

    if (strokePaint) {
      const scale = uniformScale(context.matrix)

      if (scale === null) {
        throw new Error(`${this.code}: a stroke under a non-uniform transform cannot be flattened`)
      }

      stroke = {
        linecap: style.strokeLinecap,
        linejoin: style.strokeLinejoin,
        miterlimit: style.strokeMiterlimit,
        opacity: strokeOpacity,
        paint: strokePaint,
        width: style.strokeWidth * scale,
      }
    }

    return {
      clips: context.clips,
      fill: fillPaint ? {opacity: fillOpacity, paint: fillPaint, rule: style.fillRule} : null,
      pathData: svgpath(local)
        .matrix([...context.matrix])
        .round(PRECISION)
        .toString(),
      stroke,
    }
  }

  private paint(value: string, local: string, matrix: Matrix): Paint | null {
    if (value === 'none') {
      return null
    }

    if (!value.startsWith('url(')) {
      return {color: color(value), type: 'color'}
    }

    const gradient = this.reference(value, 'gradient')

    if (gradient.localName !== 'linearGradient') {
      throw new Error(`${this.code}: unsupported paint <${gradient.localName}>`)
    }

    let gradientMatrix = matrix

    if (attribute(gradient, 'gradientUnits') !== 'userSpaceOnUse') {
      const box = boundingBox(local)

      if (box.width === 0 || box.height === 0) {
        throw new Error(`${this.code}: gradient ${value} on a shape without area`)
      }

      gradientMatrix = multiply(matrix, [box.width, 0, 0, box.height, box.x, box.y])
    }

    gradientMatrix = multiply(gradientMatrix, parseTransform(attribute(gradient, 'gradientTransform')))

    const start: Point = [fraction(attribute(gradient, 'x1'), 0), fraction(attribute(gradient, 'y1'), 0)]
    const end: Point = [fraction(attribute(gradient, 'x2'), 1), fraction(attribute(gradient, 'y2'), 0)]

    let previousOffset = 0

    const stops = children(gradient)
      .filter(stop => stop.localName === 'stop')
      .map(stop => {
        previousOffset = Math.min(Math.max(fraction(attribute(stop, 'offset'), 0), previousOffset), 1)

        return {
          color: color(attribute(stop, 'stop-color') ?? '#000000'),
          offset: previousOffset,
          opacity: number(stop, 'stop-opacity', 1),
        }
      })

    return {...userSpaceGradient(gradientMatrix, start, end), stops, type: 'linear'}
  }
}

// Endpoints in user space of a linear gradient defined in another space. Mapping both endpoints through the
// matrix is only right for rotations and uniform scales: a bounding box that isn't square stretches the
// gradient, and its stripes must stay perpendicular to the gradient vector after the stretch. The gradient
// value is t(q) = (q − P1) · g with g = L⁻ᵀ·d / |d|², where L is the linear part of the matrix and d the
// gradient vector, so the user-space end point is P1 + g / |g|².
const userSpaceGradient = (matrix: Matrix, start: Point, end: Point): {end: Point; start: Point} => {
  const [a, b, c, d] = matrix
  const determinant = a * d - b * c
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const lengthSquared = dx * dx + dy * dy

  if (Math.abs(determinant) < 1e-12 || lengthSquared === 0) {
    throw new Error('Degenerate gradient')
  }

  // L = [a c; b d], so L⁻ᵀ = [d −b; −c a] / det
  const gx = (d * dx - b * dy) / determinant / lengthSquared
  const gy = (-c * dx + a * dy) / determinant / lengthSquared
  const gLengthSquared = gx * gx + gy * gy
  const userStart = applyMatrix(matrix, start)

  return {end: [userStart[0] + gx / gLengthSquared, userStart[1] + gy / gLengthSquared], start: userStart}
}

export const normalizeFlag = (code: string, source: string): {flag: Flag; notes: string[]} => {
  const document = new DOMParser().parseFromString(source, 'image/svg+xml')
  const root = document.documentElement

  if (!root || root.localName !== 'svg') {
    throw new Error(`${code}: not an SVG document`)
  }

  const normalizer = new FlagNormalizer(code, root)

  return {flag: normalizer.normalize(), notes: normalizer.notes}
}
