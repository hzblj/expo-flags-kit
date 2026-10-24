# @hzblj/expo-flags-kit

FlagKit's 255 flags as a native vector view: the JavaScript API and the web view (`src/` → `build/`), the
`ExpoFlagsKit` module (`ios/`, `android/`), and the generator that turns FlagKit's SVGs into every platform's assets
(`scripts/`). No config plugin, no Compose, no `react-native-svg`, no third-party native dependency. iOS, Android and
web.

| Path | What it is |
| --- | --- |
| `src/codes.ts`, `src/codes.generated.ts` | `FLAG_CODES` (generated, sorted), the `FlagCode` type, `isFlagCode` (canonical codes only) and `toFlagCode` (case, whitespace, `_` for `-`; `null` without a flag). |
| `src/FlagView.tsx` | The native view through `requireNativeView`; without the module (Expo Go) an empty box of the same size and one development warning. Sends the code uppercased. |
| `src/FlagView.web.tsx`, `src/assets.web.generated.ts` | Web: an `Image` per flag over a box, each flag a separate SVG asset (`assets/flags`) required by a path relative to `src/` and `build/` alike. |
| `src/shared.ts` | `FLAG_ASPECT_RATIO` (21 / 15), `flagStyle` (the default ratio unless the style sets both dimensions or a ratio, `overflow: hidden` always) and `accessibilityProps` (decorative unless `accessible` or labelled; then an image named by `getFlagName`). Shared by both views. |
| `src/names.ts`, `src/ExpoFlagsKitModule.ts` | `getFlagName`: the seven flags that are not a region have English names here; the rest come from the module's `getRegionName` (`Locale` on iOS and Android) or `Intl.DisplayNames` on web, and fall back to the code. |
| `src/emoji.ts` | `getFlagEmoji`: regional indicator pairs, tag sequences for the three subdivisions Unicode recommends, the rainbow flag, `null` for the rest. |
| `ios/FlagView.swift`, `ios/ExpoFlagsKitModule.swift` | A `UIImageView` showing the catalog image, `contentFit` as its content mode, kept under React Native's border layer. |
| `ios/Flags.xcassets/` (generated) | One imageset per flag, SVG with `preserves-vector-representation`, compiled into the `ExpoFlagsKit` resource bundle. |
| `android/.../FlagView.kt`, `ExpoFlagsKitModule.kt` | The flag's `VectorDrawable` drawn straight into the view (`mutate()` per view), fitted by `contentFit`, clipped to the padding box so `borderRadius` and borders hold. |
| `android/.../FlagDrawables.kt`, `android/src/main/res/drawable/` (generated) | A `when` from code to `R.drawable.expo_flags_kit_<code>`, and the drawables. |
| `scripts/flags/normalize.ts`, `geometry.ts` | FlagKit's SVG flattened to paths, user-space linear gradients and clip paths: masks become clips, `<use>` and transforms go into the path data, gradients are resolved against each shape's bounding box. |
| `scripts/flags/svg.ts`, `vectorDrawable.ts`, `outputs.ts` | The flattened flag as SVG and as a VectorDrawable, and every generated file keyed by its path. |
| `scripts/generate.ts`, `scripts/verify.ts` | `flags:generate` writes the outputs and deletes what it no longer produces; `flags:verify` renders each source and its output with `rsvg-convert` and compares them pixel by pixel. |
| `flagkit/` | FlagKit's SVG sources (`svg/`, never edited) and its MIT `LICENSE`, which ships. |
| `test/` | `codes.test.ts` (codes, emoji), `normalize.test.ts` (the flattening), `generated.test.ts` (every generated file matches its source, nothing stale). |

**Everything with a flag in it is generated.** `GENERATED_DIRECTORIES` (`android/src/main/res/drawable`,
`assets/flags`, `ios/Flags.xcassets`) belong to the generator completely, and so do `FlagDrawables.kt`,
`codes.generated.ts` and `assets.web.generated.ts`. Change the generator or a source, run `yarn flags:generate`, then
`yarn test` (it fails on anything out of date or stale) and `yarn flags:verify`. Only FlagKit's drop shadows may differ
(`MAX_DIFFERENT_PIXELS`); any other difference is a normalization bug.

**One subset that renders the same everywhere.** CoreSVG, VectorDrawables and browsers agree on paths, user-space
linear gradients and clip paths, and on little else (no masks, filters, `<use>`, object-bounding-box gradients). The
generator must never emit anything outside that subset. VectorDrawable clips have no fill rule: they are non-zero.

**The iOS catalog lives in a resource bundle.** `resource_bundles` in the podspec, not `resources`: a catalog listed as
a resource collides with the app's own `Assets.car` ("Multiple commands produce"). `Bundle(for: FlagView.self)` finds it
for static and dynamic frameworks alike.

**Android references every drawable from code.** `FlagDrawables.kt` keeps the flags through resource shrinking and
avoids `getIdentifier`. A drawable is inflated the first time its flag is shown.

**Codes are uppercase and exact.** `FlagCode`, `isFlagCode` and the native lookups take `CZ`, `GB-SCT`; anything from
outside goes through `toFlagCode`. `FlagView` still uppercases before it crosses the bridge.

**`files` lists globs for the asset folders.** `yarn pack` (which `yarn npm publish` uses) packs a top-level
directory entry (`build`) but silently drops a nested one (`assets/flags`, `ios/Flags.xcassets`), which npm packed:
they are `assets/flags/*.svg` and `ios/Flags.xcassets/**`. `scripts/pack-check.mjs` at the root fails if any flag is missing from any platform.

**Optional module.** `requireOptionalNativeModule` is `null` on web and in Expo Go, so the names fall back to
`Intl.DisplayNames` (or the code) and the view to an empty box. Flags are native resources: a new or changed one needs
a native rebuild, never an OTA update.

**Tests.** `yarn test` (node:test with tsx over `test/`). `flags:verify` needs `rsvg-convert` (`brew install librsvg`;
CI installs `librsvg2-bin`). The native views have no unit tests: the example on a simulator, an emulator and the web
build of an app are the check.

Code style follows `@hzblj/biome-config`. Docs copy (README, the comments in `src/`, changesets) has no em dashes.
