import {NativeModule, requireOptionalNativeModule} from 'expo'

declare class ExpoFlagsKitNativeModule extends NativeModule {
  getRegionName(code: string, locale: string | null): string | null
}

// Null on web and in builds without the native module, such as Expo Go.
export const ExpoFlagsKit = requireOptionalNativeModule<ExpoFlagsKitNativeModule>('ExpoFlagsKit')
