module.exports = {
  plugins: [],
  env: {
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:jest/recommended',
  ],
  rules: {
    'no-console': 0,
  },
};
