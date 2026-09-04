import { expect, test } from '@playwright/test';

import { attendiCaricato } from './lab-chrome';

/** Il piede chiude ogni pagina del banco: sta sopra la barra fissa, non sborda, e le sue
 *  voci portano dove dicono. */

const rotte = ['/lab/it/', '/lab/it/progetti/', '/lab/en/about/'];

test('il piede chiude ogni pagina e lascia spazio alla barra', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	for (const rotta of rotte) {
		await page.goto(rotta);
		await page.waitForTimeout(900);
		await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' as ScrollBehavior }));
		await page.waitForTimeout(400);

		const misura = await page.evaluate(() => {
			const piede = document.querySelector('.piede')!.getBoundingClientRect();
			const chiusura = document.querySelector('.piede-chiusura')!.getBoundingClientRect();
			const barra = document.querySelector('.toolbar-shell')!.getBoundingClientRect();
			return {
				esiste: true,
				// la barra è fissa: l'ultima riga del piede deve restarle sopra
				dallaBarra: barra.top - chiusura.bottom,
				sbordaADestra: piede.right > window.innerWidth + 1,
				larghezzaPagina: document.documentElement.scrollWidth,
				colonne: document.querySelectorAll('.piede-colonna').length,
			};
		});

		expect(misura.dallaBarra, `${rotta}: la chiusura sta sopra la barra`).toBeGreaterThan(0);
		expect(misura.sbordaADestra, `${rotta}: non sborda`).toBe(false);
		expect(misura.larghezzaPagina, `${rotta}: niente scorrimento laterale`).toBeLessThanOrEqual(1280);
		expect(misura.colonne, `${rotta}: quattro colonne`).toBe(4);
	}
});

test('le voci del piede portano dove dicono', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await attendiCaricato(page);

	const voci = await page.evaluate(() => ({
		invito: (document.querySelector('.piede-invito') as HTMLAnchorElement).getAttribute('href'),
		pagine: [...document.querySelectorAll('.piede-colonna nav a, nav.piede-colonna a')].map((a) => a.getAttribute('href')),
		altrove: [...document.querySelectorAll('.piede-colonna')]
			.map((colonna) => [...colonna.querySelectorAll('a')].map((a) => a.getAttribute('href')))
			.find((lista) => lista.some((href) => href?.startsWith('https://github.com'))),
		lingue: [...document.querySelectorAll('.piede-lingue a')].map((a) => ({
			testo: a.textContent,
			corrente: a.hasAttribute('aria-current'),
		})),
	}));

	expect(voci.invito, 'l\'invito grande apre la posta').toMatch(/^mailto:/);
	expect(voci.pagine, 'le quattro rotte italiane').toEqual([
		'/lab/it/',
		'/lab/it/progetti/',
		'/lab/it/articoli/',
		'/lab/it/chi-sono/',
	]);
	expect(voci.altrove?.length, 'GitHub, LinkedIn ed email').toBe(3);
	expect(voci.lingue.find((lingua) => lingua.corrente)?.testo?.trim(), 'la lingua corrente è marcata').toBe('IT');

	// e la lingua porta alla stessa pagina nell'altra lingua, non alla home
	await page.goto('/lab/it/progetti/');
	await page.waitForTimeout(700);
	const altra = await page.evaluate(
		() => [...document.querySelectorAll('.piede-lingue a')].find((a) => !a.hasAttribute('aria-current'))?.getAttribute('href'),
	);
	expect(altra, 'la lingua tiene la pagina').toBe('/lab/en/projects/');
});
