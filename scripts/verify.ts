// Renders every FlagKit source and its generated SVG with rsvg-convert and compares them pixel by pixel.
// The generated vectors are the source minus FlagKit's drop shadows, so any other difference is a bug in the
// normalization. Needs rsvg-convert (librsvg) on the PATH.
import {execFileSync} from 'node:child_process'
import {mkdirSync, writeFileSync} from 'node:fs'
import path from 'node:path'

import {PNG} from 'pngjs'

import {readFlags} from './flags/outputs'
import {toSvg} from './flags/svg'

const SCALE = 20
const WIDTH = 21 * SCALE
const HEIGHT = 15 * SCALE

// A channel that differs by more than this counts the pixel as different. Anti-aliasing along clip edges
// differs slightly between a mask and a clip path, so a few edge pixels are expected.
const CHANNEL_TOLERANCE = 48

// FlagKit's shadows are 6 % black, so flags that had one may differ by up to that much along an edge.
const MAX_DIFFERENT_PIXELS = 0.004

const render = (svg: string) =>
  PNG.sync.read(execFileSync('rsvg-convert', ['--width', `${WIDTH}`, '--height', `${HEIGHT}`], {input: svg}))

const outputDirectory = process.argv[2]

if (outputDirectory) {
  mkdirSync(outputDirectory, {recursive: true})
}

const failures: string[] = []

const flags = readFlags()

for (const {code, flag, source} of flags) {
  const expected = render(source)
  const actual = render(toSvg(flag))
  const diff = new PNG({height: HEIGHT, width: WIDTH})
  let different = 0
  let largest = 0

  for (let index = 0; index < expected.data.length; index += 4) {
    let channel = 0

    for (let offset = 0; offset < 4; offset += 1) {
      channel = Math.max(channel, Math.abs((expected.data[index + offset] ?? 0) - (actual.data[index + offset] ?? 0)))
    }

    largest = Math.max(largest, channel)

    if (channel > CHANNEL_TOLERANCE) {
      different += 1
    }

    diff.data[index] = 255
    diff.data[index + 1] = channel > CHANNEL_TOLERANCE ? 0 : 255
    diff.data[index + 2] = channel > CHANNEL_TOLERANCE ? 0 : 255
    diff.data[index + 3] = channel > 0 ? Math.max(48, channel) : 0
  }

  const ratio = different / (WIDTH * HEIGHT)

  if (ratio > MAX_DIFFERENT_PIXELS) {
    failures.push(`${code}: ${(ratio * 100).toFixed(2)} % of pixels differ (largest channel difference ${largest})`)
  }

  if (outputDirectory && largest > 0) {
    writeFileSync(path.join(outputDirectory, `${code}.diff.png`), PNG.sync.write(diff))
  }
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join('\n')}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(`All ${flags.length} flags match their FlagKit source\n`)
}
