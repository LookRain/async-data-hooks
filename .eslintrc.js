module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    'jest/globals': true,
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier', 'jest'],
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    'jsx-quotes': ['error', 'prefer-double'],
    'react-hooks/rules-of-hooks': 'error',
    'react/display-name': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
    'prettier/prettier': 'error',
    'react/jsx-no-bind': 'error',
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/member-ordering': ['error'],
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-use-before-define': 'off',
  },
  parser: '@typescript-eslint/parser',
  settings: {
    react: {
      version: 'detect',
    },
  },
};
