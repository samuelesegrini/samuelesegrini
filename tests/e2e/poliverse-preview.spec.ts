import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Il sipario si vede una volta per sessione: alle visite successive non c'è niente da aspettare.
const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });

// Il racconto di PoliVerse, costruito con le sezioni della seconda serie e le icone vere dell'app.
const route = '/en/preview/poliverse/';

test('the PoliVerse story renders every chapter and indexes them in the dock', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	for (const block of ['.st-ahero', '.st-ahero-shot .st-shot', '.st-intro', '.st-statement', '.st-objects-row', '.st-hgallery', '.st-plus-grid', '.st-lit', '.st-fx', '.st-mcards', '.st-bento', '.st-ba', '.st-toggle', '.st-stats', '.st-changelog', '.st-lockup', '.st-thennow', '.st-findings', '.st-scenes', '.st-states', '.st-exploded', '.st-decl', '.st-principles', '.st-limits2', '.st-techspecs', '.st-sources', '.st-faq2', '.st-keep', '.st-index']) {
		await expect(page.locator(`.st-page ${block}`).first(), block).toBeAttached();
	}
	const sections = await page.locator('.page-sheet [data-section]').evaluateAll((nodes) => nodes.map((node) => Number((node as HTMLElement).dataset.section)));
	expect(sections).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

	// le cifre in apice portano alle note delle fonti
	const notes = page.locator('.st-stats-method sup a');
	await expect(notes).toHaveCount(4);
	for (const note of await notes.all()) await expect(page.locator((await note.getAttribute('href'))!)).toHaveCount(1);
});

test('every highlight shows its picture', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	// la galleria legge gli slot media-1, media-2…: un nome sbagliato lascia la carta senza disegno
	await expect(page.locator('.st-hg-card')).toHaveCount(4);
	await expect(page.locator('.st-hg-card > .st-hg-media')).toHaveCount(4);
});

test('the small things each show a piece of the app, and say it in one sentence', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	const cards = page.locator('.st-mcards .st-mc-track > li');
	await expect(cards).toHaveCount(6);
	await expect(page.locator('.st-mcards .st-mc-media > .pv-mini')).toHaveCount(6);
	for (const card of await cards.all()) await expect(card.locator('p > b')).not.toBeEmpty();
	// la nota dice il limite com'è: le aule libere si ricavano dalle lezioni prenotate
	await expect(page.locator('.st-mcards .st-mc-note')).toHaveText('Worked out from booked lessons: an open room can still be locked.');
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

// Il gemello italiano: stessi capitoli, testo italiano, e le due pagine si indicano a vicenda.
const rotta = '/it/anteprima/poliverse/';

test('il racconto di PoliVerse in italiano ha gli stessi capitoli e rimanda al gemello inglese', async ({ page }) => {
	await page.goto(rotta);
	await arriva(page);
	await expect(page.locator('html')).toHaveAttribute('lang', 'it');
	await expect(page.locator('#why .st-statement')).toContainText('sei posti');
	const sections = await page.locator('.page-sheet [data-section]').evaluateAll((nodes) => nodes.map((node) => Number((node as HTMLElement).dataset.section)));
	expect(sections).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
	await expect(page.locator('.st-hg-card')).toHaveCount(4);
	await expect(page.locator('.st-hg-dots')).toHaveAttribute('aria-label', 'Scegli un punto forte');
	await expect(page.locator('.st-plus-open').first()).toHaveAttribute('aria-label', /^Di più su: /);
	await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en\/preview\/poliverse\/$/);

	await page.goto(route);
	await arriva(page);
	await expect(page.locator('link[rel="alternate"][hreflang="it"]')).toHaveAttribute('href', /\/it\/anteprima\/poliverse\/$/);
});

test('il racconto in italiano non scorre di lato e resta accessibile', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const width of [390, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(rotta);
		await arriva(page);
		expect(await page.evaluate(() => document.documentElement.scrollWidth), `overflow at ${width}`).toBeLessThanOrEqual(width);
		const results = await new AxeBuilder({ page }).include('.st-page').analyze();
		expect(results.violations).toEqual([]);
	}
});
