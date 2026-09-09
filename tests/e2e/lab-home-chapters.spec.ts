import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['it', 'en']) {
  test(`homepage chapters remain accessible and contained: ${locale}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/${locale}/`);
      await page.waitForTimeout(1800);
      for (const id of ['scrittura', 'percorso']) {
        const section = page.locator(`#${id}`);
        await section.evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
        await expect(section.locator('h2')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        expect((await new AxeBuilder({ page }).include(`#${id}`).analyze()).violations).toEqual([]);
        for (const link of await section.locator('a').all()) {
          const href = await link.getAttribute('href');
          if (href?.startsWith('/')) expect(href).toMatch(new RegExp(`^/${locale}/`));
        }
      }
    }
  });
}

test('chapter content works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/it/');
  for (const id of ['scrittura', 'percorso']) {
    await expect(page.locator(`#${id} h2`)).toBeVisible();
    await expect(page.locator(`#${id} a`).first()).toHaveAttribute('href', /^(\/it\/|mailto:)/);
  }
  await context.close();
});
