import type {FlagCode} from './codes'
import {ExpoFlagsKit} from './ExpoFlagsKitModule'

// Flags that aren't a region, so the system has no localized name for them.
const OTHER_NAMES: Partial<Record<FlagCode, string>> = {
  'GB-ENG': 'England',
  'GB-NIR': 'Northern Ireland',
  'GB-SCT': 'Scotland',
  'GB-WLS': 'Wales',
  'GB-ZET': 'Shetland',
  LGBT: 'Pride flag',
  'US-CA': 'California',
}

const regionName = (code: string, locale: string | undefined): string | null => {
  if (ExpoFlagsKit !== null) {
    return ExpoFlagsKit.getRegionName(code, locale ?? null)
  }

  try {
    return new Intl.DisplayNames(locale ?? [], {type: 'region'}).of(code) ?? null
  } catch {
    // Engines without Intl.DisplayNames, such as Hermes in Expo Go
    return null
  }
}

// The flag's name in the app's language, or in `locale` (a BCP 47 tag such as "cs" or "en-GB"). Countries,
// EU and XK come from the system's locale data; the seven other flags have English names.
export const getFlagName = (code: FlagCode, locale?: string): string =>
  OTHER_NAMES[code] ?? regionName(code, locale) ?? code
