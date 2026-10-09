import { defineConfig, devices } from '@playwright/test';

// Own ports, so the suite never picks up a dev server left on 3000/3001.
const webPort = process.env.WEB_PORT ?? '3100';
const apiPort = process.env.API_PORT ?? '3101';

export default defineConfig({
  testDir: 'tests',
  // Serial: the public API rate-limits bursts.
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
      reuseExistingServer: false,
    },
    {
      command: 'pnpm --filter @rma/web start',
      url: `http://localhost:${webPort}/pt-BR`,
      env: { PORT: webPort, API_URL: `http://localhost:${apiPort}` },
      reuseExistingServer: false,
    },
  ],
});
