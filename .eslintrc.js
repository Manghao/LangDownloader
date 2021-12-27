module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: {
    'no-console': 'off',
    'no-await-in-loop': 'off',
    'no-continue': 'off',
    'no-cond-assign': 'off',
    'prefer-regex-literals': 'off',
  },
};
