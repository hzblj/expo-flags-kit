import {type FlagCode, FlagView} from '@hzblj/expo-flags-kit'
import {Box, Pressable, RnText} from '@hzblj/kara-ui'
import {memo} from 'react'

import {useFlagOutline} from '../ui'
import type {FlagEntry} from './entries'

type FlagItemProps = {
  entry: FlagEntry
  onPress: (code: FlagCode) => void
}

/** 32 pt wide: with the row's padding and gap, the name starts 64 pt in, where the divider does. */
const ROW_FLAG = {borderRadius: 4, width: 32}
const CELL_FLAG = {borderRadius: 6, width: '100%'} as const

/**
 * One flag of the list: a row of a grouped card, rounded where the card starts and ends. React Native views only, so
 * 255 of them cost one native flag view each and nothing else.
 */
export const FlagRow = memo(({entry, first, last, onPress}: FlagItemProps & {first: boolean; last: boolean}) => {
  const outline = useFlagOutline()

  return (
    <Pressable
      accessibilityHint="Shows the flag large, with its code, emoji and names"
      accessibilityLabel={entry.name}
      align="center"
      bg="surface.primary"
      borderBottomRadius={last ? 'large' : 'none'}
      borderTopRadius={first ? 'large' : 'none'}
      gap="s16"
      minH={52}
      onPress={() => onPress(entry.code)}
      pressEffect="opacity"
      px="s16"
      py="s12"
      row
    >
      <FlagView code={entry.code} style={[ROW_FLAG, outline]} />
      <RnText flex={1} numberOfLines={1} variant="body">
        {entry.name}
      </RnText>
      <RnText color="content.secondary" variant="subheadline">
        {entry.code}
      </RnText>
    </Pressable>
  )
})

/** The hairline between two rows, on the card's colour so the card stays one piece. */
export const RowDivider = () => (
  <Box bg="surface.primary">
    <Box bg="border.tertiary" h={1} ml="s64" />
  </Box>
)

/** One flag of the grid: the flag across the cell, its code under it. */
export const FlagCell = memo(({entry, onPress, width}: FlagItemProps & {width: number}) => {
  const outline = useFlagOutline()

  return (
    <Pressable
      accessibilityHint="Shows the flag large, with its code, emoji and names"
      accessibilityLabel={entry.name}
      align="center"
      borderRadius="medium"
      gap="s6"
      onPress={() => onPress(entry.code)}
      p="s6"
      w={width}
    >
      <FlagView code={entry.code} style={[CELL_FLAG, outline]} />
      <RnText color="content.secondary" numberOfLines={1} variant="captionMedium">
        {entry.code}
      </RnText>
    </Pressable>
  )
})
