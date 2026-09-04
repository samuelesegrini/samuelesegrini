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
		const lingue = [...document.querySelectorAll('.panel-lingue a')] as HTMLAnchorElement[];
		const identita = document.querySelector('.panel-identity .identity-name')!.getBoundingClientRect();
		return {
			visibili: lingue.filter((voce) => voce.getBoundingClientRect().width > 0).length,
			attiva: lingue.find((voce) => voce.getAttribute('aria-current'))?.textContent?.trim(),
			accanto: lingue[0].getBoundingClientRect().left > identita.right,
		};
	});
	expect(aperto.visibili, 'due lingue nel pannello').toBe(2);
	expect(aperto.attiva, 'la lingua corrente è marcata').toBe('IT');
	expect(aperto.accanto, 'stanno a destra del nome, non sopra').toBe(true);

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
