const { addDecoratorsLegacy, override, fixBabelImports } = require('customize-cra');
const { name } = require('./package.json');

module.exports = {
  webpack: override(
    fixBabelImports('import', {
      libraryName: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`,
      globalObject: 'window',
    }),
    addDecoratorsLegacy(),
  ),
  devServer: (configFunction) => {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.open = false;
      config.hot = false;
      config.headers = {
        'Access-Control-Allow-Origin': '*',
      };
      return config;
    };
  },
};
