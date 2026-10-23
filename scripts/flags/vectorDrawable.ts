import {type Clip, FLAG_HEIGHT, FLAG_WIDTH, type Flag, formatNumber, type Paint, type Shape} from './normalize'

export const drawableName = (code: string) => `expo_flags_kit_${code.toLowerCase().replace(/-/g, '_')}`

const argb = (color: string, opacity: number) => {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()

  return `#${alpha}${color.slice(1)}`
}

const subpathCount = (pathData: string) => pathData.match(/[Mm]/g)?.length ?? 0

const paintAttributes = (name: 'fillColor' | 'strokeColor', paint: Paint, indent: string) => {
  if (paint.type === 'color') {
    return {attributes: [`android:${name}="${paint.color}"`], children: []}
  }

  const items = paint.stops.map(
    stop =>
      `${indent}      <item android:offset="${formatNumber(stop.offset)}" android:color="${argb(stop.color, stop.opacity)}"/>`
  )

  return {
    attributes: [],
    children: [
      `${indent}  <aapt:attr name="android:${name}">`,
      `${indent}    <gradient`,
      `${indent}        android:type="linear"`,
      `${indent}        android:startX="${formatNumber(paint.start[0])}"`,
      `${indent}        android:startY="${formatNumber(paint.start[1])}"`,
      `${indent}        android:endX="${formatNumber(paint.end[0])}"`,
      `${indent}        android:endY="${formatNumber(paint.end[1])}">`,
      ...items,
      `${indent}    </gradient>`,
      `${indent}  </aapt:attr>`,
    ],
  }
}

const path = (shape: Shape, indent: string): string[] => {
  const attributes = [`android:pathData="${shape.pathData}"`]
  const children: string[] = []

  if (shape.fill) {
    const fill = paintAttributes('fillColor', shape.fill.paint, indent)
    attributes.push(...fill.attributes)
    children.push(...fill.children)

    if (shape.fill.opacity < 1) {
      attributes.push(`android:fillAlpha="${formatNumber(shape.fill.opacity)}"`)
    }

    if (shape.fill.rule === 'evenodd') {
      attributes.push('android:fillType="evenOdd"')
    }
  }

  if (shape.stroke) {
    const {stroke} = shape
    const paint = paintAttributes('strokeColor', stroke.paint, indent)
    attributes.push(...paint.attributes, `android:strokeWidth="${formatNumber(stroke.width)}"`)
    children.push(...paint.children)

    if (stroke.opacity < 1) {
      attributes.push(`android:strokeAlpha="${formatNumber(stroke.opacity)}"`)
    }

    if (stroke.linecap !== 'butt') {
      attributes.push(`android:strokeLineCap="${stroke.linecap}"`)
    }

    if (stroke.linejoin !== 'miter') {
      attributes.push(`android:strokeLineJoin="${stroke.linejoin}"`)
    }

    if (stroke.miterlimit !== 4) {
      attributes.push(`android:strokeMiterLimit="${formatNumber(stroke.miterlimit)}"`)
    }
  }

  const [first, ...rest] = attributes
  const opening = [`${indent}<path ${first}`, ...rest.map(attribute => `${indent}    ${attribute}`)]

  if (children.length === 0) {
    opening[opening.length - 1] += '/>'
    return opening
  }

  opening[opening.length - 1] += '>'

  return [...opening, ...children, `${indent}</path>`]
}

// VectorDrawable clip paths have no fill rule; they always use non-zero winding.
const clipPath = (clip: Clip, code: string, indent: string) => {
  if (clip.rule === 'evenodd' && subpathCount(clip.pathData) > 1) {
    throw new Error(`${code}: an even-odd clip with several subpaths has no VectorDrawable equivalent`)
  }

  return `${indent}<clip-path android:pathData="${clip.pathData}"/>`
}

const shapes = (flag: Flag, list: Shape[], depth: number, indent: string): string[] => {
  const lines: string[] = []
  let index = 0

  while (index < list.length) {
    const shape = list[index] as Shape
    const clip = shape.clips[depth]

    if (!clip) {
      lines.push(...path(shape, indent))
      index += 1
      continue
    }

    // Consecutive shapes under the same clip at this depth share one group.
    let end = index + 1

    while (end < list.length && list[end]?.clips[depth]?.pathData === clip.pathData) {
      end += 1
    }

    lines.push(
      `${indent}<group>`,
      clipPath(clip, flag.code, `${indent}  `),
      ...shapes(flag, list.slice(index, end), depth + 1, `${indent}  `),
      `${indent}</group>`
    )
    index = end
  }

  return lines
}

export const toVectorDrawable = (flag: Flag): string =>
  [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<!-- Generated from FlagKit (MIT, Bowtie AB) by scripts/generate.ts. Do not edit. -->',
    '<vector xmlns:android="http://schemas.android.com/apk/res/android"',
    '    xmlns:aapt="http://schemas.android.com/aapt"',
    `    android:width="${FLAG_WIDTH}dp"`,
    `    android:height="${FLAG_HEIGHT}dp"`,
    `    android:viewportWidth="${FLAG_WIDTH}"`,
    `    android:viewportHeight="${FLAG_HEIGHT}">`,
    ...shapes(flag, flag.shapes, 0, '  '),
    '</vector>',
    '',
  ].join('\n')
