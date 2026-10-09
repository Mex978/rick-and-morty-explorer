import { defineConfig, devices } from '@playwright/test';

// Own ports, so the suite never picks up a dev server left on 3000/3001.
const webPort = process.env.WEB_PORT ?? '3100';
const apiPort = process.env.API_PORT ?? '3101';
const upstreamPort = process.env.UPSTREAM_PORT ?? '3102';

export default defineConfig({
  testDir: 'tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${webPort}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Started in this order: the api's readiness url needs the upstream stub, the web app needs the api.
  webServer: [
    {
      command: 'node upstream.mjs',
      url: `http://localhost:${upstreamPort}/api/episode/1`,
      env: { PORT: upstreamPort },
      reuseExistingServer: false,
    },
    {
      command: 'pnpm --filter @rma/api start',
      url: `http://localhost:${apiPort}/api/v1/episodes`,
      env: { PORT: apiPort, RICK_AND_MORTY_API_URL: `http://localhost:${upstreamPort}/api` },
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
