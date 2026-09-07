import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('archive keeps all projects, localized routes and category navigation', async ({ page }) => {
  for (const route of ['/it/progetti/', '/en/projects/']) {
    await page.goto(route);
    await expect(page.locator('.work-archive h1')).toHaveCount(1);
    await expect(page.locator('.work-card-link')).toHaveCount(7);
    for (const link of await page.locator('.work-card-link').all()) {
      expect(await link.getAttribute('href')).toContain(route);
    }
    await page.locator('.work-jump a[href="#experiment"]').click();
    await expect(page.locator('.shuffle-slot')).toHaveAttribute('aria-label', /Esperimenti|Experiments/);
    await page.locator('.work-card-link').first().click();
    await expect(page.locator('.case-detail h1')).toBeVisible();
    await page.goBack();
    await expect(page.locator('.work-card-link')).toHaveCount(7);
  }
});

test('archive is readable and accessible at mobile and desktop sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/it/progetti/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('.work-card-link').first()).toBeVisible();
    if (width === 390 || width === 1440) expect((await new AxeBuilder({ page }).include('.work-archive').analyze()).violations).toEqual([]);
  }
});
