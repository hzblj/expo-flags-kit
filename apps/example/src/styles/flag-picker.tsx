import {type FlagCode, FlagView, getFlagName} from '@hzblj/expo-flags-kit'
import {Box, Pressable} from '@hzblj/kara-ui'

import {Section, useFlagOutline} from '../ui'

/** Flags that show off a shape: a disc, stripes, a cross, a mountain outline, a saltire, a rainbow. */
export const SAMPLES: readonly FlagCode[] = ['CZ', 'JP', 'KR', 'BR', 'CH', 'NP', 'GB-SCT', 'LGBT']

const FLAG = {borderRadius: 3, width: 28}

type FlagPickerProps = {
  onChange: (code: FlagCode) => void
  value: FlagCode
}

/** The flag every demo on the page draws, picked from a row of samples. */
export const FlagPicker = ({onChange, value}: FlagPickerProps) => {
  const outline = useFlagOutline()

  return (
    <Section caption="Every demo on this page draws the flag you pick." title="Flag">
      <Box bg="surface.primary" borderRadius="large" justify="space-between" px="s12" py="s12" row>
        {SAMPLES.map(code => (
          <Pressable
            accessibilityLabel={getFlagName(code)}
            accessibilityValue={code === value ? 'Selected' : undefined}
            animate
            borderColor={code === value ? 'fill.accent.primary' : 'surface.primary'}
            borderRadius="small"
            borderWidth={2}
            haptic="selection"
            key={code}
            onPress={() => onChange(code)}
            p="s4"
          >
            <FlagView code={code} style={[FLAG, outline]} />
          </Pressable>
        ))}
      </Box>
    </Section>
  )
}
