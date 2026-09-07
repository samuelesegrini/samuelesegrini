import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { attendiCaricato } from './lab-chrome';

/** Il piede chiude ogni pagina del banco: sta sopra la barra fissa, non sborda, e le sue
 *  voci portano dove dicono. */

const rotte = ['/it/', '/it/progetti/', '/en/about/'];

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
				colonne: document.querySelectorAll('.piede-navigazione a').length,
			};
		});

		expect(misura.dallaBarra, `${rotta}: la chiusura sta sopra la barra`).toBeGreaterThan(0);
		expect(misura.sbordaADestra, `${rotta}: non sborda`).toBe(false);
		expect(misura.larghezzaPagina, `${rotta}: niente scorrimento laterale`).toBeLessThanOrEqual(1280);
		expect(misura.colonne, `${rotta}: quattro destinazioni`).toBe(4);
	}
});

test('le voci del piede portano dove dicono', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/it/');
	await attendiCaricato(page);

	const voci = await page.evaluate(() => ({
		invito: (document.querySelector('.piede-invito') as HTMLAnchorElement).getAttribute('href'),
		pagine: [...document.querySelectorAll('.piede-navigazione a')].map((a) => a.getAttribute('href')),
		altrove: [...document.querySelectorAll('.piede-altrove a')].map((a) => a.getAttribute('href')),
		lingue: [...document.querySelectorAll('.piede-lingue a')].map((a) => ({
			testo: a.textContent,
			corrente: a.hasAttribute('aria-current'),
		})),
	}));

	expect(voci.invito, 'l\'invito grande apre la posta').toMatch(/^mailto:/);
	expect(voci.pagine, 'le quattro rotte italiane').toEqual([
		'/it/',
		'/it/progetti/',
		'/it/articoli/',
		'/it/chi-sono/',
	]);
	expect(voci.altrove?.length, 'GitHub, LinkedIn ed email').toBe(3);
	expect(voci.lingue.find((lingua) => lingua.corrente)?.testo?.trim(), 'la lingua corrente è marcata').toBe('IT');

	// e la lingua porta alla stessa pagina nell'altra lingua, non alla home
	await page.goto('/it/progetti/');
	await page.waitForTimeout(700);
	const altra = await page.evaluate(
		() => [...document.querySelectorAll('.piede-lingue a')].find((a) => !a.hasAttribute('aria-current'))?.getAttribute('href'),
	);
	expect(altra, 'la lingua tiene la pagina').toBe('/en/projects/');
});


test('il footer resta leggibile da 320px al desktop, in entrambe le lingue', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const locale of ['it', 'en']) {
		for (const width of [320, 390, 768, 1280, 1440]) {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(`/${locale}/`);
			await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
			const layout = await page.evaluate(() => {
				const title = document.querySelector<HTMLElement>('.piede-gesto h2 > span')!;
				const footer = document.querySelector('.piede')!.getBoundingClientRect();
				const closing = document.querySelector('.piede-chiusura')!.getBoundingClientRect();
				const toolbar = document.querySelector('.toolbar-shell')!.getBoundingClientRect();
				return {
					width: document.documentElement.scrollWidth,
					titleFits: title.scrollWidth <= title.clientWidth + 1,
					linksFit: [...document.querySelectorAll('.piede a')].every((link) => { const box = link.getBoundingClientRect(); return box.left >= footer.left && box.right <= footer.right; }),
					clearance: toolbar.top - closing.bottom,
				};
			});
			expect(layout.width, `${locale}, ${width}px`).toBeLessThanOrEqual(width);
			expect(layout.titleFits, `${locale}, ${width}px: il titolo è completo`).toBe(true);
			expect(layout.linksFit).toBe(true);
			expect(layout.clearance).toBeGreaterThan(0);
		}
	}
});

test('il footer è accessibile su desktop e telefono', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const width of [1280, 390]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/it/');
		await page.locator('.piede').scrollIntoViewIfNeeded();
		const result = await new AxeBuilder({ page }).include('#footer').analyze();
		expect(result.violations).toEqual([]);
	}
});

test('l’invito funziona da tastiera e resta leggibile senza JavaScript e con movimento ridotto', async ({ browser, page }) => {
	await page.goto('/it/');
	await attendiCaricato(page);
	const invite = page.locator('.piede-invito');
	await invite.focus();
	await expect(invite).toBeFocused();
	await expect(invite).toHaveCSS('outline-style', 'solid');
	await expect(invite).toHaveAccessibleName('Parliamone');
	await expect(invite).toHaveAttribute('href', /^mailto:/);
	const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
	const fallback = await context.newPage();
	await fallback.goto('/en/');
	await expect(fallback.locator('.piede-gesto h2 > span')).toHaveCSS('animation-name', 'none');
	await expect(fallback.locator('.piede-gesto h2')).toBeVisible();
	await expect(fallback.locator('.piede-navigazione a')).toHaveCount(4);
	await context.close();
});
