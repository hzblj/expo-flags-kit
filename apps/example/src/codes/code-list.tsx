import {FLAG_ASPECT_RATIO, FLAG_CODES, type FlagCode, getFlagName, isFlagCode} from '@hzblj/expo-flags-kit'

import {CodeBlock, Rows, Section} from '../ui'

/** The flags FlagKit adds to the ISO 3166-1 countries. */
const OTHERS: FlagCode[] = ['EU', 'XK', 'LGBT', 'GB-ENG', 'GB-NIR', 'GB-SCT', 'GB-WLS', 'GB-ZET', 'US-CA']

/** FLAG_CODES and the FlagCode type: what is in the list, and what the type keeps out. */
export const CodeList = () => (
  <Section
    caption={`FLAG_CODES: ${FLAG_CODES.length - OTHERS.length} ISO 3166-1 alpha-2 countries and territories, and these ${OTHERS.length}. Codes are uppercase, and FlagCode types every one, so a typo does not compile.`}
    title="Every code"
  >
    <Rows rows={OTHERS.map(code => ({flag: code, id: code, label: getFlagName(code), value: code}))} />
    <CodeBlock
      code={`FLAG_CODES.length // ${FLAG_CODES.length}\nisFlagCode('CZ') // ${isFlagCode('CZ')}\nisFlagCode('cz') // ${isFlagCode('cz')}\nFLAG_ASPECT_RATIO // ${FLAG_ASPECT_RATIO}\n\nconst home: FlagCode = 'CZ'\n// A type error: no such flag\nconst typo: FlagCode = 'CS'`}
    />
  </Section>
)
