module.exports = {
  root: true,
  extends: ['@react-native/eslint-config'],
  ignorePatterns: ['reports/**', 'reports/allure/**', 'reports/allure-html/**'],
  overrides: [
    {
      files: ['wdio.*.conf.js'],
      env: {node: true},
      globals: {
        driver: 'readonly',
        browser: 'readonly',
        Buffer: 'readonly',
      },
    },
    {
      files: ['tests/e2e/**/*.js'],
      env: {node: true},
      globals: {
        driver: 'readonly',
        browser: 'readonly',
      },
    },
  ],
};
