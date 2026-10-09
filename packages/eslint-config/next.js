import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

import base from './base.js';

export default defineConfig(
  base,
  nextPlugin.configs['core-web-vitals'],
  reactHooks.configs.flat.recommended,
);
