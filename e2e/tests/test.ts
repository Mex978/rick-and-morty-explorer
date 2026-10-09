import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

// A transparent 1x1 PNG. Locally the browser and the API leave from the same IP, so real avatar downloads
// would eat the upstream CDN's per-IP quota that the API calls under test need.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://rickandmortyapi.com/api/character/avatar/**', (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL }),
    );
    await use(page);
  },
});
