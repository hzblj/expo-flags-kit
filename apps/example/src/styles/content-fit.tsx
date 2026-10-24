import {type FlagCode, type FlagContentFit, FlagView} from '@hzblj/expo-flags-kit'
import {Box, RnText, SegmentedControl, useAppTheme} from '@hzblj/kara-ui'
import {useState} from 'react'

import {CodeBlock, InlineCode, Section} from '../ui'

const SQUARE = {height: 80, label: 'Square', width: 80}

const BOXES = [SQUARE, {height: 88, label: 'Tall', width: 56}, {height: 44, label: 'Wide', width: 88}]

const FITS: {description: string; fit: FlagContentFit}[] = [
  {description: 'Cropped to fill', fit: 'cover'},
  {description: 'Letterboxed', fit: 'contain'},
  {description: 'Stretched', fit: 'fill'},
]

/** The three ways a flag fills a box of another shape, side by side, in a box of your choice. */
export const ContentFit = ({code}: {code: FlagCode}) => {
  const theme = useAppTheme()
  const [shape, setShape] = useState(0)
  const box = BOXES[shape] ?? SQUARE
  // The view's own background, so the letterbox shows.
  const background = theme.color('fill.tertiary')

  return (
    <Section
      caption="In a box of another shape, contentFit says how the flag fills it: cover crops it (the default), contain letterboxes it and fill stretches it. The grey is the view’s own backgroundColor."
      title="Content fit"
    >
      <SegmentedControl onChange={setShape} selectedIndex={shape} values={BOXES.map(entry => entry.label)} />
      <Box gap="s12" row>
        {FITS.map(({description, fit}) => (
          <Box align="center" bg="surface.primary" borderRadius="large" flex={1} gap="s12" key={fit} px="s8" py="s16">
            <Box center h={88}>
              <FlagView
                code={code}
                contentFit={fit}
                style={{backgroundColor: background, height: box.height, width: box.width}}
              />
            </Box>
            <Box align="center" gap="s2">
              <InlineCode>{`'${fit}'`}</InlineCode>
              <RnText color="content.secondary" variant="footnote">
                {description}
              </RnText>
            </Box>
          </Box>
        ))}
      </Box>
      <CodeBlock
        code={`<FlagView\n  code="${code}"\n  contentFit="contain"\n  style={{width: ${box.width}, height: ${box.height}}}\n/>`}
      />
    </Section>
  )
}
