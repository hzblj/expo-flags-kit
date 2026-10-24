import type {ExpoConfig} from 'expo/config'

// Not "Expo Flags Kit": the generated Xcode target would be `ExpoFlagsKit`, the Swift module of the package.
const NAME = 'Flags Example'
const BUNDLE_ID = 'com.hzblj.expoflagskit.example'

export default {
  android: {
    package: BUNDLE_ID,
  },
  experiments: {
    typedRoutes: true,
  },
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: true,
  },
  name: NAME,
  orientation: 'portrait',
  plugins: [
    'expo-router',
    // The example's icons (Material Symbols): every SVG in assets/icons becomes a native asset on both platforms, and
    // its name a type in native-icons.d.ts.
    ['@hzblj/kara-ui', {icons: {source: './assets/icons'}}],
  ],
  scheme: 'flags-kit-example',
  slug: 'expo-flags-kit-example',
  userInterfaceStyle: 'automatic',
  version: '1.0.0',
} satisfies ExpoConfig
