import {type FlagCode, FlagView} from '@hzblj/expo-flags-kit'
import {Box, RnText, useAppTheme} from '@hzblj/kara-ui'
import {useMemo} from 'react'
import type {ViewStyle} from 'react-native'

import {Grid, InlineCode, Section, useFlagOutline} from '../ui'

type Shape = {
  /** The style that makes it, a line per key, as a tile can hold it. */
  code: string[]
  id: string
  style: ViewStyle
  title: string
}

const useShapes = (): Shape[] => {
  const theme = useAppTheme()
  const outline = useFlagOutline()

  return useMemo(
    () => [
      {
        code: ['width: 64,', 'height: 64,', 'borderRadius: 32'],
        id: 'circle',
        style: {...outline, borderRadius: 32, height: 64, width: 64},
        title: 'Circle',
      },
      {
        code: ['width: 64,', 'height: 64'],
        id: 'square',
        style: {...outline, height: 64, width: 64},
        title: 'Square',
      },
      {
        code: ['width: 96,', 'borderRadius: 12'],
        id: 'rounded',
        style: {...outline, borderRadius: 12, width: 96},
        title: 'Rounded',
      },
      {
        code: ['borderRadius: 4,', 'borderWidth: 1'],
        id: 'bordered',
        style: {borderColor: theme.color('border.secondary.base'), borderRadius: 4, borderWidth: 1, width: 96},
        title: 'Bordered',
      },
      {
        code: ['width: 96,', 'height: 40,', 'borderRadius: 20'],
        id: 'pill',
        style: {...outline, borderRadius: 20, height: 40, width: 96},
        title: 'Pill',
      },
      {
        code: ['borderRadius: 32,', 'borderWidth: 3'],
        id: 'ring',
        style: {
          borderColor: theme.color('fill.accent.primary'),
          borderRadius: 32,
          borderWidth: 3,
          height: 64,
          width: 64,
        },
        title: 'Ring',
      },
    ],
    [outline, theme]
  )
}

/** Shapes from plain styles: the flag clips to its own `borderRadius` and keeps its border on top. */
export const Shapes = ({code}: {code: FlagCode}) => (
  <Section
    caption="Plain view styles: the flag clips to its borderRadius on both platforms, and a border stays on top of it. Both dimensions given, it covers the box."
    title="Shapes"
  >
    <Grid
      items={useShapes()}
      keyOf={shape => shape.id}
      render={shape => (
        <Box bg="surface.primary" borderRadius="large" flex={1} gap="s12" p="s16">
          <Box center h={72}>
            <FlagView code={code} style={shape.style} />
          </Box>
          <Box gap="s4">
            <RnText variant="subheadlineMedium">{shape.title}</RnText>
            <Box>
              {shape.code.map(line => (
                <InlineCode key={line}>{line}</InlineCode>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    />
  </Section>
)
