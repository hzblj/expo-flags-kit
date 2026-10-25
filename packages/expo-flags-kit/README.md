# @hzblj/expo-flags-kit

[![npm](https://img.shields.io/npm/v/@hzblj/expo-flags-kit.svg)](https://www.npmjs.com/package/@hzblj/expo-flags-kit)
[![license](https://img.shields.io/npm/l/@hzblj/expo-flags-kit.svg)](https://github.com/hzblj/expo-flags-kit/blob/main/LICENSE)

Country flags for Expo as a native view. The 255 flags from [FlagKit](https://github.com/madebybowtie/FlagKit) are drawn as vectors on iOS, Android and web, so they stay sharp at any size.

<p>
  <img alt="Every flag with its name and code, in the example on iOS" height="560" src="https://raw.githubusercontent.com/hzblj/expo-flags-kit/main/media/ios-flags.png" />
  <img alt="The same on Android" height="560" src="https://raw.githubusercontent.com/hzblj/expo-flags-kit/main/media/android-flags.png" />
</p>

- Native vectors on every platform: an asset catalog with preserved vector data on iOS, VectorDrawables on Android, SVG files on web
- One source for all platforms, checked pixel by pixel against FlagKit's artwork
- No Compose, no `react-native-svg`, no third-party native dependencies
- Light enough for long lists: a `UIImageView` on iOS and a single drawable on Android, loaded per flag on first use
- Circles, squares, borders and rounded corners with plain styles and `contentFit`
- Accessible: decorative by default, or announced by the country's name in the user's language
- Typed codes, `toFlagCode()` for codes from APIs, `getFlagName()` for localized names and `getFlagEmoji()` for text

## Install

```sh
npx expo install @hzblj/expo-flags-kit
```

Requires Expo SDK 57 or newer and a [development build](https://docs.expo.dev/develop/development-builds/introduction/). Expo Go doesn't include the native view; there `FlagView` renders an empty box of the same size and logs a warning in development.

## Usage

```tsx
import {FlagView} from '@hzblj/expo-flags-kit'

// Give a width or a height; the other follows FlagKit's 21:15 ratio
<FlagView code="CZ" style={{width: 24}} />
<FlagView code="DE" style={{height: 16}} />

// Give both for another shape: the flag is cropped to fill it
<FlagView code="JP" style={{width: 32, height: 32, borderRadius: 16}} />

// Or letterboxed, or stretched
<FlagView code="KR" contentFit="contain" style={{width: 40, height: 40}} />

// A border and rounded corners on the flag itself
<FlagView code="FI" style={{width: 32, borderRadius: 4, borderWidth: 1, borderColor: '#D1D5DB'}} />
```

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `code` | `FlagCode` | Required | Which flag to draw, see [Codes](#codes) |
| `contentFit` | `'cover' \| 'contain' \| 'fill'` | `'cover'` | How the 21:15 flag fills a box of another shape: cropped, letterboxed or stretched |
| `...ViewProps` | | | `style`, `testID`, accessibility props and the rest of `View`'s props |

The default style is `overflow: 'hidden'`, so `borderRadius` clips the flag on every platform, plus `aspectRatio: 21 / 15` unless your style sets both `width` and `height` or an `aspectRatio` of its own. `FLAG_ASPECT_RATIO` exports the ratio for layout math.

### Accessibility

Flags are decorative by default, because they usually sit next to the country's name: screen readers skip them. Make a flag accessible when it stands on its own, such as in a language switcher that shows only flags:

```tsx
// Announced as an image named after the country, in the app's language: "Czechia", "Česko", "Tschechien"
<FlagView accessible code="CZ" style={{width: 24}} />

// Or with your own label, which also makes it accessible
<FlagView accessibilityLabel="Switch to Czech" code="CZ" style={{width: 24}} />
```

An accessible flag gets the `image` role unless you pass another one. `getFlagName(code, locale?)` returns the same name, for pickers and search:

```ts
import {getFlagName} from '@hzblj/expo-flags-kit'

getFlagName('CZ') // 'Czechia' in an English app
getFlagName('CZ', 'cs') // 'Česko'
getFlagName('EU', 'de') // 'Europäische Union'
getFlagName('GB-SCT') // 'Scotland'
```

Country names come from the system's locale data (`Locale` on iOS and Android, `Intl.DisplayNames` on web), so they are localized without bundling any translations. The seven flags that aren't a region (`GB-ENG`, `GB-NIR`, `GB-SCT`, `GB-WLS`, `GB-ZET`, `US-CA`, `LGBT`) have English names; pass `accessibilityLabel` to translate them.

### Codes

```ts
import {FLAG_CODES, type FlagCode, isFlagCode, toFlagCode} from '@hzblj/expo-flags-kit'

isFlagCode('CZ') // true; codes are uppercase
toFlagCode(' cz ') // 'CZ'
toFlagCode('gb_eng') // 'GB-ENG'
toFlagCode('xx') // null
```

`FLAG_CODES` lists every flag: the ISO 3166-1 alpha-2 country codes plus `EU` (European Union), `XK` (Kosovo), `LGBT` (pride flag), `GB-ENG`, `GB-NIR`, `GB-SCT`, `GB-WLS`, `GB-ZET` (Shetland) and `US-CA` (California).

Use `toFlagCode()` for codes from an API or a locale. It ignores case and surrounding whitespace, accepts `_` in place of `-`, and returns `null` for codes without a flag, so it doubles as a guard:

```tsx
const code = toFlagCode(country.isoCode)

return code ? <FlagView code={code} style={{width: 20}} /> : null
```

### Emoji

```ts
import {getFlagEmoji} from '@hzblj/expo-flags-kit'

getFlagEmoji('CZ') // '🇨🇿'
getFlagEmoji('GB-SCT') // '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
getFlagEmoji('LGBT') // '🏳️‍🌈'
getFlagEmoji('US-CA') // null
```

For text, notifications and share sheets, where a view doesn't fit. Returns `null` for the subdivisions that have no emoji in Unicode's recommended set (`GB-NIR`, `GB-ZET`, `US-CA`).

## Platform behavior

- **iOS**: the flags are an asset catalog compiled into the `ExpoFlagsKit` resource bundle, with vector data preserved. `UIImageView` draws each flag at the size it is shown.
- **Android**: each flag is a VectorDrawable resource named `expo_flags_kit_<code>`. The module references every resource from code, so resource shrinking keeps them, and a flag is parsed the first time it is shown.
- **Web**: each flag is a separate SVG asset, so the browser downloads only the flags on screen.
- Flags are native resources: adding or changing one needs a native rebuild, not an OTA update.

### Differences from FlagKit

The vectors are generated from FlagKit's SVG sources and match them pixel for pixel, with two exceptions:

- FlagKit draws a 6 % black drop shadow, half a point wide, under some emblems (AI, GL, LR, MD, NA, PK, YT). Neither VectorDrawables nor every SVG renderer supports filters, so the shadows are left out. At flag sizes they aren't visible.
- The trigrams on the South Korean flag have their group's 75 % opacity applied to each trigram. They don't overlap, so the result is the same.

## Development

`flagkit/svg` holds FlagKit's sources as published in [madebybowtie/FlagKit@e7c542f](https://github.com/madebybowtie/FlagKit/tree/e7c542fc43dcfe1bf9bcdaa4898ad8d119a84407/Assets/SVG). Everything else that contains a flag is generated from them. From the repository root:

```sh
yarn flags:generate  # iOS asset catalog, Android drawables, web SVGs, the code list
yarn flags:verify    # renders every generated flag against its source; needs rsvg-convert (brew install librsvg)
yarn test            # fails when a generated file is out of date
```

The generator flattens each flag to paths, user-space linear gradients and clip paths: FlagKit's masks become clip paths, `<use>` references and transforms are applied to the path data, and gradients are resolved against each shape's bounding box. VectorDrawables and CoreSVG render that subset the same way browsers do.

## Example

The [example app](https://github.com/hzblj/expo-flags-kit/tree/main/apps/example) lists every flag, searchable by name or code, each in a sheet with its emoji and names; sizes, shapes and `contentFit` on a flag you pick, and one you design yourself; and `toFlagCode()` on whatever you type, names in other languages, emoji and the accessibility modes. It runs on iOS and Android, from the package's source. Clone the repository and run it:

```sh
yarn && yarn prebuild && yarn ios   # or: yarn android
```

## More libraries

The other libraries from the same author are at **[libraries.janblazej.dev](https://www.libraries.janblazej.dev)**.

## License

MIT © Jan Blazej. The flag artwork is [FlagKit](https://github.com/madebybowtie/FlagKit), MIT © Bowtie AB; see [`flagkit/LICENSE`](https://github.com/hzblj/expo-flags-kit/blob/main/packages/expo-flags-kit/flagkit/LICENSE).
