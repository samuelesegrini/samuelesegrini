import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('archive keeps all projects, localized routes and the kind filter', async ({ page }) => {
  for (const route of ['/it/progetti/', '/en/projects/']) {
    await page.goto(route);
    await expect(page.locator('.work-archive h1')).toHaveCount(1);
    await expect(page.locator('.tavolo-link')).toHaveCount(5);
    for (const link of await page.locator('.tavolo-link').all()) {
      expect(await link.getAttribute('href')).toContain(route);
    }
    // la prima carta è in evidenza, il filtro parte da "tutti"
    await expect(page.locator('.tavolo-carta[data-featured]')).toHaveCount(1);
    await expect(page.locator('.tavolo-filtri button[data-kind="all"]')).toHaveAttribute('aria-pressed', 'true');

    const esperimenti = page.locator('.tavolo-filtri button[data-kind="experiment"]');
    await esperimenti.click();
    await expect(esperimenti).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.tavolo-carta:visible')).toHaveCount(1);
    await expect(page.locator('.tavolo-carta:visible')).toHaveAttribute('data-featured', '');
    await expect(page.locator('#tavolo-titolo sup')).toHaveText('01');
    expect(new URL(page.url()).hash).toBe('#experiment');

    await page.locator('.tavolo-filtri button[data-kind="app"]').click();
    await expect(page.locator('.tavolo-carta:visible')).toHaveCount(3);
    await expect(page.locator('.tavolo-carta[data-featured]')).toHaveAttribute('data-kind', 'app');

    await page.locator('.tavolo-filtri button[data-kind="all"]').click();
    await expect(page.locator('.tavolo-carta:visible')).toHaveCount(5);
    expect(new URL(page.url()).hash).toBe('');

    await page.locator('.tavolo-link').first().click();
    await expect(page.locator('.case-detail h1')).toBeVisible();
    await page.goBack();
    await expect(page.locator('.tavolo-link')).toHaveCount(5);
  }
});

test('a #kind address opens the table already filtered', async ({ page }) => {
  await page.goto('/it/progetti/#package');
  await expect(page.locator('.tavolo-filtri button[data-kind="package"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.tavolo-carta:visible')).toHaveCount(1);
  await expect(page.locator('.tavolo-carta[data-featured]')).toHaveAttribute('data-kind', 'package');
});

test('archive is readable and accessible at mobile and desktop sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/it/progetti/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('.tavolo-link').first()).toBeVisible();
    if (width === 390 || width === 1440) expect((await new AxeBuilder({ page }).include('.work-archive').analyze()).violations).toEqual([]);
  }
});
