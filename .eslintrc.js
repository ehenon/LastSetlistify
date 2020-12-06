module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'no-restricted-syntax': 'off', // TODO: respect this rule
    'no-await-in-loop': 'off', // TODO: respect this rule
    'no-underscore-dangle': 'off', // Disabled for tests using babel-plugin-rewire
  },
};
