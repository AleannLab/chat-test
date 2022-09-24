module.exports = {
  env: {
    node: true,
    browser: true,
    es2020: true,
    'jest/globals': true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:react/jsx-runtime',
    'plugin:storybook/recommended',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    requireConfigFile: false,
    sourceType: 'module',
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: ['react', 'prettier', 'jest', 'jest-dom', 'testing-library'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prop-types': 'off',
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
    'require-yield': 'off',
    // eslint not understand hooks in such component: React.memo(observer(Component))
    'react-hooks/rules-of-hooks': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    // suppress errors for missing 'import React' in files
    'prettier/prettier': 'warn',
  },
  overrides: [
    {
      // enable eslint-plugin-testing-library rules or preset only for matching files!
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:testing-library/react', 'plugin:jest-dom/recommended'],
    },
  ],
};
