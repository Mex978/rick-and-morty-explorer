import { expect, test } from '@playwright/test';

test('switches to the dark theme and keeps it after a reload', async ({ page }) => {
  await page.goto('/pt-BR');

  await page.getByRole('button', { name: 'Alternar tema' }).click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
