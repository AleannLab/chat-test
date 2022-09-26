module.exports = {
  webpackFinal: async (config, { configType }) => {
    config.optimization = {
      minimize: false,
      minimizer: [],
    };

    return config;
  },
  stories: ['../src/components/**/*.stories.js'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
  ],
};
