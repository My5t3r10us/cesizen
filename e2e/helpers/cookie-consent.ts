import { expect, type Page } from '@playwright/test';

export async function acceptNecessaryCookies(page: Page) {
  const necessaryCookies = page.getByRole('checkbox', {
    name: /j'accepte les cookies obligatoires/i,
  });

  await expect(necessaryCookies).toBeVisible();
  await necessaryCookies.check();
  await page.getByRole('button', { name: /enregistrer mon choix/i }).click();
  await expect(necessaryCookies).toBeHidden();
}
