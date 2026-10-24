require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoFlagsKit'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.license        = package['license']
  s.platforms      = { :ios => '16.4' }
  s.source         = { :git => 'https://github.com/hzblj/expo-flags-kit.git', :tag => "@hzblj/expo-flags-kit@#{s.version}" }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.{h,m,mm,swift}'
  # A separate bundle compiles its own asset catalog; listing the catalog under `resources` would collide
  # with the app's Assets.car ("Multiple commands produce").
  s.resource_bundles = { 'ExpoFlagsKit' => ['Flags.xcassets'] }
end
