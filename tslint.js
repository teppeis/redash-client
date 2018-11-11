'use strict';

const importESLintConfig = require('tslint-import-eslint-config');

module.exports = importESLintConfig({
  extends: ['teppeis/node-v8', 'teppeis/+prettier', 'teppeis/+mocha'],
});

module.exports.rulesDirectory = ['tslint-plugin-prettier'];
module.exports.extends.push('tslint-config-prettier');
Object.assign(module.exports.rules, {
  prettier: [true, './node_modules/eslint-config-teppeis/.prettierrc.json'],
  // Since TypeScript 2.9. Please use the built-in compiler checks instead.
  'no-unused-variable': false,
  // TSLint cannot allow `this` in class-like objects
  'no-invalid-this': false,
});
