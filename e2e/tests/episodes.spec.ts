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
  await expect(page.getByText(/Página 2 de \d+/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Pilot/ })).toHaveCount(0);
});

test('searches while typing and restores the list when cleared', async ({ page }) => {
  await page.goto('/pt-BR');
  const search = page.getByRole('searchbox');

  await search.fill('pilot');

  await expect(page).toHaveURL(/q=pilot$/);
  await expect(page.getByRole('link', { name: /Pilot/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Lawnmower Dog/ })).toHaveCount(0);
  await expect(search).toBeFocused();

  await search.fill('');

  await expect(page).toHaveURL(/\/pt-BR$/);
  await expect(page.getByRole('link', { name: /Lawnmower Dog/ })).toBeVisible();
});

test('shows the translated not found page for an unknown episode', async ({ page }) => {
  await page.goto('/pt-BR/episodes/99999');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Página não encontrada' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ir para os episódios' })).toBeVisible();
});

test('does not fetch episode details just by showing the list', async ({ page }) => {
  const detailRequests: string[] = [];
  page.on('request', (request) => {
    if (/\/episodes\/\d+/.test(request.url())) detailRequests.push(request.url());
  });

  await page.goto('/pt-BR?page=2');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  expect(detailRequests).toEqual([]);
});
