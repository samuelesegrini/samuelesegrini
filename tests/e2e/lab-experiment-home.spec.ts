import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** La home sperimentale mette il testo a sinistra e le voci a destra: qui si controlla che
 *  la griglia valga solo dove esiste davvero una colonna di testo, e che nulla finisca
 *  sotto la barra o fuori dallo schermo. */

const sezioni = ['inizio', 'progetti', 'scrittura', 'percorso'] as const;

const vaiA = async (page: import('@playwright/test').Page, id: string) => {
	await page.evaluate((s) => {
		document.querySelector(`#${s}`)!.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
	}, id);
	await page.waitForTimeout(600);
};

test('ogni sezione della home tiene la sua griglia e resta sopra la barra', async ({ page }) => {
	const errori: string[] = [];
	page.on('pageerror', (errore) => errori.push(String(errore.message)));
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/');
	await page.waitForTimeout(800);

	for (const id of sezioni) {
		await vaiA(page, id);
		const misura = await page.evaluate((s) => {
			const sezione = document.querySelector(`#${s}`)!;
			// due forme: le sezioni a due colonne (.sezione-testo + elenco) e quella dei
			// progetti, che è a tutta larghezza con le righe una sotto l'altra
			const testo = sezione.querySelector('.sezione-testo');
			const corpo = sezione.querySelector('.elenco, .tappe, .canali, .pila, .rotta, .chapter-channels');
			return {
				colonne: getComputedStyle(sezione).gridTemplateColumns.split(' ').length,
				accoppiati: Boolean(testo) === Boolean(corpo),
				affiancati:
					testo && corpo
						? Math.round(corpo.getBoundingClientRect().left) > Math.round(testo.getBoundingClientRect().right)
						: null,
			};
		}, id);

		// La barra è fissa in basso: quello che conta è che arrivando in fondo alla sezione
		// nessun pezzo le resti sotto. Le sezioni più alte di una schermata (i progetti) al
		// loro inizio hanno per forza contenuto oltre il bordo: non è lì che si misura.
		await page.evaluate((s) => {
			document.querySelector(`#${s}`)!.scrollIntoView({ block: 'end', behavior: 'instant' as ScrollBehavior });
		}, id);
		await page.waitForTimeout(400);
		const coperti = await page.evaluate((s) => {
			const sezione = document.querySelector(`#${s}`)!;
			const barra = document.querySelector('.toolbar-shell')!.getBoundingClientRect();
			// coperto davvero: si sovrappone al rettangolo della barra, non solo alla sua altezza
			return [...sezione.children]
				.map((figlio) => figlio.getBoundingClientRect())
				.filter(
					(riquadro) =>
						riquadro.height > 0 &&
						riquadro.bottom > barra.top + 6 &&
						riquadro.right > barra.left + 6 &&
						riquadro.left < barra.right - 6,
				).length;
		}, id);

		expect(misura.accoppiati, `${id}: colonna di testo e corpo vanno sempre insieme`).toBe(true);
		if (misura.affiancati === null) expect(misura.colonne, `${id}: resta a una colonna`).toBe(1);
		else expect(misura.affiancati, `${id}: le due colonne non si sovrappongono`).toBe(true);
		expect(coperti, `${id}: niente finisce sotto la barra`).toBe(0);
	}

	expect(errori).toEqual([]);
});

test('le altre pagine del laboratorio restano a una colonna', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	for (const rotta of ['/it/progetti/', '/it/chi-sono/', '/en/writing/']) {
		await page.goto(rotta);
		await page.waitForTimeout(600);
		const colonne = await page.evaluate(() =>
			[...document.querySelectorAll('.home-section')].map(
				(sezione) => getComputedStyle(sezione).gridTemplateColumns.split(' ').length,
			),
		);
		expect(colonne.every((n) => n === 1), rotta).toBe(true);
	}
});

test('sul telefono la home si impila senza scorrimento laterale', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/it/');
	await page.waitForTimeout(800);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

	for (const id of ['progetti', 'percorso']) {
		await vaiA(page, id);
		const misura = await page.evaluate((s) => {
			const sezione = document.querySelector(`#${s}`)!;
			const testo = sezione.querySelector('.sezione-testo, .projects-opening')!.getBoundingClientRect();
			const voci = [...sezione.querySelectorAll('.elenco li, .tappe li, .canali li, .pila li, .rotta li, .canali-mazzo li, .project-index > li')].map((voce) =>
				voce.getBoundingClientRect(),
			);
			return { fuori: voci.filter((riquadro) => riquadro.right > 390).length, impilato: voci[0].top > testo.top };
		}, id);
		expect(misura.fuori, `${id}: niente sborda dallo schermo`).toBe(0);
		expect(misura.impilato, `${id}: le voci stanno sotto il testo`).toBe(true);
	}
});

const selectedKeys = ['easymanager', 'galaxy-trucker', 'spingo-sustainable-micromobility'];

test('i tre progetti selezionati e l’archivio portano alle pagine nella stessa lingua', async ({ page }) => {
	for (const locale of ['it', 'en']) {
		await page.goto(`/${locale}/`);
		const links = page.locator('.project-link');
		await expect(links).toHaveCount(3);
		expect(await page.locator('.project-entry').evaluateAll((folios) => folios.map((folio) => (folio as HTMLElement).dataset.projectKey))).toEqual(selectedKeys);
		for (const link of await links.all()) {
			const href = await link.getAttribute('href');
			expect(href).toMatch(new RegExp(`^/${locale}/${locale === 'it' ? 'progetti' : 'projects'}/`));
			expect((await page.request.get(href!)).status()).toBe(200);
		}
		await expect(page.locator('.projects-archive')).toHaveAttribute('href', `/${locale}/${locale === 'it' ? 'progetti' : 'projects'}/`);
	}
});

test('l’indice e la superficie condivisa restano leggibili a ogni larghezza', async ({ page }) => {
	for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1040, height: 760 }, { width: 1280, height: 600 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
		await page.setViewportSize(viewport);
		await page.goto('/it/');
		await page.waitForTimeout(1200);
		await vaiA(page, 'progetti');
		const layout = await page.evaluate(() => {
			const visual = document.querySelector('.hero-media')!.getBoundingClientRect();
			const index = document.querySelector('.project-index')!.getBoundingClientRect();
			const titles = [...document.querySelectorAll('.project-link')].map((link) => link.getBoundingClientRect());
			return { width: document.documentElement.scrollWidth, sideBySide: visual.right < index.left, stacked: visual.bottom < index.top, titlesInside: titles.every((title) => title.left >= 0 && title.right <= innerWidth), sticky: getComputedStyle(document.querySelector('.vetrina')!).position };
		});
		expect(layout.width).toBeLessThanOrEqual(viewport.width);
		expect(layout.titlesInside).toBe(true);
		if (viewport.width <= 767) { expect(layout.stacked).toBe(true); expect(layout.sticky).toBe('relative'); }
		else expect(layout.sideBySide).toBe(true);
	}
});

test('l’accento del progetto selezionato riprende il colore della barra', async ({ page }) => {
	await page.goto('/it/');
	await page.locator('.project-link').first().focus();
	const colors = await page.evaluate(() => ({
		selected: getComputedStyle(document.querySelector('.project-entry')!).backgroundColor,
		toolbar: getComputedStyle(document.querySelector('.shuffle-card')!).backgroundColor,
	}));
	expect(colors.selected).toBe('rgb(255, 212, 184)');
	expect(colors.toolbar).toBe(colors.selected);
});

test('la navigazione da tastiera apre un progetto e il ritorno riattiva l’anteprima', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/');
	await page.waitForTimeout(1600);
	const first = page.locator('.project-link').first();
	await first.focus();
	await expect(first).toBeFocused();
	await expect(first).toHaveCSS('outline-style', 'solid');
	await first.press('Enter');
	await expect(page).toHaveURL(/easymanager-operazioni-ristorante/);
	await page.goBack();
	await expect(page.locator('.project-link')).toHaveCount(3);
	await page.locator('.project-link').nth(1).focus();
	await expect(page.locator('.project-gallery')).toHaveAttribute('data-active', '1');
	await page.locator('.project-link').nth(1).press('Enter');
	await expect(page).toHaveURL(/galaxy-trucker-progetto-java/);
});

test('movimento ridotto e assenza di JavaScript lasciano tutti i progetti leggibili', async ({ browser }) => {
	for (const javaScriptEnabled of [true, false]) {
		const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', javaScriptEnabled });
		const page = await context.newPage();
		await page.goto('/it/');
		const folios = page.locator('.project-entry');
		await expect(folios).toHaveCount(3);
		for (const folio of await folios.all()) {
			await expect(folio).toHaveCSS('position', 'relative');
			await expect(folio.locator('.project-link')).toHaveCSS('animation-name', 'none');
			await expect(folio.locator('h3')).toHaveCSS('animation-name', 'none');
			await expect(folio.locator('h3')).toBeVisible();
		}
		await context.close();
	}
});

test('l’anteprima condivisa segue scroll, puntatore e tastiera', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/it/');
	await page.waitForTimeout(1500);
	const gallery = page.locator('.project-gallery');
	await expect(page.locator('.exhibition-screen')).toHaveCount(1);
	await page.locator('.project-entry').nth(1).evaluate((entry) => entry.scrollIntoView({ block: 'center', behavior: 'instant' }));
	await expect(gallery).toHaveAttribute('data-active', '1');
	await page.locator('.project-entry').first().hover();
	await expect(gallery).toHaveAttribute('data-active', '0');
	await page.locator('.project-link').nth(2).focus();
	await expect(gallery).toHaveAttribute('data-active', '2');
	await expect(page.locator('[data-caption="2"]')).toHaveCSS('opacity', '1');
	await expect(page.locator('[data-scene="2"]')).toHaveCSS('clip-path', 'inset(0px)');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	expect(await page.locator('[data-scene="2"]').evaluate((node) => parseFloat(getComputedStyle(node).transitionDuration))).toBeLessThanOrEqual(0.001);
});

test('la nuova sezione non introduce violazioni di accessibilità', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const width of [1280, 390]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/it/');
		await vaiA(page, 'progetti');
		const result = await new AxeBuilder({ page }).include('.project-journey').analyze();
		expect(result.violations).toEqual([]);
	}
});
