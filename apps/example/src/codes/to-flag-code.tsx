import {FlagView, getFlagName, isFlagCode, toFlagCode} from '@hzblj/expo-flags-kit'
import {Box, Chip, Island, RnText, TextField, VStack} from '@hzblj/kara-ui'
import {useState} from 'react'

import {CodeBlock, InlineCode, Section, useFlagOutline} from '../ui'

/** What arrives from APIs and locales, the ones without a flag included. A space shows as a visible one. */
const SAMPLES = ['cz', ' de ', 'gb_eng', 'GB-SCT', 'us-ca', 'Eu', 'CZE', 'Czechia', 'xx']

const FLAG = {width: 56}

const quoted = (text: string) => `'${text.replace(/'/g, "\\'")}'`

/** Why an input has no flag, in the terms of what it looks like. */
const whyNot = (input: string) => {
  const text = input.trim()

  if (text === '') {
    return 'Nothing to look up.'
  }

  if (/^[a-z]{3}$/i.test(text)) {
    return 'Three letters: flags take the two-letter code.'
  }

  if (/^[a-z ]{4,}$/i.test(text)) {
    return 'A name, not a code.'
  }

  return 'No flag has this code.'
}

/** toFlagCode() on whatever you type: the code it finds, or null, and the flag it draws. */
export const ToFlagCode = () => {
  const outline = useFlagOutline()
  const [input, setInput] = useState('gb_sct')
  // The field is uncontrolled: a sample remounts it with the sample as its text.
  const [field, setField] = useState(0)
  const code = toFlagCode(input)

  const pick = (sample: string) => {
    setInput(sample)
    setField(current => current + 1)
  }

  return (
    <Section
      caption="toFlagCode() ignores case and surrounding whitespace, and takes _ for -. Anything without a flag is null, three-letter codes and names included, so it doubles as a guard. isFlagCode() takes canonical codes only."
      title="Codes from outside"
    >
      <Box bg="surface.primary" borderRadius="large" gap="s16" p="s16">
        <Island>
          <VStack wide>
            <TextField
              defaultValue={input}
              key={field}
              label="A code from an API or a locale"
              onChangeText={setInput}
            />
          </VStack>
        </Island>
        <Box gap="s8" row wrap>
          {SAMPLES.map(sample => (
            <Chip
              key={sample}
              label={sample.replace(/ /g, '␣')}
              onPress={() => pick(sample)}
              selected={sample === input}
            />
          ))}
        </Box>
      </Box>
      <Box align="center" bg="surface.primary" borderRadius="large" gap="s16" p="s16" row>
        {code ? (
          <FlagView code={code} style={[FLAG, outline]} />
        ) : (
          <Box
            borderColor="border.secondary.base"
            borderRadius="small"
            borderStyle="dashed"
            borderWidth={1}
            h={40}
            w={56}
          />
        )}
        <Box flex={1} gap="s2">
          <InlineCode>{`toFlagCode(${quoted(input)})`}</InlineCode>
          <RnText color={code ? 'content.primary' : 'content.tertiary'} variant="headingXs">
            {code ? quoted(code) : 'null'}
          </RnText>
          <RnText color="content.secondary" numberOfLines={2} variant="footnote">
            {code ? getFlagName(code) : whyNot(input)}
          </RnText>
          <InlineCode>{`isFlagCode(${quoted(input)}) // ${isFlagCode(input)}`}</InlineCode>
        </Box>
      </Box>
      <CodeBlock
        code={
          'const code = toFlagCode(country.iso)\n\nreturn code ? (\n  <FlagView\n    code={code}\n    style={{width: 20}}\n  />\n) : null'
        }
      />
    </Section>
  )
}
