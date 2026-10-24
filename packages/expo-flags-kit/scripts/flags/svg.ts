import {type Clip, FLAG_HEIGHT, FLAG_WIDTH, type Flag, formatNumber, type Paint, type Shape} from './normalize'

const clipKey = (clip: Clip) => `${clip.rule}:${clip.pathData}`

// Consecutive shapes under the same clips share one clipped group.
const groupByClips = (shapes: Shape[]): Shape[][] => {
  const groups: Shape[][] = []

  for (const shape of shapes) {
    const previous = groups.at(-1)
    const key = shape.clips.map(clipKey).join('|')

    if (previous?.[0] && previous[0].clips.map(clipKey).join('|') === key) {
      previous.push(shape)
    } else {
      groups.push([shape])
    }
  }

  return groups
}

// A flag as plain SVG: paths, user-space linear gradients and clip paths only. CoreSVG on iOS and every
// browser render this subset the same way, unlike the masks, filters and <use> references in the source.
export const toSvg = (flag: Flag): string => {
  const definitions: string[] = []
  const ids = new Map<string, string>()

  const define = (key: string, prefix: string, element: (id: string) => string) => {
    let id = ids.get(key)

    if (id === undefined) {
      id = `${prefix}${ids.size}`
      ids.set(key, id)
      definitions.push(element(id))
    }

    return id
  }

  const paint = (value: Paint) => {
    if (value.type === 'color') {
      return value.color
    }

    const stops = value.stops
      .map(stop => {
        const opacity = stop.opacity < 1 ? ` stop-opacity="${formatNumber(stop.opacity)}"` : ''

        return `<stop offset="${formatNumber(stop.offset)}" stop-color="${stop.color}"${opacity}/>`
      })
      .join('')
    const [x1, y1] = value.start.map(formatNumber)
    const [x2, y2] = value.end.map(formatNumber)
    const coordinates = `x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`

    const id = define(
      `gradient:${coordinates}:${stops}`,
      'g',
      id => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" ${coordinates}>${stops}</linearGradient>`
    )

    return `url(#${id})`
  }

  const path = (shape: Shape) => {
    const attributes = [`d="${shape.pathData}"`]

    if (shape.fill) {
      attributes.push(`fill="${paint(shape.fill.paint)}"`)

      if (shape.fill.rule === 'evenodd') {
        attributes.push('fill-rule="evenodd"')
      }

      if (shape.fill.opacity < 1) {
        attributes.push(`fill-opacity="${formatNumber(shape.fill.opacity)}"`)
      }
    } else {
      attributes.push('fill="none"')
    }

    if (shape.stroke) {
      const {stroke} = shape
      attributes.push(`stroke="${paint(stroke.paint)}"`, `stroke-width="${formatNumber(stroke.width)}"`)

      if (stroke.opacity < 1) {
        attributes.push(`stroke-opacity="${formatNumber(stroke.opacity)}"`)
      }

      if (stroke.linecap !== 'butt') {
        attributes.push(`stroke-linecap="${stroke.linecap}"`)
      }

      if (stroke.linejoin !== 'miter') {
        attributes.push(`stroke-linejoin="${stroke.linejoin}"`)
      }

      if (stroke.miterlimit !== 4) {
        attributes.push(`stroke-miterlimit="${formatNumber(stroke.miterlimit)}"`)
      }
    }

    return `<path ${attributes.join(' ')}/>`
  }

  const body = groupByClips(flag.shapes).map(group => {
    const content = group.map(path).join('')

    return (group[0]?.clips ?? []).reduceRight((inner, clip) => {
      const rule = clip.rule === 'evenodd' ? ' clip-rule="evenodd"' : ''
      const id = define(
        `clip:${clipKey(clip)}`,
        'c',
        id => `<clipPath id="${id}"><path d="${clip.pathData}"${rule}/></clipPath>`
      )

      return `<g clip-path="url(#${id})">${inner}</g>`
    }, content)
  })

  const defs = definitions.length > 0 ? `<defs>${definitions.join('')}</defs>` : ''

  // Browsers keep an SVG's proportions even in a stretched background, so contentFit "fill" needs
  // preserveAspectRatio="none". Cover and contain draw into a 21:15 box, where it changes nothing.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${FLAG_WIDTH}" height="${FLAG_HEIGHT}" viewBox="0 0 ${FLAG_WIDTH} ${FLAG_HEIGHT}" preserveAspectRatio="none">`,
    defs,
    ...body,
    '</svg>\n',
  ].join('')
}
