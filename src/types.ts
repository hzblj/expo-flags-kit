import type {ViewProps} from 'react-native'

import type {FlagCode} from './codes'

export type FlagContentFit = 'contain' | 'cover' | 'fill'

// `accessible` makes the flag an image named after its country (see getFlagName); `accessibilityLabel` names it
// yourself. Without either, the flag is decorative.
export type FlagViewProps = ViewProps & {
  code: FlagCode
  // How the 21:15 flag fills a box of another shape: cropped (default), letterboxed, or stretched.
  contentFit?: FlagContentFit
}
