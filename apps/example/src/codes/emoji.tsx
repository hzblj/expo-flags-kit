import {type FlagCode, getFlagEmoji} from '@hzblj/expo-flags-kit'
import {Box, RnText} from '@hzblj/kara-ui'

import {CodeBlock, Section} from '../ui'

/** Pairs of regional indicators, tag sequences, the rainbow flag, and the three without an emoji. */
const CODES: FlagCode[] = [
  'CZ',
  'JP',
  'BR',
  'EU',
  'XK',
  'LGBT',
  'GB-ENG',
  'GB-SCT',
  'GB-WLS',
  'GB-NIR',
  'GB-ZET',
  'US-CA',
]

const COLUMNS = 4

/** getFlagEmoji() for a dozen flags, the ones Unicode has no emoji for among them. */
export const Emoji = () => (
  <Section
    caption="getFlagEmoji() is for text, notifications and share sheets, where a view does not fit. GB-NIR, GB-ZET and US-CA have no emoji in Unicode’s recommended set: null."
    title="Emoji"
  >
    <Box bg="surface.primary" borderRadius="large" px="s8" py="s12" row wrap>
      {CODES.map(code => {
        const emoji = getFlagEmoji(code)

        return (
          <Box align="center" basis={`${100 / COLUMNS}%`} gap="s2" key={code} py="s8">
            <Box center h={44}>
              {emoji ? (
                <RnText variant="headingL">{emoji}</RnText>
              ) : (
                <RnText color="content.tertiary" variant="subheadline">
                  null
                </RnText>
              )}
            </Box>
            <RnText color="content.secondary" variant="captionMedium">
              {code}
            </RnText>
          </Box>
        )
      })}
    </Box>
    <CodeBlock
      code={`getFlagEmoji('CZ') // '${getFlagEmoji('CZ')}'\ngetFlagEmoji('GB-SCT') // '${getFlagEmoji('GB-SCT')}'\ngetFlagEmoji('US-CA') // null`}
    />
  </Section>
)
