import { expect, test } from '@playwright/test';

/** La home sperimentale mette il testo a sinistra e le voci a destra: qui si controlla che
 *  la griglia valga solo dove esiste davvero una colonna di testo, e che nulla finisca
 *  sotto la barra o fuori dallo schermo. */

const sezioni = ['inizio', 'progetti', 'scrittura', 'percorso', 'contatto'] as const;

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
			// due forme: le sezioni a due colonne (.sezione-testo + elenco) e quella dei
			// progetti, che è a tutta larghezza con le righe una sotto l'altra
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

	for (const id of ['progetti', 'percorso', 'contatto']) {
		await vaiA(page, id);
		const misura = await page.evaluate((s) => {
			const sezione = document.querySelector(`#${s}`)!;
			const testo = sezione.querySelector('.sezione-testo, .carte-testa')!.getBoundingClientRect();
			const voci = [...sezione.querySelectorAll('.elenco li, .tappe li, .canali li, .carte-elenco > li')].map((voce) =>
				voce.getBoundingClientRect(),
			);
			return { fuori: voci.filter((riquadro) => riquadro.right > 390).length, impilato: voci[0].top > testo.top };
		}, id);
		expect(misura.fuori, `${id}: niente sborda dallo schermo`).toBe(0);
		expect(misura.impilato, `${id}: le voci stanno sotto il testo`).toBe(true);
	}
});

test('le carte dei progetti stanno in fila e dentro i loro bordi', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1600);
	await vaiA(page, 'progetti');

	const misura = await page.evaluate(() => {
		const prima = document.querySelector('.carta-prima > a')!.getBoundingClientRect();
		const spalla = [...document.querySelectorAll('.carte-spalla li a')].map((carta) => carta.getBoundingClientRect());
		const nastro = document.querySelector('.carta-nastro')!.getBoundingClientRect();
		const testa = document.querySelector('.carte-testa')!;
		return {
			quante: 1 + spalla.length,
			// la carta in evidenza è la più larga e alta quanto le altre due insieme
			piuLarga: prima.width > spalla[0].width * 1.4,
			altaQuantoLeDue: Math.abs(prima.height - (spalla[1].bottom - spalla[0].top)) < 4,
			// le due di spalla stanno una sopra l'altra, a destra
			impilate: spalla[1].top > spalla[0].bottom - 2,
			aDestra: spalla[0].left > prima.right,
			// il nastro è ritagliato dalla carta invece di allargarla
			nastroDentro: nastro.right <= prima.right + 1,
			sbordano: [prima, ...spalla].some((carta) => carta.right > window.innerWidth + 1),
			// titolo a sinistra e arco degli anni a destra, come sul riferimento
			titoloEArco: getComputedStyle(testa).justifyContent,
			sporgenza: document.querySelector('.carte-testa i')!.getBoundingClientRect().right - spalla[0].right,
			tracciatura: Number.parseFloat(getComputedStyle(testa).fontSize) * 0.055,
			larghezzaPagina: document.documentElement.scrollWidth,
		};
	});

	expect(misura.quante, 'tre progetti in evidenza').toBe(3);
	expect(misura.piuLarga, 'la prima carta pesa più delle altre').toBe(true);
	expect(misura.altaQuantoLeDue, 'ed è alta quanto le due di spalla insieme').toBe(true);
	expect(misura.impilate, 'le due di spalla sono impilate').toBe(true);
	expect(misura.aDestra, 'e stanno a destra della prima').toBe(true);
	expect(misura.nastroDentro, 'il nastro resta dentro la carta').toBe(true);
	expect(misura.sbordano, 'nessuna carta esce dallo schermo').toBe(false);
	expect(misura.titoloEArco).toBe('space-between');
	// la spaziatura negativa vale anche dopo l'ultima cifra: la scatola dell'arco sporge di
	// quel tanto, così è l'inchiostro ad allinearsi al bordo delle carte, non il riquadro
	expect(misura.sporgenza, 'l\'arco compensa la spaziatura di coda').toBeCloseTo(misura.tracciatura, 0);
	expect(misura.larghezzaPagina).toBeLessThanOrEqual(1280);

	// sul telefono si impilano
	await page.setViewportSize({ width: 390, height: 844 });
	await page.waitForTimeout(500);
	const stretto = await page.evaluate(() => {
		const prima = document.querySelector('.carta-prima > a')!.getBoundingClientRect();
		const spalla = document.querySelector('.carte-spalla li a')!.getBoundingClientRect();
		return { impilate: spalla.top > prima.bottom - 2, larghezza: document.documentElement.scrollWidth };
	});
	expect(stretto.impilate, 'una sotto l\'altra').toBe(true);
	expect(stretto.larghezza, 'senza scorrimento laterale').toBeLessThanOrEqual(390);
});

test('le carte entrano e si aprono al passaggio', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1600);

	// prima di entrare in vista sono ancora abbassate e trasparenti
	await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' as ScrollBehavior }));
	await page.waitForTimeout(400);
	const entrando = await page.evaluate(() =>
		[...document.querySelectorAll('.carte-elenco li:has(> a)')].map((carta) => {
			const stile = getComputedStyle(carta);
			return { nome: stile.animationName, opacita: Number(stile.opacity), nastro: getComputedStyle(carta.querySelector('.carta-treno')!).animationName };
		}),
	);
	expect(entrando.map((c) => c.nome)).toEqual(['carta-entra', 'carta-entra', 'carta-entra']);
	expect(entrando.every((c) => c.opacita < 1), 'ancora in arrivo').toBe(true);
	expect(entrando.map((c) => c.nastro), 'i nastri si alternano').toEqual(['nastro', 'nastro-contrario', 'nastro']);

	// la sezione è più alta di una schermata: ogni carta va portata in vista per davvero,
	// altrimenti si misura l'ultima mentre è ancora fuori e la sua animazione non è finita
	for (const indice of [0, 1, 2]) {
		await page.evaluate((i) => {
			document.querySelectorAll('.carte-elenco li:has(> a)')[i].scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
		}, indice);
		await page.waitForTimeout(350);
		const piena = await page.evaluate(
			(i) => Number(getComputedStyle(document.querySelectorAll('.carte-elenco li:has(> a)')[i]).opacity),
			indice,
		);
		expect(piena, `la carta ${indice + 1} arriva piena`).toBe(1);
	}

	// al passaggio: il velo copre il pozzo e l'anta si apre dalla linea centrale
	const prima = await page.evaluate(() => ({
		velo: Number(getComputedStyle(document.querySelector('.carta-velo')!).opacity),
		anta: getComputedStyle(document.querySelector('.carta-anta')!).transform,
	}));
	expect(prima.velo, 'a riposo il velo non c\'è').toBe(0);
	expect(prima.anta, 'e l\'anta è chiusa in una linea').toContain('0, 0');

	await page.hover('.carta-prima > a');
	await page.waitForTimeout(900);
	const dopo = await page.evaluate(() => ({
		velo: Number(getComputedStyle(document.querySelector('.carta-velo')!).opacity),
		anta: getComputedStyle(document.querySelector('.carta-anta')!).transform,
		fondo: getComputedStyle(document.querySelector('.carta-fondo')!).transform,
	}));
	expect(dopo.velo, 'il velo compare').toBeGreaterThan(0.9);
	expect(dopo.anta, 'l\'anta è aperta').toBe('matrix(1, 0, 0, 1, 0, 0)');
	expect(dopo.fondo, 'e lo sfondo torna alla sua misura').toBe('matrix(1, 0, 0, 1, 0, 0)');
});

test('con movimento ridotto le carte stanno ferme', async ({ browser }) => {
	const contesto = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
	const pagina = await contesto.newPage();
	await pagina.goto('/lab/it/');
	await pagina.waitForTimeout(1500);
	await pagina.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' as ScrollBehavior }));
	await pagina.waitForTimeout(300);

	const misura = await pagina.evaluate(() =>
		[...document.querySelectorAll('.carte-elenco li:has(> a)')].map((carta) => ({
			nome: getComputedStyle(carta).animationName,
			opacita: Number(getComputedStyle(carta).opacity),
			nastro: getComputedStyle(carta.querySelector('.carta-treno')!).animationName,
		})),
	);
	for (const carta of misura) {
		expect(carta.nome).toBe('none');
		expect(carta.opacita).toBe(1);
		expect(carta.nastro).toBe('none');
	}
	await contesto.close();
});

test('l\'arco degli anni resta a destra anche quando la testa va a capo', async ({ page }) => {
	for (const larghezza of [1280, 900, 600, 430, 390]) {
		await page.setViewportSize({ width: larghezza, height: 900 });
		await page.goto('/lab/it/');
		await page.waitForTimeout(900);
		await vaiA(page, 'progetti');

		const misura = await page.evaluate(() => {
			const testa = document.querySelector('.carte-testa')!.getBoundingClientRect();
			const titolo = document.querySelector('.carte-testa span')!.getBoundingClientRect();
			const arco = document.querySelector('.carte-testa i')!.getBoundingClientRect();
			const traccia = Number.parseFloat(getComputedStyle(document.querySelector('.carte-testa')!).fontSize) * 0.055;
			return { aCapo: arco.top > titolo.top + 4, distanzaDalBordo: testa.right - (arco.right - traccia) };
		});

		// con space-between da solo, andando a capo l'arco restava l'unico della riga e si
		// appoggiava a sinistra: margin-left: auto lo tiene a destra in tutti e due i casi
		expect(misura.distanzaDalBordo, `${larghezza}px${misura.aCapo ? ' (a capo)' : ''}: l'arco è a destra`).toBeLessThan(2);
	}
});

test('la sezione e la sua carta nella barra hanno lo stesso colore', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1600);
	await vaiA(page, 'progetti');

	const colori = await page.evaluate(() => {
		const sezione = document.querySelector('.home-section.carte')! as HTMLElement;
		const tinta = getComputedStyle(sezione).getPropertyValue('--tinta').trim();
		// il mazzo della barra assegna un accento a ogni sezione, nell'ordine in cui stanno
		const carteBarra = [...document.querySelectorAll('.shuffle-card')].map(
			(carta) => getComputedStyle(carta).backgroundColor,
		);
		return {
			tinta,
			barraProgetti: carteBarra[0],
			barraContatto: carteBarra[3],
			anta: getComputedStyle(document.querySelector('.carta-anta')!).backgroundColor,
			tipo: getComputedStyle(document.querySelector('.carta-meta i')!).color,
			arco: getComputedStyle(document.querySelector('.carte-testa i')!).color,
			regolaContatto: getComputedStyle(document.querySelector('#contatto .section-rule')!).backgroundColor,
		};
	});

	const arancio = 'rgb(255, 212, 184)';
	const azzurro = 'rgb(205, 239, 255)';

	expect(colori.tinta, 'la sezione ha una tinta').not.toBe('');
	// la carta dei progetti nel mazzo e la sezione dicono lo stesso colore
	expect(colori.barraProgetti, 'progetti: la carta della barra').toBe(arancio);
	// tre punti soli: l'arco, il tipo di progetto e l'anta che si apre
	expect(colori.anta, 'l\'anta porta la tinta').toBe(arancio);
	expect(colori.tipo, 'il tipo di progetto anche').toBe(arancio);
	expect(colori.arco, 'e l\'arco degli anni').toBe(arancio);
	// e contatto tiene quello che progetti ha lasciato, su entrambi i lati
	expect(colori.regolaContatto, 'contatto: la riga della sezione').toBe(azzurro);
	expect(colori.barraContatto, 'contatto: la carta della barra').toBe(azzurro);
});
