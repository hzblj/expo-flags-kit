# expo-flags-kit

Turborepo + Yarn 4 workspaces for **`@hzblj/expo-flags-kit`**: FlagKit's 255 country flags for Expo as a native view,
drawn as vectors on every platform (an asset catalog on iOS, VectorDrawables on Android, SVG files on web), with typed
codes, `toFlagCode()`, localized names and emoji. The package supports iOS, Android and web; the example runs on iOS
and Android.

Every package has its own `CLAUDE.md`: read that one before touching it.

| Path | Package | What lives there |
| --- | --- | --- |
| `packages/expo-flags-kit/` | `@hzblj/expo-flags-kit` | The JavaScript API and the web view (`src/`), the `ExpoFlagsKit` module (`ios/`, `android/`), FlagKit's sources (`flagkit/`), the generator that turns them into every platform's assets (`scripts/`) and the tests. |
| `apps/example/` | `expo-flags-kit-example` (private) | Expo Router app built with `@hzblj/kara-ui`: every flag, searchable, in a list or a grid with a sheet for each; sizes, shapes, `contentFit` and a playground; `toFlagCode()`, names, emoji, accessibility and the code list. iOS and Android only. Runs the package from **source**. |
| `scripts/` | | `pack-check.mjs`: the tarball as npm gets it (every flag on every platform), and a consumer type-checked against it. |
| `.changeset/`, `.github/workflows/` | | Release notes (`yarn changeset`), CI (Biome, typecheck, tests, the pixel check of every flag, pack check, the Android module compiled) and the changesets → npm release, with provenance. |

## Commands

```bash
yarn ios / yarn android      # run the example (dev client)
yarn prebuild                # a clean `expo prebuild` of the example, after native or config changes
yarn test                    # codes, emoji, the SVG normalization and every generated file (node:test)
yarn flags:generate          # regenerate every flag asset, the code list and FlagDrawables.kt from flagkit/svg
yarn flags:verify            # render each generated flag against its source; needs rsvg-convert (librsvg)
yarn typecheck / yarn lint   # tsc, Biome
yarn pack:check              # what npm receives, and a consumer type-check
yarn changeset               # describe a change for the next release
```

## Conventions that bite

**The example runs the package's source; the world runs `build/`.** The package's `exports` names a `source` entry,
which the example's `metro.config.js` maps and its `tsconfig.json` mirrors with `paths`, so nothing waits for a build.
Not a global `source` condition: published packages ship one too, and kara-ui's points at platform-split sources.

**Generated files are never edited by hand.** The asset catalog, the drawables, the web SVGs, `FlagDrawables.kt`,
`codes.generated.ts` and `assets.web.generated.ts` all come from `flagkit/svg` through `yarn flags:generate`, and
`yarn test` fails when one is out of date or stale. Biome skips the generated folders (root `biome.json`).

**Flags are native resources.** A new or changed flag needs a native rebuild of the example (`yarn prebuild`), not a
reload, and never ships in an OTA update.

**The example is native only, the package is not.** kara-ui has no web target, so the example has no web build; the
package's web view (`FlagView.web.tsx`, `assets.web.generated.ts`), its docs and its tests stay as they are.

**Publish through Yarn, tag through changesets.** `yarn release` runs `yarn npm publish` in every public workspace and
then `changeset tag`. Never `changeset publish`: its npm call would ship `workspace:` ranges verbatim. Provenance comes
from `publishConfig.provenance` and the release job's `id-token: write`.

**Docs copy has no em dashes.** Not in the READMEs, the comments that document the API in `src/`, changesets or the
example's captions. Rewrite with a comma, a colon, parentheses or a second sentence. Code comments are exempt.

**Commits are Jan's alone.** Author `Jan Blazej <hello@janblazej.dev>` (set locally in this repo), no co-author or
generated-by lines.

Code style is Biome-enforced (`@hzblj/biome-config`): 2 spaces, 120 cols, single quotes, no semicolons, sorted imports
and object keys. Named exports and `const` arrow functions; `type` over `interface`.
