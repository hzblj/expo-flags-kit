import type {FlagCode} from './codes'

const REGIONAL_INDICATOR_A = 0x1f1e6
const WAVING_BLACK_FLAG = 0x1f3f4
const TAG_OFFSET = 0xe0000
const CANCEL_TAG = 0xe007f

// The only subdivision flags in Unicode's recommended set; other tag sequences render as a black flag.
const SUBDIVISION_EMOJI: ReadonlySet<string> = new Set(['GB-ENG', 'GB-SCT', 'GB-WLS'])

const RAINBOW_FLAG = '\u{1F3F3}\u{FE0F}‍\u{1F308}'

const codePoints = (text: string, offset: number) =>
  Array.from(text, character => offset + (character.codePointAt(0) ?? 0))

export const getFlagEmoji = (code: FlagCode): string | null => {
  if (code === 'LGBT') {
    return RAINBOW_FLAG
  }

  if (/^[A-Z]{2}$/.test(code)) {
    return String.fromCodePoint(...codePoints(code, REGIONAL_INDICATOR_A - 0x41))
  }

  if (SUBDIVISION_EMOJI.has(code)) {
    return String.fromCodePoint(
      WAVING_BLACK_FLAG,
      ...codePoints(code.replace('-', '').toLowerCase(), TAG_OFFSET),
      CANCEL_TAG
    )
  }

  return null
}
