import {type FlagCode, FlagView, getFlagEmoji, getFlagName} from '@hzblj/expo-flags-kit'
import {type NavigationBarItem, Sheet} from '@hzblj/kara-ui'
import {useMemo} from 'react'
import {Platform} from 'react-native'

import {CodeBlock, Rows, Section, useFlagOutline} from '../ui'

/** Each language named in itself, as a language picker lists them. */
const LANGUAGES = [
  {language: 'English', locale: 'en'},
  {language: 'Čeština', locale: 'cs'},
  {language: 'Deutsch', locale: 'de'},
  {language: 'Français', locale: 'fr'},
  {language: 'Español', locale: 'es'},
  {language: '日本語', locale: 'ja'},
  {language: 'العربية', locale: 'ar'},
]

/** The flags that are not a region: the system has no name for them, so they keep an English one. */
const NOT_A_REGION: ReadonlySet<string> = new Set(['GB-ENG', 'GB-NIR', 'GB-SCT', 'GB-WLS', 'GB-ZET', 'LGBT', 'US-CA'])

const HERO = {borderRadius: 12, width: '100%'} as const

/** Where the flag lives in the app: an image of the module's asset catalog, or one of its drawables. */
const nativeAsset = (code: FlagCode) =>
  Platform.OS === 'ios' ? `ExpoFlagsKit.bundle/${code}` : `expo_flags_kit_${code.toLowerCase().replace(/-/g, '_')}`

type FlagSheetProps = {
  code: FlagCode
  onDismiss: () => void
  visible: boolean
}

/** One flag up close: large, with its code, its emoji and its name in a few languages. */
export const FlagSheet = ({code, onDismiss, visible}: FlagSheetProps) => {
  const outline = useFlagOutline()
  const close = useMemo<NavigationBarItem[]>(() => [{onPress: onDismiss, type: 'close'}], [onDismiss])

  return (
    <Sheet bg="surface.base" detents={[0.75, 1]} onDismiss={onDismiss} scrollable visible={visible}>
      <Sheet.Header title={getFlagName(code)} trailingItems={close} />
      <Sheet.ScrollView content={{gap: 's24', pb: 's40', pt: 's8', px: 's20'}}>
        <FlagView accessible code={code} style={[HERO, outline]} />
        <Rows
          rows={[
            {id: 'code', label: 'Code', value: code},
            {id: 'emoji', label: 'Emoji', value: getFlagEmoji(code) ?? 'None in Unicode'},
            {id: 'asset', label: Platform.OS === 'ios' ? 'Image' : 'Drawable', value: nativeAsset(code)},
          ]}
        />
        <Section
          caption={
            NOT_A_REGION.has(code)
              ? 'Not a region, so the system has no name for it in any language: getFlagName() gives its English one. Pass accessibilityLabel to translate it.'
              : 'From the system’s own locale data, nothing bundled. iOS and Android word a few names differently.'
          }
          title="Names"
        >
          <Rows
            rows={LANGUAGES.map(({language, locale}) => ({
              id: locale,
              label: language,
              value: getFlagName(code, locale),
            }))}
          />
        </Section>
        <Section title="Code">
          <CodeBlock code={`<FlagView\n  accessible\n  code="${code}"\n  style={{width: 24}}\n/>`} />
        </Section>
      </Sheet.ScrollView>
    </Sheet>
  )
}
