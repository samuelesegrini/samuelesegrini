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

test('la barra entra una volta sola, quando il sipario si ritira', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForFunction(() => document.documentElement.hasAttribute('data-caricato'), null, { timeout: 8000 });

	const scostamento = () =>
		page.evaluate(() => {
			const barra = document.querySelector('.toolbar-shell')!;
			const stile = getComputedStyle(barra);
			return {
				nome: stile.animationName,
				y: Number.parseFloat(stile.transform.split(',').at(-1) ?? '0') || 0,
				opacita: Number(stile.opacity),
			};
		});

	const appena = await scostamento();
	expect(appena.nome, 'la barra ha la sua animazione di ingresso').toBe('barra-entra');
	expect(appena.y, 'e parte da sotto il bordo').toBeGreaterThan(60);
	expect(appena.opacita).toBeLessThan(1);

	await page.waitForTimeout(1100);
	const posata = await scostamento();
	expect(posata.y, 'poi si posa').toBe(0);
	expect(posata.opacita).toBe(1);

	// navigando subito dopo, senza ricaricare: la barra è la stessa e non deve rientrare
	await page.click('.toolbar-shell .menu-toggle');
	await page.waitForTimeout(700);
	await page.click('.toolbar-shell .nav-item[data-page="Progetti"]');
	await page.waitForTimeout(300);
	const durante = await page.evaluate(() => {
		const barra = document.querySelector('.toolbar-shell')!;
		const riquadro = barra.getBoundingClientRect();
		return {
			segno: barra.hasAttribute('data-entra'),
			nome: getComputedStyle(barra).animationName,
			// il guscio ha il suo gruppo di transizione: non scorre su con la pagina
			gruppo: getComputedStyle(barra).viewTransitionName,
			alto: Math.round(riquadro.top),
		};
	});
	expect(durante.segno, 'il segno è già stato tolto').toBe(false);
	expect(durante.nome, 'e la barra non rientra').toBe('none');
	expect(durante.gruppo, 'il guscio è un gruppo a sé, non parte del root').toBe('labtoolbar');
	expect(durante.alto, 'quindi resta al suo posto durante lo scambio').toBeLessThan(700);

	// ricaricando nella stessa sessione il sipario non torna, quindi nemmeno l'ingresso
	await page.reload();
	await page.waitForTimeout(400);
	const seconda = await page.evaluate(() => ({
		caricato: document.documentElement.hasAttribute('data-caricato'),
		nome: getComputedStyle(document.querySelector('.toolbar-shell')!).animationName,
	}));
	expect(seconda.caricato).toBe(false);
	expect(seconda.nome, 'la barra è già dov-è e ci resta').toBe('none');

	// e nemmeno passando da una pagina all-altra
	await page.click('.toolbar-shell .menu-toggle');
	await page.waitForTimeout(700);
	await page.click('.toolbar-shell .nav-item[data-page="Progetti"]');
	await page.waitForTimeout(1200);
	expect(
		await page.evaluate(() => getComputedStyle(document.querySelector('.toolbar-shell')!).animationName),
		'la barra sopravvive allo scambio senza rientrare',
	).toBe('none');
});

test('il sipario non se ne va prima dei caratteri', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.addInitScript(() => {
		const finestra = window as typeof window & { __allaChiusura?: string[] };
		const osserva = () => {
			if (document.documentElement.hasAttribute('data-caricato')) {
				finestra.__allaChiusura = [...document.fonts].map((faccia) => `${faccia.family}:${faccia.status}`);
				return;
			}
			requestAnimationFrame(osserva);
		};
		requestAnimationFrame(osserva);
	});
	await page.goto('/lab/it/');
	await page.waitForFunction(() => (window as typeof window & { __allaChiusura?: string[] }).__allaChiusura, null, {
		timeout: 8000,
	});

	const stato = await page.evaluate(() => (window as typeof window & { __allaChiusura?: string[] }).__allaChiusura!);
	// senza gli import dei font il banco cadeva sui caratteri di sistema, e document.fonts
	// restava vuoto: il traguardo "font pronti" del sipario non voleva dire niente
	expect(stato.length, 'i caratteri del sito sono dichiarati').toBeGreaterThan(0);
	for (const famiglia of ['Manrope Variable', 'Newsreader Variable', 'IBM Plex Mono']) {
		expect(stato, `${famiglia} è caricato prima che il sipario se ne vada`).toContain(`${famiglia}:loaded`);
	}
	expect(
		await page.evaluate(() => getComputedStyle(document.querySelector('.hero-marchio .marchio-riga')!).fontFamily),
		'e il marchio usa il carattere vero, non il ripiego di sistema',
	).toContain('Manrope Variable');
});
