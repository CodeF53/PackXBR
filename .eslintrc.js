module.exports = {
  extends: '@antfu',

  rules: {
    'no-console': ['error', { allow: ['time', 'timeEnd'] }],
  },
}
