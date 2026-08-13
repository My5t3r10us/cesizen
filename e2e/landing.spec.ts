import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders hero and CTAs for guests', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Prenez soin de/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /se connecter/i }).first()).toBeVisible();
  });

  test('redirects unauthenticated user from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects unauthenticated user from /admin to /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
