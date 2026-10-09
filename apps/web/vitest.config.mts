import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    server: {
      deps: { inline: ['next-intl'] },
    },
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      // Next runtime glue without logic of its own, covered by Playwright instead.
      exclude: [
        'src/**/*.d.ts',
        'src/proxy.ts',
        'src/i18n/request.ts',
        'src/i18n/navigation.ts',
        'src/lib/registry.tsx',
        'src/styles/global.ts',
        'src/app/[locale]/layout.tsx',
        'src/**/styles.ts',
      ],
      thresholds: { statements: 95, branches: 85, functions: 95, lines: 95 },
    },
  },
});
