import { expect, test, type Page } from '@playwright/test';

import { attendiCaricato, vaiDalMenu } from './lab-chrome';

/**
 * La barra sopravvive alla navigazione, il mazzo delle carte no: viene rifatto a ogni pagina.
 * Le carte però portano `data-section` come le sezioni vere, e vivono dentro `.stage` insieme
 * alla barra. Cercando i bersagli dello scroll spy da `.stage` finivano fra loro anche le carte
 * lasciate dalla pagina precedente: essendo in fondo alla viewport superavano la linea di
 * lettura, e tornando su una pagina già vista l'indice restava fermo su una tappa che non
 * esisteva più, senza rispondere allo scorrimento.
 */

const lettura = (page: Page) =>
	page.evaluate(() => {
		const barra = document.querySelector<HTMLElement>('.toolbar-shell')!;
		return {
			y: Math.round(scrollY),
			modo: barra.dataset.mode,
			dettaglio: barra.querySelector('[data-detail] b')?.textContent,
		};
	});

test('la barra resta fuori dal foglio, così le sue carte non possono entrare fra i bersagli', async ({ page }) => {
	await page.goto('/it/');
	await attendiCaricato(page);
	await vaiDalMenu(page, 'Progetti');

	// Il foglio è il perimetro dello scroll spy. Basta che la barra ci finisca dentro perché
	// il mazzo torni fra i bersagli anche col selettore giusto: è quel confine a reggere tutto.
	const perimetro = await page.evaluate(() => ({
		carteFuoriDalFoglio: document.querySelectorAll('.toolbar-shell .shuffle-card').length,
		carteNelFoglio: document.querySelectorAll('.page-sheet .shuffle-card').length,
		bersagli: [...document.querySelectorAll('.page-sheet [data-section]')].map((nodo) => nodo.className),
	}));

	expect(perimetro.carteFuoriDalFoglio, 'il mazzo della pagina di prima è ancora nella barra').toBeGreaterThan(0);
	expect(perimetro.carteNelFoglio, 'ma il foglio non lo contiene').toBe(0);
	expect(perimetro.bersagli.length, 'le sezioni della pagina ci sono tutte').toBeGreaterThan(1);
	expect(
		perimetro.bersagli.some((classe) => classe.includes('shuffle-card')),
		'nessuna carta fra i bersagli',
	).toBe(false);
});

test('tornando su una pagina già vista l’indice riparte dalla hero e riprende a seguire lo scorrimento', async ({ page }) => {
	await page.goto('/it/');
	await attendiCaricato(page);

	await vaiDalMenu(page, 'Progetti');
	await page.evaluate(() => window.scrollTo(0, 1600));
	await expect.poll(() => lettura(page).then((stato) => stato.modo)).toBe('index');

	await vaiDalMenu(page, 'Home');
	await page.waitForTimeout(900);

	// si arriva in cima: la barra deve tornare alla modalità hero, non restare sull'indice
	// della pagina lasciata
	expect(await lettura(page)).toMatchObject({ y: 0, modo: 'hero' });

	// e lo scroll spy della pagina nuova risponde davvero
	await page.evaluate(() => window.scrollTo(0, 2600));
	await expect.poll(() => lettura(page).then((stato) => stato.modo)).toBe('index');

	const inFondo = await page.evaluate(() => {
		document.querySelector('#percorso')!.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
		return new Promise<string | null | undefined>((risolvi) =>
			setTimeout(() => risolvi(document.querySelector('.toolbar-shell [data-detail] b')?.textContent), 500),
		);
	});
	const primaTappa = await page.evaluate(
		() => document.querySelector('.toolbar-shell .shuffle-card[data-section="0"] b')?.textContent,
	);
	expect(inFondo, 'in fondo alla home il dettaglio non è più quello della prima tappa').not.toBe(primaTappa);
});
