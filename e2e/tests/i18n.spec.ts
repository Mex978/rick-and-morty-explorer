import { expect, test } from '@playwright/test';

test('renders the english version at /en', async ({ page }) => {
  await page.goto('/en');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'Episodes' })).toBeVisible();
});

test('switches language keeping the current page', async ({ page }) => {
  await page.goto('/pt-BR/episodes/1');

  await page.getByRole('link', { name: 'en', exact: true }).click();

  await expect(page).toHaveURL(/\/en\/episodes\/1$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Characters' })).toBeVisible();
});
