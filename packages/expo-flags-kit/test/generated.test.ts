import assert from 'node:assert/strict'
import {readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, it} from 'node:test'

import {GENERATED_DIRECTORIES, generateOutputs, ROOT} from '../scripts/flags/outputs'

describe('generated files', () => {
  const outputs = generateOutputs()

  it('match the FlagKit sources; run `yarn flags:generate` after changing either', () => {
    for (const [file, contents] of outputs) {
      assert.equal(readFileSync(path.join(ROOT, file), 'utf8'), contents, file)
    }
  })

  it('leave nothing stale behind', () => {
    for (const directory of GENERATED_DIRECTORIES) {
      const files = readdirSync(path.join(ROOT, directory), {recursive: true, withFileTypes: true})
        // Hidden files such as Finder's .DS_Store are git-ignored, not stale output
        .filter(entry => entry.isFile() && !entry.name.startsWith('.'))
        .map(entry => path.relative(ROOT, path.join(entry.parentPath, entry.name)))

      assert.deepEqual(
        files.filter(file => !outputs.has(file)),
        [],
        directory
      )
    }
  })
})
