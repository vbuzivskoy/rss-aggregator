module.exports = {
  plugins: [],
  env: {
    browser: true,
  },
  extends: [
    'airbnb-base',
    'plugin:jest/recommended',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/recommended',
  ],
  rules: {
    'no-console': 0,
    'testing-library/prefer-screen-queries': 'warn',
  },
};
