import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Il sipario si vede una volta per sessione: alle visite successive non c'è niente da aspettare.
const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });

// Le anteprime dei racconti di progetto, una per progetto: i capitoli indicizzati nel dock, in
// ordine, e le sezioni che ciascun racconto usa. Le brevi (relazione tecnica) aprono con DocHero.
const previews = [
	{ key: 'easymanager', chapters: 6, blocks: ['.st-mhero-art', '.st-scenes', '.st-anatomy-subject', '.st-lockup', '.st-cs-paper', '.st-decl', '.st-plus-grid', '.st-bento', '.st-states', '.st-changelog', '.st-limits2', '.st-faq2', '.st-keep', '.st-index'] },
	{ key: 'galaxy-trucker', chapters: 6, blocks: ['.st-mhero-art', '.st-lockup', '.st-explainer', '.st-modules', '.st-techspecs', '.st-toggle', '.st-timeline', '.st-limits2', '.st-cards', '.st-faq2', '.st-keep'] },
	{ key: 'spingo', chapters: 6, blocks: ['.st-ahero', '.st-timeline', '.st-mcards', '.st-stats', '.st-findings', '.st-ba', '.st-sources', '.st-faq2', '.st-keep'] },
	{ key: 'highway-route-planner', chapters: 5, blocks: ['.st-dhero', '.st-layers', '.st-explainer', '.st-numbers', '.st-techspecs', '.st-keep'] },
	{ key: 'priority-task-queue-manager', chapters: 4, blocks: ['.st-toggle', '.st-states', '.st-ba', '.st-techspecs', '.st-ts-map', '.st-keep'] },
];

// Le due lingue: /en/preview/ e il gemello italiano /it/anteprima/, stesse sezioni e stessi capitoli.
const langs = [
	{ lang: 'en', root: '/en/preview/', other: '/it/anteprima/' },
	{ lang: 'it', root: '/it/anteprima/', other: '/en/preview/' },
] as const;

for (const { lang, root, other } of langs) {
	for (const preview of previews) {
		test(`the ${preview.key} preview (${lang}) renders its chapters and stays out of search`, async ({ page }) => {
			await page.goto(`${root}${preview.key}/`);
			await arriva(page);
			await expect(page.locator('html')).toHaveAttribute('lang', lang);
			for (const block of preview.blocks) await expect(page.locator(`.st-page ${block}`).first(), block).toBeAttached();
			const sections = await page.locator('.page-sheet [data-section]').evaluateAll((nodes) => nodes.map((node) => Number((node as HTMLElement).dataset.section)));
			expect(sections).toEqual(Array.from({ length: preview.chapters + 1 }, (_, k) => k));
			await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
			// la fila gira: ogni anteprima porta alla successiva, alla precedente e all'indice, nella stessa lingua
			await expect(page.locator(`.st-keep a[href*="${root}"]`)).toHaveCount(3);
			// e il cambio di lingua porta al gemello
			await expect(page.locator(`a[href$="${other}${preview.key}/"]`).first()).toBeAttached();
		});
	}

	test(`the preview index (${lang}) lists every project and links to each`, async ({ page }) => {
		await page.goto(root);
		await arriva(page);
		for (const key of ['poliverse', ...previews.map((p) => p.key)]) await expect(page.locator(`.st-page a[href$="${root}${key}/"]`)).toHaveCount(1);
	});

	test(`the previews (${lang}) pass an accessibility scan`, async ({ page }) => {
		test.setTimeout(120_000);
		// senza movimento, come le altre scansioni: a metà entrata la didascalia di DocHero è ancora
		// trasparente e axe misura un contrasto che a pagina ferma non c'è
		await page.emulateMedia({ reducedMotion: 'reduce' });
		for (const preview of previews) {
			await page.goto(`${root}${preview.key}/`);
			await arriva(page);
			const results = await new AxeBuilder({ page }).include('.st-page').analyze();
			expect(results.violations.map((v) => `${preview.key}: ${v.id} (${v.nodes.length})`)).toEqual([]);
		}
	});
}
