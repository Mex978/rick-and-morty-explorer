import base from '@rma/eslint-config/base';
import { defineConfig } from 'eslint/config';

export default defineConfig(base, {
  // The upstream stub is plain Node, outside the TypeScript project.
  files: ['upstream.mjs'],
  languageOptions: {
    globals: { process: 'readonly', Buffer: 'readonly', URL: 'readonly', console: 'readonly' },
  },
});
