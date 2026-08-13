import { test, expect } from '@playwright/test';

test.describe('Public conseils area', () => {
  test('lists articles page is reachable', async ({ page }) => {
    await page.goto('/conseils');
    await expect(page.getByRole('heading', { name: /conseils|articles/i }).first()).toBeVisible();
    // search input
    await expect(page.getByPlaceholder(/rechercher/i)).toBeVisible();
  });

  test('renders 404-like state for unknown slug', async ({ page }) => {
    await page.goto('/conseils/this-slug-does-not-exist-xyz');
    await expect(page.getByText(/non trouvé|introuvable/i)).toBeVisible({ timeout: 15_000 });
  });
});
