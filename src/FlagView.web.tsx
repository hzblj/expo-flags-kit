import {Image, type ImageResizeMode, StyleSheet, View} from 'react-native'

import {FLAG_ASSETS} from './assets.web.generated'
import {isFlagCode} from './codes'
import {accessibilityProps, flagStyle} from './shared'
import type {FlagContentFit, FlagViewProps} from './types'

const RESIZE_MODES: Record<FlagContentFit, ImageResizeMode> = {
  contain: 'contain',
  cover: 'cover',
  fill: 'stretch',
}

// Without an explicit size, react-native-web sizes an image to its asset (21 × 15) rather than its box.
const styles = StyleSheet.create({
  image: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
})

// Each flag is a separate SVG asset, so the browser downloads only the flags it shows.
export const FlagView = ({code, contentFit = 'cover', style, ...props}: FlagViewProps) => {
  const flagCode: string = code.toUpperCase()

  return (
    <View {...accessibilityProps(code, props)} style={flagStyle(style)}>
      {isFlagCode(flagCode) ? (
        <Image
          accessible={false}
          resizeMode={RESIZE_MODES[contentFit]}
          source={FLAG_ASSETS[flagCode]}
          style={styles.image}
        />
      ) : null}
    </View>
  )
}
