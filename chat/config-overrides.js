const { addDecoratorsLegacy, useEslintRc, override } = require("customize-cra");
const { name } = require('./package.json');

// module.exports = override(addDecoratorsLegacy());

module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = "umd";
    config.output.jsonpFunction = `webpackJsonp_${name}`;
    config.output.globalObject = "window";

    return config;
  },

  devServer: (configFunction) => {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.open = false;
      config.hot = false;
      config.headers = {
        "Access-Control-Allow-Origin": "*",
      };
      return config;
    };
  },
};
