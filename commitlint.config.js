module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['repo', 'config', 'types', 'api', 'web', 'e2e', 'ci', 'deps', 'release'],
    ],
  },
};
