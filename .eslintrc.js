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
    'linebreak-style': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-loop-func': 'off',
  },
};
