import {FLAG_CODES, type FlagCode, getFlagName, toFlagCode} from '@hzblj/expo-flags-kit'

export type FlagEntry = {
  code: FlagCode
  /** What the search compares: the name in the app's language and in English, without accents, lowercased. */
  haystack: string
  /** In the app's language. */
  name: string
}

/** "Česko" matches "cesko": a search should not ask for the accents. */
const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Every flag, named in the app's language and sorted by that name, the way a country picker lists them. */
export const flagEntries = (): FlagEntry[] =>
  FLAG_CODES.map(code => {
    const name = getFlagName(code)

    return {code, haystack: fold(`${name} ${getFlagName(code, 'en')}`), name}
  }).sort((a, b) => a.name.localeCompare(b.name))

/**
 * The flags a query finds: by name (in the app's language or in English) or by the start of the code. The flag
 * `toFlagCode()` makes of the query comes first, so "cz" and "gb_sct" land on their flag, then the names that start
 * with it, then the rest, each in name order.
 */
export const searchFlags = (entries: readonly FlagEntry[], query: string): readonly FlagEntry[] => {
  const needle = fold(query.trim())

  if (needle === '') {
    return entries
  }

  const exact = toFlagCode(query)
  const code = needle.replace(/_/g, '-')
  const rank = (entry: FlagEntry) => {
    if (entry.code === exact) {
      return 0
    }

    if (entry.haystack.startsWith(needle) || entry.haystack.includes(` ${needle}`)) {
      return 1
    }

    return entry.haystack.includes(needle) || entry.code.toLowerCase().startsWith(code) ? 2 : null
  }

  return entries
    .map(entry => ({entry, rank: rank(entry)}))
    .filter((found): found is {entry: FlagEntry; rank: number} => found.rank !== null)
    .sort((a, b) => a.rank - b.rank)
    .map(({entry}) => entry)
}
