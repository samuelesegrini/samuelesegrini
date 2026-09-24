import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Il sipario si vede una volta per sessione: alle visite successive non c'è niente da aspettare.
const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });

// Il racconto di PoliVerse, costruito con le sezioni della seconda serie.
const route = '/en/preview/poliverse/';

test('the PoliVerse story renders every chapter and indexes them in the dock', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	for (const block of ['.st-ahero', '.st-hgallery', '.st-fx', '.st-stats', '.st-lockup', '.st-csteps', '.st-states', '.st-exploded', '.st-decl', '.st-techspecs', '.st-limits2', '.st-faq2', '.st-keep', '.st-index']) {
		await expect(page.locator(`.st-page ${block}`).first(), block).toBeAttached();
	}
	const sections = await page.locator('.page-sheet [data-section]').evaluateAll((nodes) => nodes.map((node) => Number((node as HTMLElement).dataset.section)));
	expect(sections).toEqual([0, 1, 2, 3, 4, 5, 6]);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('the PoliVerse story reflows without horizontal scroll and stays accessible', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const width of [390, 768, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(route);
		await arriva(page);
		expect(await page.evaluate(() => document.documentElement.scrollWidth), `overflow at ${width}`).toBeLessThanOrEqual(width);
		if (width !== 768) {
			const results = await new AxeBuilder({ page }).include('.st-page').analyze();
			expect(results.violations).toEqual([]);
		}
	}
});
