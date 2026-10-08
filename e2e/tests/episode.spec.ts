import { expect, test } from '@playwright/test';

test('opens an episode and lists its characters in alphabetical order', async ({ page }) => {
  await page.goto('/pt-BR');

  await page.getByRole('link', { name: /Pilot/ }).click();

  await expect(page).toHaveURL(/\/pt-BR\/episodes\/1$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Pilot' })).toBeVisible();

  const names = await page.getByRole('img').evaluateAll((images) => images.map((img) => img.getAttribute('alt')));

  expect(names.length).toBeGreaterThan(1);
  expect(names).toEqual([...names].sort((a, b) => a!.localeCompare(b!)));
});

test('filters the characters by name without leaving the page', async ({ page }) => {
  await page.goto('/pt-BR/episodes/1');

  await page.getByRole('searchbox').fill('smith');

  await expect(page).toHaveURL(/\/pt-BR\/episodes\/1$/);
  await expect(page.getByRole('listitem').filter({ hasNotText: 'Smith' })).toHaveCount(0);
  await expect(page.getByRole('listitem').first()).toBeVisible();
});
