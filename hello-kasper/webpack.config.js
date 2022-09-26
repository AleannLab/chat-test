const { merge } = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-react');
const { rewiredSingleSpa } = require('react-app-rewired-single-spa');
const { addDecoratorsLegacy, useEslintRc, override } = require('customize-cra');

// const webpackConfig = (webpackConfigEnv, argv) => {
//   const defaultConfig = singleSpaDefaults({
//     orgName: 'app',
//     projectName: 'hello-kasper',
//     webpackConfigEnv,
//     argv,
//   });

//   return merge(defaultConfig, {
//     // modify the webpack config however you'd like to by adding to this object
//   });
// };

module.exports = override(
  rewiredSingleSpa({
    orgName: 'app',
    projectName: 'hello-kasper',
    reactPackagesAsExternal: true,
    peerDepsAsExternal: true,
    orgPackagesAsExternal: true,
  }),
  addDecoratorsLegacy(),
);
