import {type FlagCode, getFlagName} from '@hzblj/expo-flags-kit'
import {SegmentedControl} from '@hzblj/kara-ui'
import {useState} from 'react'

import {CodeBlock, Rows, Section} from '../ui'

/** The app's own language first: getFlagName() without a locale. */
const LOCALES: {label: string; locale?: string}[] = [
  {label: 'App'},
  {label: 'cs', locale: 'cs'},
  {label: 'de', locale: 'de'},
  {label: 'fr', locale: 'fr'},
  {label: 'ja', locale: 'ja'},
  {label: 'ar', locale: 'ar'},
]

/** Countries, the two flags that are regions without being countries, and one that is not a region at all. */
const CODES: FlagCode[] = ['CZ', 'DE', 'US', 'JP', 'EU', 'XK', 'GB-SCT']

/** getFlagName() in the app's language or a locale of your choice. */
export const Names = () => {
  const [selected, setSelected] = useState(0)
  const {locale} = LOCALES[selected] ?? {}
  const call = locale ? `getFlagName('CZ', '${locale}')` : `getFlagName('CZ')`

  return (
    <Section
      caption="getFlagName() names a flag in the app’s language or the locale you pass, from the system’s own locale data (Locale on iOS and Android): nothing is bundled, and the two word a few names differently. GB-SCT and the six other flags that are not a region keep an English name."
      title="Names"
    >
      <SegmentedControl onChange={setSelected} selectedIndex={selected} values={LOCALES.map(entry => entry.label)} />
      <Rows rows={CODES.map(code => ({flag: code, id: code, label: getFlagName(code, locale), value: code}))} />
      <CodeBlock code={`${call}\n// '${getFlagName('CZ', locale)}'`} />
    </Section>
  )
}
