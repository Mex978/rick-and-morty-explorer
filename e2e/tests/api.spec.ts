import { expect, test } from '@playwright/test';

const apiPort = process.env.API_PORT ?? '3101';
const api = `http://localhost:${apiPort}`;

test('serves the operational endpoints outside the api prefix', async ({ request }) => {
  const live = await request.get(`${api}/health`);
  const ready = await request.get(`${api}/health/ready`);
  const upstream = await request.get(`${api}/health/upstream`);
  const metrics = await request.get(`${api}/metrics`);

  expect(live.ok()).toBe(true);
  expect(ready.ok()).toBe(true);
  expect(upstream.ok()).toBe(true);
  expect(await metrics.text()).toContain('http_request_duration_seconds');
});

test('answers a repeated request from its cache', async ({ request }) => {
  await request.get(`${api}/api/v1/episodes/2`);
  const second = await request.get(`${api}/api/v1/episodes/2`);

  expect(second.headers()['x-cache']).toBe('HIT');
  expect(second.headers()['cache-control']).toBe('public, max-age=3600');
});
