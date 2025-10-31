const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for absolute imports
config.resolver.assetExts.push(
  'db', // Add database files
  'sqlite' // Add SQLite files
);

// Enable better source maps
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;