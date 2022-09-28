const { merge } = require("webpack-merge");
const webpack = require("webpack");
const singleSpaDefaults = require("webpack-config-single-spa-react");
const Dotenv = require("dotenv-webpack");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "app",
    projectName: "hello-kasper",
    webpackConfigEnv,
    argv,
  });

  return merge(defaultConfig, {
    resolve: {
      preferRelative: true,
    },
    devServer: {
      port: 8500,
    },
    plugins: [
      new Dotenv({
        path: "./.env.development",
      }),
    ],
    module: {
      rules: [
        {
          test: /\.m?js/,
          type: "javascript/auto",
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.jsx$/,
          use: "babel-loader?presets[]=react,presets[]=es2015,presets[]=react-hmre",
          exclude: /node_modules/,
        },
        {
          test: /\.json$/,
          use: "json-loader",
        },
        {
          test: /\.ts$/,
          use: ["ts-loader"],
        },
        // {
        //   test: /\.jsx?$/,
        //   loader: "babel",
        //   query: {
        //     cacheDirectory: true,
        //     plugins: ["transform-decorators-legacy"],
        //     presets: ["es2015", "stage-0", "react"],
        //   },
        // },
        // {
        //   test: /\.css$/,
        //   use: ["css-loader", "style-loader"],
        // },
      ],
    },
  });
};
