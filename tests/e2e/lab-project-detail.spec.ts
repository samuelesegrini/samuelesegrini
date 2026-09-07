import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/it/progetti/easymanager-operazioni-ristorante/',
  '/en/projects/galaxy-trucker-java-project/',
  '/it/progetti/spingo-micromobilita-sostenibile/',
  '/en/projects/highway-route-planner/',
];

test('case studies retain their evidence and have a navigable reading structure', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('.case-detail h1')).toHaveCount(1);
    await expect(page.locator('.case-art img')).toHaveAttribute('alt', /.+/);
    const chapters = page.locator('.case-toc a');
    expect(await chapters.count()).toBeGreaterThan(2);
    for (const chapter of await chapters.all()) {
      const href = await chapter.getAttribute('href');
      await expect(page.locator(href!)).toHaveCount(1);
    }
    await expect(page.locator('.case-prose blockquote').first()).toBeVisible();
    const next = page.locator('.case-next-link');
    await expect(next).toHaveAttribute('href', new RegExp(`^/${route.includes('/it/') ? 'it/progetti' : 'en/projects'}/`));
    const sections = await page.locator('.case-detail [data-section]').evaluateAll(nodes => nodes.map(node => Number((node as HTMLElement).dataset.section)));
    expect(sections).toEqual(sections.map((_, index) => index));
    if (route.includes('easymanager')) {
      await expect(page.locator('.case-outcomes')).toContainText('31');
      await expect(page.locator('.outcome-method').first()).toBeVisible();
    }
    if (route.includes('galaxy')) await expect(page.locator('.case-prose')).toContainText('newGUI');
  }
});

test('detail pages reflow and remain accessible with motion disabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(routes[2]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('.case-prose')).toBeVisible();
    if (width === 390 || width === 1440) {
      const results = await new AxeBuilder({ page }).include('.case-detail').analyze();
      expect(results.violations).toEqual([]);
    }
  }
});

test('chapter navigation, motion control and client navigation survive a round trip', async ({ page }) => {
  await page.goto(routes[1]);
  const chapter = page.locator('.case-toc a').nth(1);
  await chapter.click();
  await expect(chapter).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('.shuffle-slot')).toHaveAttribute('aria-label', /The project/);
  const toggle = page.locator('.case-motion-toggle');
  await toggle.click();
  await expect(page.locator('.case-detail')).toHaveAttribute('data-motion', 'off');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.case-next-link').click();
  await expect(page.locator('.case-detail h1')).toHaveCount(1);
  await page.goBack();
  await expect(page.locator('.case-detail')).toHaveAttribute('data-ready', 'true');
});
