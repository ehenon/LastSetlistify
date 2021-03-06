module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'no-console': 'off',
    'no-restricted-syntax': 'off', // TODO: respect this rule
    'no-await-in-loop': 'off', // TODO: respect this rule
  },
};
