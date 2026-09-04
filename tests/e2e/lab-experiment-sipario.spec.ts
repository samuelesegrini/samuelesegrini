import { expect, test } from '@playwright/test';

/** Il sipario del primo caricamento: compare una volta per sessione, segue traguardi veri
 *  del documento e tiene fermo l'ingresso della hero finché non se ne va. */

test('copre il primo caricamento e passa la mano alla hero', async ({ page }) => {
	const errori: string[] = [];
	page.on('pageerror', (errore) => errori.push(errore.message));
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(150);

	const acceso = await page.evaluate(() => ({
		bandiera: document.documentElement.hasAttribute('data-caricando'),
		visibile: getComputedStyle(document.querySelector('.sipario')!).display,
		voce: document.querySelector('[data-sipario-voce]')?.textContent,
		conta: document.querySelector('[data-sipario-conta]')?.textContent,
		heroFerma: getComputedStyle(document.querySelector('.hero-marchio .mascherina > *')!).animationPlayState,
	}));
	expect(acceso.bandiera).toBe(true);
	expect(acceso.visibile).toBe('grid');
	expect(acceso.voce, 'la copy arriva dalla collection').toBe('Caricamento');
	expect(acceso.conta, 'e il numero non parte già a fondo corsa').toMatch(/^0[0-5]\d$/);
	expect(acceso.heroFerma, 'la hero aspetta il suo turno').toBe('paused');

	await page.waitForFunction(() => document.documentElement.hasAttribute('data-caricato'), null, { timeout: 8000 });
	await page.waitForTimeout(900);

	const spento = await page.evaluate(() => ({
		bandiera: document.documentElement.hasAttribute('data-caricando'),
		visibile: getComputedStyle(document.querySelector('.sipario')!).display,
		heroViva: getComputedStyle(document.querySelector('.hero-marchio .mascherina > *')!).animationPlayState,
	}));
	expect(spento.bandiera).toBe(false);
	expect(spento.visibile, 'e sparisce dal flusso, non resta sopra invisibile').toBe('none');
	expect(spento.heroViva, 'la hero riprende').toBe('running');
	expect(errori).toEqual([]);
});

test('non si ripresenta nella stessa sessione né sulle navigazioni client', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForFunction(() => document.documentElement.hasAttribute('data-caricato'), null, { timeout: 8000 });

	// stessa scheda, ricaricando: già visto
	await page.reload();
	await page.waitForTimeout(200);
	expect(await page.evaluate(() => document.documentElement.hasAttribute('data-caricando')), 'una volta per sessione').toBe(false);

	// navigazione client: la transizione è già il passaggio
	await page.goto('/lab/it/progetti/');
	await page.waitForTimeout(1200);
	await page.click('.toolbar-shell .menu-toggle');
	await page.waitForTimeout(700);
	await page.click('.toolbar-shell .nav-item[data-page="Home"]');
	await page.waitForTimeout(900);
	expect(await page.evaluate(() => document.documentElement.hasAttribute('data-caricando')), 'niente sipario sopra la transizione').toBe(false);
});

test('con movimento ridotto il sipario non trattiene la pagina', async ({ browser }) => {
	const contesto = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
	const pagina = await contesto.newPage();
	await pagina.goto('/lab/it/');
	await pagina.waitForFunction(() => document.documentElement.hasAttribute('data-caricato'), null, { timeout: 4000 });
	const misura = await pagina.evaluate(() => ({
		visibile: getComputedStyle(document.querySelector('.sipario')!).display,
		uscita: getComputedStyle(document.querySelector('.sipario')!).animationName,
	}));
	expect(misura.visibile).toBe('none');
	expect(misura.uscita, 'nessuna animazione di uscita').toBe('none');
	await contesto.close();
});
