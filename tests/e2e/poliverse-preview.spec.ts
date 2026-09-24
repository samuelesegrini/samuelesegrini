import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Il sipario si vede una volta per sessione: alle visite successive non c'è niente da aspettare.
const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });

// Il racconto di PoliVerse, costruito con le sezioni della seconda serie e le icone vere dell'app.
const route = '/en/preview/poliverse/';

test('the PoliVerse story renders every chapter and indexes them in the dock', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	for (const block of ['.st-ahero', '.st-intro', '.st-hgallery', '.st-lit', '.st-shot', '.st-bento', '.st-bars', '.st-ba', '.st-toggle', '.st-stats', '.st-changelog', '.st-lockup', '.st-thennow', '.st-findings', '.st-scenes', '.st-states', '.st-exploded', '.st-decl', '.st-principles', '.st-limits2', '.st-techspecs', '.st-sources', '.st-faq2', '.st-keep', '.st-index']) {
		await expect(page.locator(`.st-page ${block}`).first(), block).toBeAttached();
	}
	const sections = await page.locator('.page-sheet [data-section]').evaluateAll((nodes) => nodes.map((node) => Number((node as HTMLElement).dataset.section)));
	expect(sections).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

	// le cifre in apice portano alle note delle fonti
	const notes = page.locator('.st-stats-method sup a');
	await expect(notes).toHaveCount(4);
	for (const note of await notes.all()) await expect(page.locator((await note.getAttribute('href'))!)).toHaveCount(1);
});

test('every icon on the page is a file the site serves', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	const sources = await page.locator('.st-page img[src*="/poliverse/icons/"]').evaluateAll((imgs) => [...new Set(imgs.map((img) => (img as HTMLImageElement).src))]);
	expect(sources).toHaveLength(39);
	for (const src of sources) expect((await page.request.get(src)).status(), src).toBe(200);
});

test('the icon shapes switch without script', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	const toggle = page.locator('.st-toggle');
	await expect(toggle.locator('[data-tf-panel="0"] li')).toHaveCount(4);
	await toggle.getByText('Special', { exact: true }).click();
	await expect(toggle.getByRole('radio', { name: 'Special' })).toBeChecked();
	await expect(toggle.locator('.st-toggle-panel[data-tf-panel="3"]')).toBeVisible();
	await expect(toggle.locator('.st-toggle-panel[data-tf-panel="0"]')).toBeHidden();
	await expect(toggle.locator('[data-tf-panel="3"] li')).toHaveCount(11);
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
