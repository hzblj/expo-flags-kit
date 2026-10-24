import assert from 'node:assert/strict'
import {readdirSync} from 'node:fs'
import path from 'node:path'
import {describe, it} from 'node:test'

import {FLAG_CODES, isFlagCode, toFlagCode} from '../src/codes'
import {getFlagEmoji} from '../src/emoji'

describe('flag codes', () => {
  it('lists every FlagKit flag once, sorted', () => {
    const sources = readdirSync(path.join(import.meta.dirname, '../flagkit/svg')).map(file =>
      path.basename(file, '.svg')
    )

    assert.deepEqual([...FLAG_CODES], sources.sort())
    assert.equal(new Set(FLAG_CODES).size, FLAG_CODES.length)
  })

  it('accepts only canonical codes', () => {
    assert.equal(isFlagCode('CZ'), true)
    assert.equal(isFlagCode('GB-ENG'), true)
    assert.equal(isFlagCode('cz'), false)
    assert.equal(isFlagCode('XX'), false)
  })

  it('normalizes casing, whitespace and underscores', () => {
    assert.equal(toFlagCode('cz'), 'CZ')
    assert.equal(toFlagCode(' de '), 'DE')
    assert.equal(toFlagCode('gb_eng'), 'GB-ENG')
    assert.equal(toFlagCode('us-ca'), 'US-CA')
    assert.equal(toFlagCode('xx'), null)
    assert.equal(toFlagCode(''), null)
  })
})

describe('getFlagEmoji', () => {
  it('builds regional indicator pairs', () => {
    assert.equal(getFlagEmoji('CZ'), '🇨🇿')
    assert.equal(getFlagEmoji('EU'), '🇪🇺')
    assert.equal(getFlagEmoji('XK'), '🇽🇰')
  })

  it('builds tag sequences for the subdivisions Unicode recommends', () => {
    assert.equal(getFlagEmoji('GB-ENG'), '🏴󠁧󠁢󠁥󠁮󠁧󠁿')
    assert.equal(getFlagEmoji('GB-SCT'), '🏴󠁧󠁢󠁳󠁣󠁴󠁿')
    assert.equal(getFlagEmoji('GB-WLS'), '🏴󠁧󠁢󠁷󠁬󠁳󠁿')
  })

  it('returns null where no emoji renders', () => {
    assert.equal(getFlagEmoji('GB-NIR'), null)
    assert.equal(getFlagEmoji('GB-ZET'), null)
    assert.equal(getFlagEmoji('US-CA'), null)
  })

  it('maps the pride flag to the rainbow flag', () => {
    assert.equal(getFlagEmoji('LGBT'), '🏳️‍🌈')
  })
})
