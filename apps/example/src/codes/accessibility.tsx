import {FlagView, type FlagViewProps, getFlagName} from '@hzblj/expo-flags-kit'
import {Box, type IconName, RnIcon, RnText} from '@hzblj/kara-ui'
import {Fragment} from 'react'

import {InlineCode, Section, useFlagOutline} from '../ui'

type Mode = {
  code: string
  description: string
  icon: IconName
  id: string
  props: Partial<FlagViewProps>
  /** What VoiceOver and TalkBack say on the flag. */
  reads: string
  title: string
}

const MODES: Mode[] = [
  {
    code: '<FlagView code="CZ" />',
    description: 'The default: a flag usually sits next to the country’s name, so screen readers skip it.',
    icon: 'visibility-off',
    id: 'decorative',
    props: {},
    reads: 'Skipped',
    title: 'Decorative',
  },
  {
    code: '<FlagView accessible code="CZ" />',
    description: 'An image named after the country, in the app’s language: the name getFlagName() gives.',
    icon: 'record-voice-over',
    id: 'accessible',
    props: {accessible: true},
    reads: `“${getFlagName('CZ')}”, image`,
    title: 'Named by the system',
  },
  {
    code: 'accessibilityLabel="Switch to Czech"',
    description: 'For a flag that does something, such as a language switcher of flags alone.',
    icon: 'record-voice-over',
    id: 'label',
    props: {accessibilityLabel: 'Switch to Czech'},
    reads: '“Switch to Czech”, image',
    title: 'Your own label',
  },
]

const FLAG = {width: 48}

/** The three ways a screen reader meets a flag, each on a real flag to touch with VoiceOver or TalkBack on. */
export const Accessibility = () => {
  const outline = useFlagOutline()

  return (
    <Section
      caption="Turn on VoiceOver or TalkBack and touch each flag. An accessible flag gets the image role unless you pass another one."
      title="Accessibility"
    >
      <Box bg="surface.primary" borderRadius="large">
        {MODES.map((mode, index) => (
          <Fragment key={mode.id}>
            {index > 0 ? <Box bg="border.tertiary" h={1} ml="s16" /> : null}
            <Box gap="s16" p="s16" row>
              <FlagView {...mode.props} code="CZ" style={[FLAG, outline]} />
              <Box flex={1} gap="s4">
                <RnText variant="subheadlineMedium">{mode.title}</RnText>
                <RnText color="content.secondary" variant="footnote">
                  {mode.description}
                </RnText>
                <InlineCode>{mode.code}</InlineCode>
                <Box align="center" gap="s6" row>
                  <RnIcon color="content.accent" name={mode.icon} size="s16" />
                  <RnText color="content.accent" variant="footnoteMedium">
                    {mode.reads}
                  </RnText>
                </Box>
              </Box>
            </Box>
          </Fragment>
        ))}
      </Box>
    </Section>
  )
}
