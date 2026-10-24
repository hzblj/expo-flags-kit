import {type FlagCode, type FlagContentFit, FlagView} from '@hzblj/expo-flags-kit'
import {Box, HStack, Island, SegmentedControl, Slider, Spacer, Switch, Text, useAppTheme, VStack} from '@hzblj/kara-ui'
import {useState} from 'react'
import {StyleSheet} from 'react-native'

import {CodeBlock, Section} from '../ui'

const PROPORTIONS = ['21:15', 'Square']
const FITS: FlagContentFit[] = ['cover', 'contain', 'fill']
const MIN_WIDTH = 24
const MAX_WIDTH = 200
/** Room for the largest flag the sliders make, so the controls under it never move. */
const PREVIEW_HEIGHT = MAX_WIDTH + 32
/** What the snippet suggests for a border: a neutral grey, as the README's examples use. */
const BORDER_HEX = '#D1D5DB'

type Design = {
  border: boolean
  /** A share of the shorter side, from square corners (0) to a circle or a pill (0.5). */
  corners: number
  fit: FlagContentFit
  square: boolean
  width: number
}

const sizeOf = ({square, width}: Design) => ({height: square ? width : Math.round((width * 15) / 21), width})

const radiusOf = (design: Design) => {
  const {height, width} = sizeOf(design)

  return Math.round(design.corners * Math.min(width, height))
}

/** The design as the code that draws it, a line per style key once there is more than the width. */
const codeOf = (code: FlagCode, design: Design) => {
  const radius = radiusOf(design)
  const keys = [
    `width: ${design.width}`,
    ...(design.square ? [`height: ${design.width}`] : []),
    ...(radius > 0 ? [`borderRadius: ${radius}`] : []),
    ...(design.border ? ['borderWidth: 1', `borderColor: '${BORDER_HEX}'`] : []),
  ]
  const fit = design.square && design.fit !== 'cover' ? `\n  contentFit="${design.fit}"` : ''
  const style =
    keys.length === 1 ? `  style={{${keys[0]}}}` : `  style={{\n${keys.map(key => `    ${key},`).join('\n')}\n  }}`

  return `<FlagView\n  code="${code}"${fit}\n${style}\n/>`
}

const SliderRow = ({
  label,
  max,
  min,
  onValueChange,
  value,
  valueLabel,
}: {
  label: string
  max: number
  min: number
  onValueChange: (value: number) => void
  value: number
  valueLabel: string
}) => (
  <VStack spacing="s4" wide>
    <HStack wide>
      <Text variant="body">{label}</Text>
      <Spacer />
      <Text color="content.secondary" variant="body">
        {valueLabel}
      </Text>
    </HStack>
    <Slider max={max} min={min} onValueChange={onValueChange} value={value} />
  </VStack>
)

/** A flag of your own design: its proportions, size, corners, border and fit, and the code for it. */
export const Playground = ({code}: {code: FlagCode}) => {
  const theme = useAppTheme()
  const [design, setDesign] = useState<Design>({border: false, corners: 0.1, fit: 'cover', square: false, width: 140})
  const change = (update: Partial<Design>) => setDesign(current => ({...current, ...update}))
  const radius = radiusOf(design)

  return (
    <Section
      caption="contentFit matters only once both dimensions are set: at 21:15 the flag fills its box exactly."
      title="Make your own"
    >
      <Box bg="surface.primary" borderRadius="large" overflow="hidden">
        <Box center h={PREVIEW_HEIGHT}>
          <FlagView
            code={code}
            contentFit={design.fit}
            style={{
              ...sizeOf(design),
              borderRadius: radius,
              ...(design.border
                ? {borderColor: theme.color('border.secondary.base'), borderWidth: 1}
                : {borderColor: theme.color('border.tertiary'), borderWidth: StyleSheet.hairlineWidth}),
            }}
          />
        </Box>
        <Box bg="border.tertiary" h={1} />
        <Box gap="s12" pt="s16" px="s16">
          <SegmentedControl
            onChange={index => change({square: index === 1})}
            selectedIndex={design.square ? 1 : 0}
            values={PROPORTIONS}
          />
          <SegmentedControl
            disabled={!design.square}
            onChange={index => change({fit: FITS[index] ?? 'cover'})}
            selectedIndex={FITS.indexOf(design.fit)}
            values={FITS}
          />
        </Box>
        <Island>
          <VStack p="s16" spacing="s16" wide>
            <SliderRow
              label="Width"
              max={MAX_WIDTH}
              min={MIN_WIDTH}
              onValueChange={width => change({width: Math.round(width)})}
              value={design.width}
              valueLabel={`${design.width} pt`}
            />
            <SliderRow
              label="Corners"
              max={0.5}
              min={0}
              onValueChange={corners => change({corners})}
              value={design.corners}
              valueLabel={`${radius} pt`}
            />
            <Switch label="Border" onValueChange={border => change({border})} value={design.border} />
          </VStack>
        </Island>
      </Box>
      <CodeBlock code={codeOf(code, design)} />
    </Section>
  )
}
