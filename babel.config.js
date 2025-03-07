module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript'
    ],
    plugins: [
      // TypeScript support
      '@babel/plugin-transform-typescript',
      // Supports the "jsx" syntax
      '@babel/plugin-transform-react-jsx',
      // Reanimated plugin must be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
