import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Il sipario si vede una volta per sessione: alle visite successive non c'è niente da aspettare.
const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });

// Il racconto di PoliVerse, costruito con le sezioni della seconda serie e le icone vere dell'app.
const route = '/en/preview/poliverse/';

test('the PoliVerse story renders every chapter and indexes them in the dock', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	for (const block of ['.st-ahero', '.st-ahero-shot .st-shot', '.st-intro', '.st-statement', '.st-objects-row', '.st-hgallery', '.st-lit', '.st-fx', '.st-mcards', '.st-ba', '.st-stats', '.st-changelog', '.st-lockup', '.st-thennow', '.st-findings', '.st-scenes', '.st-states', '.st-exploded', '.st-principles', '.st-limits2', '.st-techspecs', '.st-sources', '.st-faq2', '.st-keep']) {
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

test('the dock shows at most five squares, and the row slides to keep the chapter in view', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	const index = page.locator('.toolbar-shell .shuffle-index');
	const strip = index.locator('.shuffle-strip');
	// una fila sola sopra il mazzo, un quadratino per capitolo, ma una finestra di cinque
	await expect(page.locator('.toolbar-shell .shuffle-index')).toHaveCount(1);
	const squares = await strip.locator('i').count();
	expect(squares).toBeGreaterThan(5);
	const box = await index.evaluate((el) => el.clientHeight - parseFloat(getComputedStyle(el).paddingTop) * 2);
	const step = await strip.evaluate((el) => (el.children[1] as HTMLElement).offsetTop - (el.children[0] as HTMLElement).offsetTop);
	expect(Math.floor((box + step) / step)).toBe(5);
	const sections = await page.$$eval('.page-sheet [data-section]', (els) => els.map((el) => el.getBoundingClientRect().top + scrollY));
	const at = async (k: number) => {
		await page.evaluate((y) => scrollTo(0, y), sections[k] - 100);
		await expect(strip.locator('i').nth(k - 1)).toHaveClass(/\bon\b/);
		return strip.evaluate((el) => el.style.getPropertyValue('--shift'));
	};
	// all'inizio la finestra è ferma, poi scorre con il capitolo acceso nel mezzo, e in fondo si ferma sull'ultimo
	expect(await at(1)).toBe('0');
	expect(await at(5)).toBe('2');
	expect(await at(sections.length - 1)).toBe(String(squares - 5));
	// i quadratini sul bordo con altri capitoli oltre si fanno piccoli
	await at(5);
	await expect(strip.locator('i.edge')).toHaveCount(2);
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
	await expect(page.locator('.st-mcards .st-mc-media > :is(.pv-mini, .pv-mc)')).toHaveCount(6);
	for (const card of await cards.all()) await expect(card.locator('p > b')).not.toBeEmpty();
	// la nota dice il limite com'è: le aule libere si ricavano dalle lezioni prenotate
	await expect(page.locator('.st-mcards .st-mc-note')).toHaveText('Worked out from booked lessons: an open room can still be locked.');
});

test('every icon on the page is a file the site serves', async ({ page }) => {
	await page.goto(route);
	await arriva(page);
	const sources = await page.locator('.st-page img[src*="/poliverse/icons/"]').evaluateAll((imgs) => [...new Set(imgs.map((img) => (img as HTMLImageElement).src))]);
	expect(sources).toHaveLength(36);
	for (const src of sources) expect((await page.request.get(src)).status(), src).toBe(200);
});

// Ogni cosa detta una volta: quello che la pagina ha tolto perché già detto altrove non torna, e
// quello che è rimasto non si contraddice. Stesso controllo sulle due pagine.
for (const [lang, path, agenda, history] of [['en', '/en/preview/poliverse/', 'which answers 404 for now', 'The full history, commit by commit'], ['it', '/it/anteprima/poliverse/', 'che per ora risponde 404', 'Tutta la storia, commit per commit']] as const) {
	test(`each thing is told once, and nothing contradicts itself (${lang})`, async ({ page }) => {
		await page.goto(path);
		await arriva(page);
		// il bento (già nell'apertura), le forme dell'icona (già nella terza carta), lo Store (l'offline
		// detto per la quarta volta) e l'indice in fondo (già nella barra) non ci sono più
		for (const gone of ['.st-bento', '.st-toggle', '.st-decl', '.st-index', '.st-principles-example']) await expect(page.locator(`.st-page ${gone}`), gone).toHaveCount(0);
		// l'orario dice lo stesso nei due posti: spostato, e per ora 404
		await expect(page.locator('.st-thennow')).toContainText(agenda);
		// giorno per giorno: gli ultimi cinque giorni, e tutta la storia nel repo
		await expect(page.locator('.st-changelog-list > li')).toHaveCount(5);
		await expect(page.getByRole('link', { name: history })).toHaveAttribute('href', /\/commits\/main$/);
		// perché non scrive mai: il collegamento passa dall'indice alle regole
		await expect(page.locator('#decisions a[href$="writes-to-university-systems.md"]')).toHaveCount(1);
	});

	test(`the sign-in screens are filled, and the note stays clear of the steps (${lang})`, async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto(path);
		await arriva(page);
		const phones = page.locator('#cie .pv-phone');
		await expect(phones).toHaveCount(4);
		// ogni schermo usa la sua altezza: l'ultimo pezzo arriva nella metà bassa del telefono
		for (const phone of await phones.all()) {
			const used = await phone.evaluate((el) => {
				const box = el.getBoundingClientRect();
				const bottom = Math.max(...[...el.children].map((c) => c.getBoundingClientRect().bottom));
				return (bottom - box.top) / box.height;
			});
			expect(used).toBeGreaterThan(0.6);
		}
		// la nota sta sotto tutta la parte fissata: nel flusso, a metà, il palco fermo le passava sopra
		// e il testo delle scene la copriva
		const scenes = (await page.locator('#cie .st-scenes').boundingBox())!;
		const note = (await page.locator('#cie .st-scenes-note').boundingBox())!;
		expect(note.y).toBeGreaterThanOrEqual(scenes.y + scenes.height - 1);
	});
}

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
