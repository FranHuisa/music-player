import { test, expect } from '@playwright/test';
import { ADMIN, loginUI } from './helpers';

test.describe('Layouts scroll (Fran requirement)', () => {
  test('album list page is scrollable when content overflows', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/album');
    await page.waitForLoadState('networkidle');

    const layout = await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      return {
        bodyOverflow: getComputedStyle(body).overflow,
        htmlOverflow: getComputedStyle(html).overflow,
        scrollHeight: html.scrollHeight,
        clientHeight: html.clientHeight,
      };
    });
    const canScrollOrFits = layout.scrollHeight <= layout.clientHeight + 5 || layout.bodyOverflow !== 'hidden';
    expect(canScrollOrFits, `body overflow=${layout.bodyOverflow} html overflow=${layout.htmlOverflow}`).toBeTruthy();
  });

  test('song list does not have overflow:hidden trapping content', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/song');
    await page.waitForLoadState('networkidle');
    const offenders = await page.evaluate(() => {
      const wrappers = Array.from(document.querySelectorAll('main, .main-content, .jhi-main-content, body, html'));
      return wrappers
        .filter(w => {
          const cs = getComputedStyle(w);
          const tooTall = (w as HTMLElement).scrollHeight > (w as HTMLElement).clientHeight + 5;
          return tooTall && cs.overflow === 'hidden' && cs.overflowY === 'hidden';
        })
        .map(w => `${w.tagName}.${(w as HTMLElement).className}`);
    });
    expect(offenders, `Containers trapping overflow: ${offenders.join(', ')}`).toEqual([]);
  });

  test('home page renders without horizontal overflow', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const overflowsX = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5;
    });
    expect(overflowsX, 'horizontal scroll detected on home').toBeFalsy();
  });
});
