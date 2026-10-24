import {type StyleProp, StyleSheet, type ViewProps, type ViewStyle} from 'react-native'

import type {FlagCode} from './codes'
import {getFlagName} from './names'

// Width to height of every FlagKit flag (21 × 15).
export const FLAG_ASPECT_RATIO = 21 / 15

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
  },
  flag: {
    aspectRatio: FLAG_ASPECT_RATIO,
    overflow: 'hidden',
  },
})

// A flag sized by its width or height alone keeps its proportions, and borderRadius clips it on both
// platforms. Yoga lets aspectRatio override an explicit height, so a style that sets both dimensions, or a
// ratio of its own, gets no default ratio.
export const flagStyle = (style: StyleProp<ViewStyle>): StyleProp<ViewStyle> => {
  const {aspectRatio, height, width} = StyleSheet.flatten(style) ?? {}
  const isSized = aspectRatio !== undefined || (width !== undefined && height !== undefined)

  return [isSized ? styles.box : styles.flag, style]
}

// A flag is decorative unless it is labelled or marked accessible, because it usually sits next to the
// country's name. An accessible flag is an image, named after its country unless it has a label.
export const accessibilityProps = (code: FlagCode, props: ViewProps): ViewProps => {
  const label = props.accessibilityLabel ?? props['aria-label']

  if (!(props.accessible ?? label !== undefined)) {
    return props
  }

  return {
    accessibilityRole: 'image',
    ...props,
    accessibilityLabel: label ?? getFlagName(code),
    accessible: true,
  }
}
