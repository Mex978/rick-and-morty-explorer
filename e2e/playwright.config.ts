import { defineConfig, devices } from '@playwright/test';

const webPort = process.env.WEB_PORT ?? '3000';
const apiPort = process.env.API_PORT ?? '3001';

export default defineConfig({
  testDir: 'tests',
  // Serial on purpose: the public API rate limits bursts, and the whole suite takes a few seconds anyway.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${webPort}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @rma/api start',
      url: `http://localhost:${apiPort}/api/v1/episodes`,
      env: { PORT: apiPort },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm --filter @rma/web start',
      url: `http://localhost:${webPort}/pt-BR`,
      env: { PORT: webPort, API_URL: `http://localhost:${apiPort}` },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
