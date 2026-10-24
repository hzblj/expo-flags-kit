import {requireNativeView} from 'expo'
import type {ComponentType} from 'react'
import {View, type ViewProps} from 'react-native'

import {ExpoFlagsKit} from './ExpoFlagsKitModule'
import {accessibilityProps, flagStyle} from './shared'
import type {FlagContentFit, FlagViewProps} from './types'

type NativeFlagViewProps = ViewProps & {
  code: string
  contentFit: FlagContentFit
}

// Expo Go and other builds without the native module get an empty box of the same size instead of an
// "Unimplemented component" error.
const NativeFlagView: ComponentType<NativeFlagViewProps> | null =
  ExpoFlagsKit === null ? null : requireNativeView('ExpoFlagsKit', 'FlagView')

let hasWarned = false

export const FlagView = ({code, contentFit = 'cover', style, ...props}: FlagViewProps) => {
  if (NativeFlagView === null) {
    if (__DEV__ && !hasWarned) {
      hasWarned = true
      // biome-ignore lint/suspicious/noConsole: a one-time development hint about a misconfigured build
      console.warn('[expo-flags-kit] The native module is missing; rebuild the app with `npx expo run:ios|android`.')
    }

    return <View {...accessibilityProps(code, props)} style={flagStyle(style)} />
  }

  return (
    <NativeFlagView
      {...accessibilityProps(code, props)}
      code={code.toUpperCase()}
      contentFit={contentFit}
      style={flagStyle(style)}
    />
  )
}
