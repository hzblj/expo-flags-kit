/**
 * Checks what npm would receive, the way a consumer meets it. Packs every published package (each `prepack` builds it
 * through turbo's cache), asserts what must and must not ship in each tarball, then installs it into a throwaway app
 * and type-checks real usage with a consumer's TypeScript: no `source` condition, no workspace links, only what the
 * tarball declares.
 *
 * The negative cases matter as much as the positive ones: if a declaration failed to resolve, its imports would
 * quietly become `any` and everything would compile, so each `@ts-expect-error` is there to prove the types are real.
 */
import {execFileSync} from 'node:child_process'
import {existsSync} from 'node:fs'
import {mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const WORK = path.join(ROOT, '.pack-check')

const run = (command, args, cwd = ROOT) => execFileSync(command, args, {cwd, encoding: 'utf8'})

const fail = message => {
  console.error(`pack-check: ${message}`)
  process.exit(1)
}

/** Every flag FlagKit has, by its source: each must ship on all three platforms. */
const FLAG_CODES = (await readdir(path.join(ROOT, 'packages/expo-flags-kit/flagkit/svg')))
  .filter(file => file.endsWith('.svg'))
  .map(file => path.basename(file, '.svg'))

const REQUIRED = {
  '@hzblj/expo-flags-kit': [
    'package.json',
    'README.md',
    'LICENSE',
    'flagkit/LICENSE',
    'build/index.js',
    'build/index.d.ts',
    'build/FlagView.js',
    'build/FlagView.web.js',
    'build/assets.web.generated.js',
    'expo-module.config.json',
    'ios/ExpoFlagsKit.podspec',
    'ios/ExpoFlagsKitModule.swift',
    'ios/FlagView.swift',
    'ios/Flags.xcassets/Contents.json',
    'android/build.gradle',
    'android/src/main/AndroidManifest.xml',
    'android/src/main/java/com/hzblj/expoflagskit/ExpoFlagsKitModule.kt',
    'android/src/main/java/com/hzblj/expoflagskit/FlagDrawables.kt',
    'android/src/main/java/com/hzblj/expoflagskit/FlagView.kt',
    ...FLAG_CODES.flatMap(code => [
      `ios/Flags.xcassets/${code}.imageset/Contents.json`,
      `ios/Flags.xcassets/${code}.imageset/${code}.svg`,
      `android/src/main/res/drawable/expo_flags_kit_${code.toLowerCase().replace(/-/g, '_')}.xml`,
      `assets/flags/${code}.svg`,
    ]),
  ],
}

// The tests, the generator, FlagKit's sources, the TypeScript sources and the build output of the native projects
// stay home.
const FORBIDDEN = [
  /^src\//,
  /^test\//,
  /^scripts\//,
  /^flagkit\/svg\//,
  /^android\/build\//,
  /\/build\/intermediates\//,
  /\.DS_Store$/,
]

const packages = []

for (const directory of await readdir(path.join(ROOT, 'packages'))) {
  const manifestPath = path.join(ROOT, 'packages', directory, 'package.json')

  if (!existsSync(manifestPath)) {
    continue
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

  if (!manifest.private) {
    packages.push({directory, name: manifest.name})
  }
}

await rm(WORK, {force: true, recursive: true})
await mkdir(path.join(WORK, 'tarballs'), {recursive: true})

let fileCount = 0

for (const {directory, name} of packages) {
  const tarball = path.join(WORK, 'tarballs', `${directory}.tgz`)

  run('yarn', ['pack', '--out', tarball], path.join(ROOT, 'packages', directory))

  const files = run('tar', ['-tzf', tarball])
    .split('\n')
    .filter(Boolean)
    .map(file => file.replace(/^package\//, ''))

  const missing = (REQUIRED[name] ?? ['package.json', 'README.md']).filter(file => !files.includes(file))
  const leaked = files.filter(file => FORBIDDEN.some(pattern => pattern.test(file)))

  if (missing.length > 0) {
    fail(`${name} is missing:\n  ${missing.join('\n  ')}`)
  }

  if (leaked.length > 0) {
    fail(`${name} must not ship:\n  ${leaked.join('\n  ')}`)
  }

  const packed = JSON.parse(run('tar', ['-xzOf', tarball, 'package/package.json']))

  if (JSON.stringify(packed.dependencies ?? {}).includes('workspace:')) {
    fail(`${name} still declares a workspace: range: it would not install outside this repo`)
  }

  const installed = path.join(WORK, 'node_modules', name)

  await mkdir(installed, {recursive: true})
  run('tar', ['-xzf', tarball, '-C', installed, '--strip-components', '1'])
  fileCount += files.length
}

// The web build requires each flag's SVG by a path relative to `build/`: every one of them has to resolve.
const webAssets = path.join(WORK, 'node_modules/@hzblj/expo-flags-kit/build/assets.web.generated.js')
const required = [...(await readFile(webAssets, 'utf8')).matchAll(/require\('([^']+)'\)/g)].map(([, file]) => file)
const unresolved = required.filter(file => !existsSync(path.resolve(path.dirname(webAssets), file)))

if (required.length !== FLAG_CODES.length || unresolved.length > 0) {
  fail(
    `the web build requires ${required.length} flags, ${unresolved.length} of them missing:\n  ${unresolved.join('\n  ')}`
  )
}

const consumer = `import {
  FLAG_ASPECT_RATIO,
  FLAG_CODES,
  type FlagCode,
  type FlagContentFit,
  FlagView,
  type FlagViewProps,
  getFlagEmoji,
  getFlagName,
  isFlagCode,
  toFlagCode,
} from '@hzblj/expo-flags-kit'

export const CountryFlag = ({isoCode}: {isoCode: string}) => {
  const code = toFlagCode(isoCode)

  return code ? <FlagView code={code} style={{width: 20}} /> : null
}

export const Shapes = ({fit}: {fit: FlagContentFit}) => (
  <>
    <FlagView code="JP" style={{borderRadius: 16, height: 32, width: 32}} />
    <FlagView code="KR" contentFit={fit} style={{height: 40, width: 40}} />
    <FlagView code="GB-SCT" style={{borderColor: '#D1D5DB', borderRadius: 4, borderWidth: 1, width: 32}} />
    <FlagView accessible code="CZ" style={{width: 24}} />
    <FlagView accessibilityLabel="Switch to Czech" code="CZ" style={{width: 24}} />
  </>
)

export const props: FlagViewProps = {code: 'US-CA', contentFit: 'contain', testID: 'flag'}
export const codes: readonly FlagCode[] = FLAG_CODES
export const height = (width: number) => width / FLAG_ASPECT_RATIO

export const describe = (value: string): string | null => {
  if (!isFlagCode(value)) {
    return null
  }

  const emoji: string | null = getFlagEmoji(value)

  return \`\${emoji ?? ''} \${getFlagName(value)} \${getFlagName(value, 'cs')}\`
}

// @ts-expect-error: not a flag
export const unknown = <FlagView code="XX" />

// @ts-expect-error: codes are uppercase; toFlagCode() normalizes the rest
export const lowercase: FlagCode = 'cz'

// @ts-expect-error: not a content fit
export const scaleDown = <FlagView code="CZ" contentFit="scale-down" />

// @ts-expect-error: a code from outside goes through toFlagCode() first
getFlagName('Czechia')
`

await writeFile(path.join(WORK, 'consumer.tsx'), consumer)
await writeFile(
  path.join(WORK, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {noEmit: true, skipLibCheck: true, strict: true},
      extends: 'expo/tsconfig.base',
      include: ['consumer.tsx'],
    },
    null,
    2
  )
)

try {
  run('yarn', ['run', '-T', 'tsc', '-p', WORK])
} catch (error) {
  fail(`a consumer's type check failed:\n${error.stdout}`)
}

await rm(WORK, {force: true, recursive: true})

console.log(`pack-check: ${packages.length} package, ${fileCount} files, and a consumer type-checks`)
