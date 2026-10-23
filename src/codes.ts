import {FLAG_CODES} from './codes.generated'

export {FLAG_CODES}

export type FlagCode = (typeof FLAG_CODES)[number]

const FLAG_CODE_SET: ReadonlySet<string> = new Set(FLAG_CODES)

export const isFlagCode = (value: string): value is FlagCode => FLAG_CODE_SET.has(value)

// Normalizes codes as they come from APIs and locales: any casing, surrounding whitespace, and an
// underscore in place of the hyphen ("gb_eng").
export const toFlagCode = (value: string): FlagCode | null => {
  const code = value.trim().toUpperCase().replace('_', '-')

  return isFlagCode(code) ? code : null
}
