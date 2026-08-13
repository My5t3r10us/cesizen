import { test, expect } from '@playwright/test';

const uniqueEmail = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.com`;

test.describe('Journal flow', () => {
  test('user can navigate to journal page', async ({ page }) => {
    // Register fresh user
    await page.goto('/register');
    await page.getByLabel(/email/i).first().fill(uniqueEmail());
    await page.getByLabel(/^mot de passe \*/i).fill('Password123');
    await page.getByLabel(/confirmer/i).fill('Password123');
    await page.getByRole('button', { name: /s'inscrire/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Go to journal
    await page.goto('/dashboard/journal');
    await expect(page.getByRole('heading', { name: /journal/i })).toBeVisible();
  });

  test('statistics page is reachable when logged in', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/email/i).first().fill(uniqueEmail());
    await page.getByLabel(/^mot de passe \*/i).fill('Password123');
    await page.getByLabel(/confirmer/i).fill('Password123');
    await page.getByRole('button', { name: /s'inscrire/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/dashboard/statistiques');
    await expect(page.getByRole('heading', { name: /statistiques/i })).toBeVisible();
  });
});
