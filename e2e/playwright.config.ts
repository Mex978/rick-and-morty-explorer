import { defineConfig, devices } from '@playwright/test';

const webPort = process.env.WEB_PORT ?? '3000';
const apiPort = process.env.API_PORT ?? '3001';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
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
