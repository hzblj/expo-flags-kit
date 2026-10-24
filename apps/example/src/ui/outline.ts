import {useAppTheme} from '@hzblj/kara-ui'
import {useMemo} from 'react'
import {StyleSheet, type ViewStyle} from 'react-native'

/**
 * A hairline around a flag in the separator colour, so a white one (Japan, Finland) keeps its edge on a white card.
 * `FlagView` takes plain styles: the colour comes from the theme rather than a hex.
 */
export const useFlagOutline = (): ViewStyle => {
  const theme = useAppTheme()

  return useMemo(() => ({borderColor: theme.color('border.tertiary'), borderWidth: StyleSheet.hairlineWidth}), [theme])
}
