import {mkdirSync, readdirSync, rmSync, writeFileSync} from 'node:fs'
import path from 'node:path'

import {GENERATED_DIRECTORIES, generateOutputs, ROOT, readFlags} from './flags/outputs'

const listFiles = (directory: string): string[] =>
  readdirSync(directory, {recursive: true, withFileTypes: true})
    .filter(entry => entry.isFile())
    .map(entry => path.join(entry.parentPath, entry.name))

const outputs = generateOutputs()

for (const directory of GENERATED_DIRECTORIES) {
  const absolute = path.join(ROOT, directory)
  mkdirSync(absolute, {recursive: true})

  for (const file of listFiles(absolute)) {
    if (!outputs.has(path.relative(ROOT, file))) {
      rmSync(file)
    }
  }
}

for (const [file, contents] of outputs) {
  mkdirSync(path.dirname(path.join(ROOT, file)), {recursive: true})
  writeFileSync(path.join(ROOT, file), contents)
}

for (const {code, notes} of readFlags()) {
  for (const note of new Set(notes)) {
    process.stdout.write(`${code}: ${note}\n`)
  }
}

process.stdout.write(`Generated ${outputs.size} files\n`)
