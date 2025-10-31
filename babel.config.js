module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@/components': './components',
            '@/screens': './app',
            '@/contexts': './contexts',
            '@/hooks': './hooks',
            '@/lib': './lib',
            '@/services': './services',
            '@/types': './types',
            '@/utils': './utils',
            '@/assets': './assets',
            '@/styles': './styles',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};