import assert from 'node:assert/strict'
import {describe, it} from 'node:test'

import {normalizeFlag, type Paint, type Shape} from '../scripts/flags/normalize'
import {toSvg} from '../scripts/flags/svg'
import {drawableName, toVectorDrawable} from '../scripts/flags/vectorDrawable'

const flag = (body: string, defs = '') =>
  normalizeFlag(
    'XX',
    `<svg viewBox="0 0 21 15" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>${defs}</defs>${body}</svg>`
  )

const linear = (shape: Shape | undefined): Extract<Paint, {type: 'linear'}> => {
  const paint = shape?.fill?.paint
  assert.equal(paint?.type, 'linear')

  return paint
}

const close = (actual: readonly number[], expected: readonly number[]) => {
  actual.forEach((value, index) => {
    assert.ok(Math.abs(value - (expected[index] ?? Number.NaN)) < 1e-9, `${actual} ≉ ${expected}`)
  })
}

const VERTICAL =
  '<linearGradient id="v" x1="50%" y1="0%" x2="50%" y2="100%"><stop stop-color="#FFF" offset="0%"/><stop stop-color="#000" offset="100%"/></linearGradient>'

describe('normalizeFlag', () => {
  it('flattens shapes into user-space path data', () => {
    const {flag: result} = flag(
      '<g transform="translate(1, 2)"><rect x="1" y="1" width="2" height="3" fill="#ff0000"/></g>'
    )

    assert.deepEqual(result.shapes, [
      {
        clips: [],
        fill: {opacity: 1, paint: {color: '#FF0000', type: 'color'}, rule: 'nonzero'},
        pathData: 'M2 3H4V6H2Z',
        stroke: null,
      },
    ])
  })

  it('resolves bounding-box gradients to user space', () => {
    const {flag: result} = flag('<rect x="0" y="7" width="21" height="8" fill="url(#v)"/>', VERTICAL)
    const paint = linear(result.shapes[0])

    close(paint.start, [10.5, 7])
    close(paint.end, [10.5, 15])
    assert.deepEqual(
      paint.stops.map(stop => stop.color),
      ['#FFFFFF', '#000000']
    )
  })

  it('keeps diagonal gradient stripes perpendicular after a non-square bounding box stretches them', () => {
    const diagonal =
      '<linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0"/><stop offset="1"/></linearGradient>'
    const {flag: result} = flag('<rect width="20" height="10" fill="url(#d)"/>', diagonal)
    const {end, start} = linear(result.shapes[0])

    // In the box, t = (u + v) / 2, so in user space t = x / 40 + y / 20: stripes run along (20, −10), and the
    // end point lies on the stripe through the far corner (20, 10), where t = 1.
    close(start, [0, 0])
    close([(end[0] - start[0]) * 20 - (end[1] - start[1]) * 10], [0])
    close([end[0] / 40 + end[1] / 20], [1])
    close(end, [8, 16])
  })

  it('rotates gradients with their shape', () => {
    const {flag: result} = flag(
      '<rect x="0" y="0" width="2" height="2" transform="rotate(90 1 1)" fill="url(#v)"/>',
      VERTICAL
    )
    const {end, start} = linear(result.shapes[0])

    close(start, [2, 1])
    close(end, [0, 1])
  })

  it('turns a white mask into a clip in the masked element’s space', () => {
    const {flag: result} = flag(
      '<mask id="m" fill="white"><use xlink:href="#shape"/></mask><g transform="translate(5, 0)"><rect width="21" height="15" fill="#000" mask="url(#m)"/></g>',
      '<rect id="shape" width="2" height="2"/>'
    )

    assert.deepEqual(result.shapes[0]?.clips, [{pathData: 'M5 0H7V2H5Z', rule: 'nonzero'}])
  })

  it('drops filtered shadow copies', () => {
    const {flag: result, notes} = flag(
      '<use fill="black" filter="url(#f)" xlink:href="#shape"/><use fill="#00ff00" xlink:href="#shape"/>',
      '<filter id="f"><feOffset dy="0.5"/></filter><rect id="shape" width="2" height="2"/>'
    )

    assert.equal(result.shapes.length, 1)
    assert.deepEqual(notes, ['dropped the shadow url(#f)'])
  })

  it('pushes group opacity down to fills and strokes', () => {
    const {flag: result} = flag(
      '<g opacity="0.5"><path d="M0 0H1V1Z" fill="#000" fill-opacity="0.5" stroke="#fff" stroke-width="2"/></g>'
    )

    assert.equal(result.shapes[0]?.fill?.opacity, 0.25)
    assert.equal(result.shapes[0]?.stroke?.opacity, 0.5)
    assert.equal(result.shapes[0]?.stroke?.width, 2)
  })

  it('rejects masks that are not plain white shapes', () => {
    assert.throws(
      () =>
        flag(
          '<mask id="m" fill="#808080"><rect width="2" height="2"/></mask><rect width="5" height="5" mask="url(#m)"/>'
        ),
      /not a single opaque white shape/
    )
  })
})

describe('outputs', () => {
  const {flag: result} = flag(
    '<mask id="m" fill="white"><rect width="10" height="10"/></mask><rect width="21" height="15" fill="url(#v)" fill-rule="evenodd" mask="url(#m)"/>',
    VERTICAL
  )

  it('writes plain SVG with user-space gradients and clip paths', () => {
    assert.equal(
      toSvg(result),
      '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="15" viewBox="0 0 21 15" preserveAspectRatio="none"><defs><linearGradient id="g0" gradientUnits="userSpaceOnUse" x1="10.5" y1="0" x2="10.5" y2="15"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#000000"/></linearGradient><clipPath id="c1"><path d="M0 0H10V10H0Z"/></clipPath></defs><g clip-path="url(#c1)"><path d="M0 0H21V15H0Z" fill="url(#g0)" fill-rule="evenodd"/></g></svg>\n'
    )
  })

  it('writes a VectorDrawable with the same geometry', () => {
    const xml = toVectorDrawable(result)

    assert.match(xml, /<group>\n {4}<clip-path android:pathData="M0 0H10V10H0Z"\/>/)
    assert.match(xml, /android:fillType="evenOdd"/)
    assert.match(xml, /android:startX="10.5"\n\s+android:startY="0"\n\s+android:endX="10.5"\n\s+android:endY="15"/)
    assert.match(xml, /<item android:offset="1" android:color="#FF000000"\/>/)
  })

  it('names drawables as valid, prefixed resource names', () => {
    assert.equal(drawableName('CZ'), 'expo_flags_kit_cz')
    assert.equal(drawableName('GB-ENG'), 'expo_flags_kit_gb_eng')
  })
})
