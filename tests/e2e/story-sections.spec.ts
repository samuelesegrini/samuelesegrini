import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Il sipario si vede una volta per sessione: alle visite successive non c'è niente da aspettare.
const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });

// Le due pagine che montano la prima serie di sezioni. Il grigio di <Statement> è testo grande:
// sulla carta gli basta 3:1, ma sotto non deve scendere.
const routes = ['/en/preview/sections/', '/en/preview/easymanager/'];

for (const route of routes) {
	test(`the first series keeps its text readable on ${route}`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		for (const width of [390, 1440]) {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(route);
			await arriva(page);
			await expect(page.locator('.st-page .st-statement')).toBeVisible();
			const results = await new AxeBuilder({ page }).include('.st-page').withRules(['color-contrast']).analyze();
			expect(results.violations, `contrast at ${width}`).toEqual([]);
		}
	});
}
