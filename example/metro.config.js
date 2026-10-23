const path = require('node:path')

const {getDefaultConfig} = require('expo/metro-config')

const root = path.resolve(__dirname, '..')
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const config = getDefaultConfig(__dirname)

config.watchFolders = [root]

// The library's own node_modules holds a second copy of expo, react and react-native for its type checks;
// hide it so the library's source resolves them from the example.
config.resolver.blockList = [
  ...[].concat(config.resolver.blockList ?? []),
  new RegExp(`^${escapeRegExp(path.join(root, 'node_modules'))}/.*`),
]
config.resolver.nodeModulesPaths = [path.join(__dirname, 'node_modules')]

// Bundle the library from source, so changes show up without a build.
config.resolver.resolveRequest = (context, moduleName, platform) =>
  context.resolveRequest(
    context,
    moduleName === '@hzblj/expo-flags-kit' ? path.join(root, 'src/index.ts') : moduleName,
    platform
  )

module.exports = config
