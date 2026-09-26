import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Il sipario si vede una volta per sessione: alle visite successive non c'è niente da aspettare.
const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });

// Le anteprime dei racconti di progetto, una per progetto: i capitoli indicizzati nel dock, in
// ordine, e le sezioni che ciascun racconto usa. Le brevi (relazione tecnica) aprono con DocHero.
const previews = [
	{ key: 'easymanager', chapters: 8, blocks: ['.st-ahero', '.st-statement', '.st-objects-row', '.st-lit', '.st-intro', '.st-plus-grid', '.st-hgallery', '.st-fx', '.st-mcards', '.st-findings', '.st-stats', '.st-lockup', '.st-thennow', '.st-states', '.st-scenes', '.st-exploded', '.st-decl', '.st-principles', '.st-limits2', '.st-techspecs', '.st-changelog', '.st-sources', '.st-faq2', '.st-keep'] },
	{ key: 'galaxy-trucker', chapters: 7, blocks: ['.st-ahero', '.st-statement', '.st-objects-row', '.st-lit', '.st-intro', '.st-hgallery', '.st-fx', '.st-mcards', '.st-lockup', '.st-scenes', '.st-exploded', '.st-findings', '.st-stats', '.st-thennow', '.st-states', '.st-principles', '.st-limits2', '.st-techspecs', '.st-faq2', '.st-keep'] },
	{ key: 'spingo', chapters: 7, blocks: ['.st-ahero', '.st-statement', '.st-objects-row', '.st-lit', '.st-intro', '.st-hgallery', '.st-fx', '.st-anatomy-subject', '.st-stats', '.st-findings', '.st-principles', '.st-limits2', '.st-techspecs', '.st-faq2', '.st-keep'] },
	{ key: 'highway-route-planner', chapters: 5, blocks: ['.st-statement', '.st-techspecs', '.st-keep'] },
	{ key: 'priority-task-queue-manager', chapters: 5, blocks: ['.st-statement', '.st-toggle', '.st-states', '.st-ba', '.st-techspecs', '.st-keep'] },
];

for (const preview of previews) {
	test(`the ${preview.key} preview renders its chapters and stays out of search`, async ({ page }) => {
		await page.goto(`/en/preview/${preview.key}/`);
		await arriva(page);
		for (const block of preview.blocks) await expect(page.locator(`.st-page ${block}`).first(), block).toBeAttached();
		const sections = await page.locator('.page-sheet [data-section]').evaluateAll((nodes) => nodes.map((node) => Number((node as HTMLElement).dataset.section)));
		expect(sections).toEqual(Array.from({ length: preview.chapters + 1 }, (_, k) => k));
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
		// la fila gira: ogni anteprima porta alla successiva e alla precedente
		await expect(page.locator('.st-keep a[href*="/en/preview/"]')).toHaveCount(2);
	});
}

test('the preview index lists every project and links to each', async ({ page }) => {
	await page.goto('/en/preview/');
	await arriva(page);
	for (const key of ['poliverse', ...previews.map((p) => p.key)]) await expect(page.locator(`a[href$="/en/preview/${key}/"]`)).toHaveCount(1);
});

test('the previews pass an accessibility scan', async ({ page }) => {
	test.setTimeout(120_000);
	// senza movimento, come le altre scansioni: a metà entrata la didascalia di DocHero è ancora
	// trasparente e axe misura un contrasto che a pagina ferma non c'è
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const preview of previews) {
		await page.goto(`/en/preview/${preview.key}/`);
		await arriva(page);
		const results = await new AxeBuilder({ page }).include('.st-page').analyze();
		expect(results.violations.map((v) => `${preview.key}: ${v.id} (${v.nodes.length})`)).toEqual([]);
	}
});
