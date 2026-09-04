import { expect, test } from '@playwright/test';

/** Sul telefono la barra ha poco spazio: il cambio lingua esce dalla riga e passa nel
 *  pannello del menu, dove c'è margine. Sul desktop resta la cella di sempre. */

test('sul telefono il cambio lingua sta nel menu, non nella barra', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(800);

	const chiusa = await page.evaluate(() => ({
		cella: document.querySelector('.toggle-square')!.getBoundingClientRect().width > 0,
		colonne: getComputedStyle(document.querySelector('.slot-row')!).gridTemplateColumns.split(' ').length,
	}));
	expect(chiusa.cella, 'la cella lingua lascia la barra').toBe(false);
	expect(chiusa.colonne, 'la riga si ricompone su due colonne').toBe(2);

	await page.click('#menu-toggle');
	await page.waitForTimeout(700);
	const aperto = await page.evaluate(() => {
		const centro = (riquadro: DOMRect) => (riquadro.top + riquadro.bottom) / 2;
		const lingue = [...document.querySelectorAll('.panel-lingue a')] as HTMLAnchorElement[];
		const gruppo = document.querySelector('.panel-lingue')!.getBoundingClientRect();
		const nome = document.querySelector('.panel-identity .identity-name')!.getBoundingClientRect();
		const scheda = document.querySelector('.nav-item')!.getBoundingClientRect();
		return {
			visibili: lingue.filter((voce) => voce.getBoundingClientRect().width > 0).length,
			attiva: lingue.find((voce) => voce.getAttribute('aria-current'))?.textContent?.trim(),
			accanto: gruppo.left > nome.right,
			scarto: Math.abs(centro(gruppo) - centro(nome)),
			bordoSinistro: Math.abs(nome.left - scheda.left),
			bordoDestro: Math.abs(gruppo.right - scheda.right),
		};
	});
	expect(aperto.visibili, 'due lingue nel pannello').toBe(2);
	expect(aperto.attiva, 'la lingua corrente è marcata').toBe('IT');
	expect(aperto.accanto, 'stanno a destra del nome, non sopra').toBe(true);
	expect(aperto.scarto, 'nome e lingue sulla stessa linea').toBeLessThanOrEqual(1);
	expect(aperto.bordoSinistro, 'il nome parte dal bordo delle schede').toBeLessThanOrEqual(1);
	expect(aperto.bordoDestro, 'le lingue finiscono sul bordo delle schede').toBeLessThanOrEqual(1);

	await page.click('.panel-lingue a:not([aria-current])');
	await page.waitForTimeout(1200);
	expect(new URL(page.url()).pathname, 'e portano davvero all\'altra lingua').toBe('/lab/en/');
});

test('sul desktop il cambio lingua resta nella barra', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(700);
	const misura = await page.evaluate(() => ({
		cella: document.querySelector('.toggle-square')!.getBoundingClientRect().width > 0,
		pannello: getComputedStyle(document.querySelector('.panel-lingue')!).display,
	}));
	expect(misura.cella, 'la cella è al suo posto').toBe(true);
	expect(misura.pannello, 'e il doppione nel pannello resta nascosto').toBe('none');
});

test('la riga resta in fondo al guscio in ogni stato', async ({ page }) => {
	const errori: string[] = [];
	page.on('pageerror', (errore) => errori.push(errore.message));
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(2200);

	const misura = () =>
		page.evaluate(() => {
			const guscio = document.querySelector('.toolbar-shell') as HTMLElement;
			const g = guscio.getBoundingClientRect();
			const r = document.querySelector('.identity-row')!.getBoundingClientRect();
			return {
				// la riga è ancorata in fondo al guscio: il suo fondo coincide con il suo
				dalFondo: Math.round(r.bottom - g.bottom),
				dalLato: Math.round(r.left - g.left),
				// overflow: hidden faceva del guscio un contenitore scorrevole, e il fuoco su
				// una voce di menu lo faceva scorrere di 195px portandosi via la riga
				scorrimento: guscio.scrollTop,
			};
		});

	const passi: [string, () => Promise<unknown>][] = [
		['a riposo', async () => {}],
		['in modo indice', async () => {
			await page.evaluate(() => document.querySelector('#lavoro')!.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior }));
			await page.waitForTimeout(800);
		}],
		['con il menu aperto', async () => {
			await page.click('.toolbar-shell .menu-toggle');
			await page.waitForTimeout(800);
		}],
		['dopo il fuoco da tastiera', async () => {
			await page.keyboard.press('Tab');
			await page.keyboard.press('Tab');
			await page.waitForTimeout(300);
		}],
		['dopo aver navigato dal menu', async () => {
			await page.click('.toolbar-shell .nav-item[data-page="Progetti"]');
			await page.waitForTimeout(1400);
		}],
	];

	for (const [dove, azione] of passi) {
		await azione();
		const m = await misura();
		expect(m.dalFondo, `${dove}: la riga tocca il fondo del guscio`).toBeLessThanOrEqual(2);
		expect(m.dalLato, `${dove}: e il suo lato`).toBeLessThanOrEqual(2);
		expect(m.scorrimento, `${dove}: il guscio non scorre dentro di sé`).toBe(0);
	}

	expect(errori).toEqual([]);
});
