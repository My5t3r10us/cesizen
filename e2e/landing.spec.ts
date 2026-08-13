import { test, expect } from '@playwright/test';
import { acceptNecessaryCookies } from './helpers/cookie-consent';

test.describe('Landing page', () => {
  test('visitor can accept necessary cookies', async ({ page }) => {
    await page.goto('/');
    await acceptNecessaryCookies(page);

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('cesizen-cookie-consent')))
      .not.toBeNull();
  });

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
