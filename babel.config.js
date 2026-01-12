module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // 1. NativeWind v2 (Simple)
      "nativewind/babel",
      // 2. WatermelonDB
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      // 3. Reanimated (Siempre al final)
      "react-native-reanimated/plugin",
    ],
  };
};