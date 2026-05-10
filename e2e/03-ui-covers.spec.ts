import { test, expect } from '@playwright/test';
import { ADMIN, loginUI } from './helpers';

test.describe('UI: covers + scroll (Fran requirements)', () => {
  test('home loads without uncaught JS errors', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', e => jsErrors.push(e.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(jsErrors, `Uncaught JS errors on home: ${jsErrors.join(' | ')}`).toEqual([]);
  });

  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('admin can login and reach albums list', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/album');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /álbumes/i })).toBeVisible();
  });

  test('album list shows cover images (no broken)', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/album');
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => img.complete && img.naturalWidth === 0).map(img => img.src);
    });
    expect(broken, `Broken images on album list: ${broken.join(', ')}`).toEqual([]);
  });

  test('song list shows cover images (no broken)', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/song');
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => img.complete && img.naturalWidth === 0).map(img => img.src);
    });
    expect(broken, `Broken images on song list: ${broken.join(', ')}`).toEqual([]);
  });

  test('artist list shows cover images', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/artist');
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => img.complete && img.naturalWidth === 0).map(img => img.src);
    });
    expect(broken, `Broken artist images: ${broken.join(', ')}`).toEqual([]);
  });
});
