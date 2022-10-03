const { merge } = require("webpack-merge");
const Dotenv = require("dotenv-webpack");
const path = require("path");
const singleSpaDefaults = require("webpack-config-single-spa-react");
const override = require("./config-overrides.js");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "app",
    projectName: "chat",
    webpackConfigEnv,
    argv,
    override
  });

  return merge(
    defaultConfig,
    {
      resolve: {
        preferRelative: true,
        alias: {
          containers: path.resolve(__dirname, "src/containers"),
          components: path.resolve(__dirname, "src/components"),
          layouts: path.resolve(__dirname, "src/layouts"),
          stores: path.resolve(__dirname, "src/stores"),
          hooks: path.join(__dirname, "src/hooks"),
          context: path.join(__dirname, "src/context"),
          assets: path.join(__dirname, "src/assets"),
          helpers: path.join(__dirname, "src/helpers")
        },
      },
      devServer: {
        port: 8600,
      },
      plugins: [
        new Dotenv({
          path: "./.env.development",
        }),
      ],
      output: {
        path: path.resolve(__dirname, "build"),
      },
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
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
          },
          {
            test: /\.json$/,
            use: "json-loader",
          },
          {
            test: /\.ts$/,
            use: ["ts-loader"],
          },
          {
            test: /\.svg$/,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack', 'url-loader'],
          },
          {
            test: /\.(png|jpe?g|gif|wav)$/i,
            use: ['file-loader'],
          },
        ],
      },
    }
  );
};
