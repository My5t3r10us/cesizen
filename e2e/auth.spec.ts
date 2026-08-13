import { test, expect } from '@playwright/test';

const uniqueEmail = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.com`;

test.describe('Auth flow', () => {
  test('register → land on dashboard', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/email/i).first().fill(uniqueEmail());
    await page.getByLabel(/^mot de passe \*/i).fill('Password123');
    await page.getByLabel(/confirmer/i).fill('Password123');
    await page.getByRole('button', { name: /s'inscrire/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('login error shown for bad credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('nobody@test.com');
    await page.getByLabel(/mot de passe/i).fill('WrongPass1');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await expect(page.getByText(/incorrect|erreur/i).first()).toBeVisible();
  });

  test('logout redirects to home', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto('/register');
    await page.getByLabel(/email/i).first().fill(email);
    await page.getByLabel(/^mot de passe \*/i).fill('Password123');
    await page.getByLabel(/confirmer/i).fill('Password123');
    await page.getByRole('button', { name: /s'inscrire/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Open avatar dropdown then logout
    await page.getByTestId('user-menu-trigger').click();
    await page.getByRole('menuitem', { name: /déconnexion/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
