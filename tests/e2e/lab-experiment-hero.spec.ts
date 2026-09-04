import { expect, test } from '@playwright/test';

/** La hero si muove con lo scroll: il riquadro affonda e cresce, le due metà del marchio
 *  si allontanano, i testi di contorno sfumano. Tutto in CSS, quindi qui si misurano le
 *  proprietà calcolate a scroll fermo invece di inseguire i fotogrammi. */

const stato = (page: import('@playwright/test').Page) =>
	page.evaluate(() => {
		const leggi = (selettore: string) => {
			const stile = getComputedStyle(document.querySelector(selettore)!);
			return { translate: stile.translate, scale: stile.scale, opacity: Number(stile.opacity), nome: stile.animationName };
		};
		return {
			media: leggi('.hero-media'),
			sinistra: leggi('.hero-marchio > .mascherina:nth-child(1)'),
			destra: leggi('.hero-marchio > .mascherina:nth-child(2)'),
			meta: leggi('.hero-meta'),
			larghezza: document.documentElement.scrollWidth,
		};
	});

const scorriA = async (page: import('@playwright/test').Page, y: number) => {
	await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' as ScrollBehavior }), y);
	await page.waitForTimeout(350);
};

test('scorrendo, la hero si apre e si allontana', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1800);

	const fermo = await stato(page);
	expect(Number.parseFloat(fermo.media.scale), 'da ferma il riquadro è piccolo').toBeCloseTo(0.35, 2);
	expect(fermo.meta.opacity).toBe(1);

	await scorriA(page, 400);
	const mosso = await stato(page);
	const orizzontale = (valore: string) => Number.parseFloat(valore.split(' ')[0]);

	expect(orizzontale(mosso.sinistra.translate), 'la metà sinistra va a sinistra').toBeLessThan(-20);
	expect(orizzontale(mosso.destra.translate), 'la destra va a destra').toBeGreaterThan(20);
	expect(Number.parseFloat(mosso.media.scale), 'il riquadro cresce').toBeGreaterThan(0.6);
	expect(mosso.media.translate, 'e scende verso la sua schermata').not.toBe(fermo.media.translate);
	expect(mosso.meta.opacity, 'i dati in alto sfumano').toBeLessThan(0.5);
	expect(mosso.larghezza, 'la deriva non crea scorrimento laterale').toBeLessThanOrEqual(1280);

	await scorriA(page, 800);
	const arrivato = await stato(page);
	expect(Number.parseFloat(arrivato.media.scale), 'arriva a grandezza naturale').toBeCloseTo(1, 2);
	expect(arrivato.media.translate, 'e al suo posto').toBe('0px');
});

test('il riquadro non conta come sezione della barra', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1500);
	// la barra si orienta con i data-section, e il riquadro non deve averne uno
	const conteggio = await page.evaluate(() => ({
		numeri: [...document.querySelectorAll('.home-section')].map((s) => (s as HTMLElement).dataset.section),
		voci: JSON.parse(document.querySelector('#lab-sections')!.textContent!).length,
		vetrinaSezione: document.querySelector('.vetrina')!.classList.contains('home-section'),
		vetrinaNumero: (document.querySelector('.vetrina') as HTMLElement).dataset.section,
	}));
	expect(conteggio.numeri, 'le sezioni restano numerate di fila').toEqual(['0', '1', '2', '3', '4']);
	expect(conteggio.numeri.length - 1, 'una voce di indice per ogni sezione dopo la hero').toBe(conteggio.voci);
	expect(conteggio.vetrinaSezione, 'il riquadro non è una sezione').toBe(false);
	expect(conteggio.vetrinaNumero, 'e non ha un numero').toBeUndefined();
});

test('con movimento ridotto la hero resta immobile', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1200);
	await scorriA(page, 400);

	const fermo = await stato(page);
	for (const [nome, pezzo] of Object.entries(fermo)) {
		if (nome === 'larghezza') continue;
		const parte = pezzo as { translate: string; scale: string; opacity: number; nome: string };
		expect(parte.nome, `${nome}: nessuna animazione`).toBe('none');
		expect(parte.translate, `${nome}: fermo`).toBe('none');
		expect(parte.opacity, `${nome}: visibile`).toBe(1);
	}
});

test('le altre pagine tengono la hero classica', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	for (const rotta of ['/lab/it/progetti/', '/lab/it/chi-sono/']) {
		await page.goto(rotta);
		await page.waitForTimeout(700);
		const misura = await page.evaluate(() => ({
			marchio: Boolean(document.querySelector('.hero-marchio')),
			media: Boolean(document.querySelector('.hero-media')),
			titolo: getComputedStyle(document.querySelector('.home-section.hero h1')!).maxWidth,
		}));
		expect(misura.marchio, `${rotta}: niente marchio gigante`).toBe(false);
		expect(misura.media, `${rotta}: niente riquadro`).toBe(false);
		expect(misura.titolo, `${rotta}: il titolo tiene la sua misura`).not.toBe('none');
	}
});
