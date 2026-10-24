import {type FlagCode, FlagView} from '@hzblj/expo-flags-kit'
import {Box, RnText} from '@hzblj/kara-ui'
import {Fragment} from 'react'

import {useFlagOutline} from './outline'

export type RowProps = {
  /** A flag before the label. */
  flag?: FlagCode
  id: string
  label: string
  /** The trailing text, in the secondary colour. */
  value?: string
}

/** 32 pt wide: with the row's padding and gap, the label starts 64 pt in, where the divider does. */
const FLAG = {borderRadius: 4, width: 32}

const Row = ({flag, label, value}: RowProps) => {
  const outline = useFlagOutline()

  return (
    <Box align="center" gap="s16" minH={48} px="s16" py="s12" row>
      {flag ? <FlagView code={flag} style={[FLAG, outline]} /> : null}
      <RnText flex={1} numberOfLines={1} variant="body">
        {label}
      </RnText>
      {value ? (
        <RnText color="content.secondary" numberOfLines={1} shrink variant="body">
          {value}
        </RnText>
      ) : null}
    </Box>
  )
}

/** A grouped card of rows, a label on the leading edge and a value on the trailing one, like a settings screen's. */
export const Rows = ({rows}: {rows: readonly RowProps[]}) => (
  <Box bg="surface.primary" borderRadius="large" overflow="hidden">
    {rows.map((row, index) => (
      <Fragment key={row.id}>
        {index > 0 ? <Box bg="border.tertiary" h={1} ml={row.flag ? 's64' : 's16'} /> : null}
        <Row {...row} />
      </Fragment>
    ))}
  </Box>
)
