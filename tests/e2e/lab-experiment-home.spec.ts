import { expect, test } from '@playwright/test';

/** La home sperimentale mette il testo a sinistra e le voci a destra: qui si controlla che
 *  la griglia valga solo dove esiste davvero una colonna di testo, e che nulla finisca
 *  sotto la barra o fuori dallo schermo. */

const sezioni = ['inizio', 'lavoro', 'scrittura', 'percorso', 'contatto'] as const;

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
	await page.goto('/lab/it/');
	await page.waitForTimeout(800);

	for (const id of sezioni) {
		await vaiA(page, id);
		const misura = await page.evaluate((s) => {
			const sezione = document.querySelector(`#${s}`)!;
			const testo = sezione.querySelector('.sezione-testo');
			const corpo = sezione.querySelector('.elenco, .tappe, .canali');
			const barra = document.querySelector('.toolbar-shell')!.getBoundingClientRect();
			return {
				colonne: getComputedStyle(sezione).gridTemplateColumns.split(' ').length,
				accoppiati: Boolean(testo) === Boolean(corpo),
				affiancati:
					testo && corpo
						? Math.round(corpo.getBoundingClientRect().left) > Math.round(testo.getBoundingClientRect().right)
						: null,
				// coperto davvero: si sovrappone al rettangolo della barra, non solo alla sua altezza
				coperti: [...sezione.children]
					.map((figlio) => figlio.getBoundingClientRect())
					.filter(
						(riquadro) =>
							riquadro.height > 0 &&
							riquadro.bottom > barra.top + 6 &&
							riquadro.right > barra.left + 6 &&
							riquadro.left < barra.right - 6,
					).length,
			};
		}, id);

		expect(misura.accoppiati, `${id}: colonna di testo e corpo vanno sempre insieme`).toBe(true);
		if (misura.affiancati === null) expect(misura.colonne, `${id}: resta a una colonna`).toBe(1);
		else expect(misura.affiancati, `${id}: le due colonne non si sovrappongono`).toBe(true);
		expect(misura.coperti, `${id}: niente finisce sotto la barra`).toBe(0);
	}

	expect(errori).toEqual([]);
});

test('le altre pagine del laboratorio restano a una colonna', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	for (const rotta of ['/lab/it/progetti/', '/lab/it/chi-sono/', '/lab/en/writing/']) {
		await page.goto(rotta);
		await page.waitForTimeout(600);
		const colonne = await page.evaluate(() =>
			[...document.querySelectorAll('.home-section')].map(
				(sezione) => getComputedStyle(sezione).gridTemplateColumns.split(' ').length,
			),
		);
		expect(new Set(colonne), rotta).toEqual(new Set([1]));
	}
});

test('sul telefono la home si impila senza scorrimento laterale', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(800);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

	for (const id of ['lavoro', 'percorso', 'contatto']) {
		await vaiA(page, id);
		const misura = await page.evaluate((s) => {
			const sezione = document.querySelector(`#${s}`)!;
			const testo = sezione.querySelector('.sezione-testo')!.getBoundingClientRect();
			const voci = [...sezione.querySelectorAll('.elenco li, .tappe li, .canali li')].map((voce) =>
				voce.getBoundingClientRect(),
			);
			return { fuori: voci.filter((riquadro) => riquadro.right > 390).length, impilato: voci[0].top > testo.top };
		}, id);
		expect(misura.fuori, `${id}: niente sborda dallo schermo`).toBe(0);
		expect(misura.impilato, `${id}: le voci stanno sotto il testo`).toBe(true);
	}
});
