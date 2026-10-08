import { expect, test } from '@playwright/test';

test('lists episodes grouped by season', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/pt-BR$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Episódios' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Temporada 1' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Pilot/ })).toBeVisible();
});

test('navigates to the next page', async ({ page }) => {
  await page.goto('/pt-BR');

  await page.getByRole('link', { name: 'Próxima' }).click();

  await expect(page).toHaveURL(/page=2$/);
  await expect(page.getByText('Página 2 de 3')).toBeVisible();
  await expect(page.getByRole('link', { name: /Pilot/ })).toHaveCount(0);
});
