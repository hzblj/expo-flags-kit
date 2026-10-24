import {FLAG_ASPECT_RATIO, type FlagCode, FlagView} from '@hzblj/expo-flags-kit'
import {Box, RnText} from '@hzblj/kara-ui'

import {CodeBlock, Section, useFlagOutline} from '../ui'

const WIDTHS = [16, 24, 32, 48, 64, 88]

/** The same flag at six widths, each sized by its width alone. */
export const Sizes = ({code}: {code: FlagCode}) => {
  const outline = useFlagOutline()

  return (
    <Section
      caption="Sized by its width alone, the flag takes the height FlagKit’s 21:15 asks for. Vectors on both platforms: sharp at 16 pt, sharp at full width."
      title="Sizes"
    >
      <Box align="flex-end" bg="surface.primary" borderRadius="large" justify="space-between" p="s16" row>
        {WIDTHS.map(width => (
          <Box align="center" gap="s8" key={width}>
            <FlagView code={code} style={[{borderRadius: width / 16, width}, outline]} />
            <RnText color="content.tertiary" variant="caption">
              {String(width)}
            </RnText>
          </Box>
        ))}
      </Box>
      <CodeBlock code={`<FlagView\n  code="${code}"\n  style={{width: 24}}\n/>`} />
    </Section>
  )
}

/** No size at all: the width the layout gives it, and the ratio's height. */
export const FullWidth = ({code}: {code: FlagCode}) => (
  <Section
    caption={`Without a size the flag takes the width it is given, and a height by the ratio: FLAG_ASPECT_RATIO, ${FLAG_ASPECT_RATIO}, for layout math. A height alone works the same way round.`}
    title="Full width"
  >
    <Box bg="surface.primary" borderRadius="large" overflow="hidden">
      <FlagView code={code} />
    </Box>
    <CodeBlock code={`<FlagView code="${code}" />\n\n<FlagView\n  code="${code}"\n  style={{height: 40}}\n/>`} />
  </Section>
)
