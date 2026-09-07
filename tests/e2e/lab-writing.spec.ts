import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('writing archive and reader navigate in both languages', async ({ page }) => {
  for (const route of ['/lab/it/articoli/', '/lab/en/writing/']) {
    await page.goto(route);
    await expect(page.locator('.writing-entry')).toHaveCount(4);
    const urls = await page.locator('.writing-entry-link').evaluateAll(links => links.map(a => a.getAttribute('href')));
    expect(new Set(urls).size).toBe(4);
    await page.locator('.writing-entry-link').first().click();
    await expect(page.locator('.post-detail h1')).toHaveCount(1);
    await expect(page.locator('.post-detail')).toHaveAttribute('data-ready', 'true');
    expect(await page.locator('.post-detail h1').evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeLessThanOrEqual(94);
    const chapter = page.locator('.case-toc a').last();
    await chapter.click();
    await expect(chapter).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('.shuffle-slot')).toHaveAttribute('aria-label', /Lettura|Reading/);
    await page.locator('.case-next-link').click();
    await expect(page.locator('.post-detail')).toHaveAttribute('data-ready', 'true');
    await page.goBack();
    await expect(page.locator('.case-prose')).toBeVisible();
  }
});

test('archive and long article reflow with accessible reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/lab/it/articoli/', '/lab/it/articoli/ricostruire-galaxy-trucker-con-claude/']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(page.locator('main h1')).toHaveCount(1);
      if (width !== 320) expect((await new AxeBuilder({ page }).include(route.endsWith('/articoli/') ? '.writing-archive' : '.post-detail').analyze()).violations).toEqual([]);
    }
  }
});
