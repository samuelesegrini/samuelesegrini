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
			const testo = sezione.querySelector('.sezione-testo, .righe-testa')!.getBoundingClientRect();
			const voci = [...sezione.querySelectorAll('.elenco li, .tappe li, .canali li, .righe-elenco li')].map((voce) =>
				voce.getBoundingClientRect(),
			);
			return { fuori: voci.filter((riquadro) => riquadro.right > 390).length, impilato: voci[0].top > testo.top };
		}, id);
		expect(misura.fuori, `${id}: niente sborda dallo schermo`).toBe(0);
		expect(misura.impilato, `${id}: le voci stanno sotto il testo`).toBe(true);
	}
});

test('la scaletta dei progetti tiene la sua struttura', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1600);
	await vaiA(page, 'progetti');

	const misura = await page.evaluate(() => {
		const riquadro = (selettore: string, dentro: ParentNode = document) =>
			(dentro.querySelector(selettore) as HTMLElement).getBoundingClientRect();
		const titolo = riquadro('.righe-titolo h1');
		const guida = riquadro('.righe-guida');
		const riga = document.querySelector('.righe-elenco li a')!;
		const nome = riquadro('strong', riga);
		const meta = riquadro('.righe-meta', riga);
		const sintesi = riquadro('.righe-sintesi', riga);
		const nastro = riquadro('.righe-nastro', riga);
		return {
			// titolo e guida si dividono la larghezza, non stanno uno sopra l'altro
			guidaAccanto: Math.round(guida.left) > Math.round(titolo.right),
			// dentro la riga: nome e tipo sulla stessa linea, sintesi e nastro sotto
			metaAllineata: Math.abs(meta.bottom - nome.bottom) < 24,
			sintesiSotto: sintesi.top > nome.bottom - 4,
			nastroInFondo: nastro.top > sintesi.bottom - 4,
			// la sintesi è tagliata a due righe: le righe restano scorribili
			righeSintesi: Math.round(sintesi.height / Number.parseFloat(getComputedStyle(document.querySelector('.righe-sintesi')!).lineHeight)),
			righe: document.querySelectorAll('.righe-elenco li').length,
		};
	});

	expect(misura.guidaAccanto, 'la guida sta accanto al titolo').toBe(true);
	expect(misura.metaAllineata, 'tipo e anno sulla linea del nome').toBe(true);
	expect(misura.sintesiSotto, 'la sintesi viene dopo il nome').toBe(true);
	expect(misura.nastroInFondo, 'e il nastro chiude la riga').toBe(true);
	expect(misura.righeSintesi, 'la sintesi si ferma a due righe').toBeLessThanOrEqual(2);
	expect(misura.righe, 'tre progetti in evidenza').toBe(3);
});

test('le righe dei progetti si muovono e non si somigliano tutte', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1800);

	// prima che la sezione entri: le righe stanno ancora sotto la loro feritoia
	await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' as ScrollBehavior }));
	await page.waitForTimeout(400);
	const entrando = await page.evaluate(() =>
		[...document.querySelectorAll('.righe-feritoia > a')].map((riga) => {
			const stile = getComputedStyle(riga);
			return {
				nome: stile.animationName,
				y: Number.parseFloat(stile.transform.split(',').at(-1) ?? '0'),
				corpo: Math.round(Number.parseFloat(getComputedStyle(riga.querySelector('strong')!).fontSize)),
				nastro: getComputedStyle(riga.querySelector('.righe-treno')!).animationName,
			};
		}),
	);

	expect(entrando.map((r) => r.nome), 'ogni riga ha il suo ingresso').toEqual(['sale', 'sale', 'sale']);
	expect(entrando.every((r) => r.y > 100), 'e prima di entrare sono ancora giù').toBe(true);
	// ognuna ha la sua timeline: lo sfalsamento lo dà lo scroll, non un ritardo scritto a mano
	expect(new Set(entrando.map((r) => Math.round(r.y))).size, 'non si muovono all\'unisono').toBeGreaterThan(1);
	// il primo progetto pesa più dell'ultimo
	expect(entrando[0].corpo, 'il primo nome è il più grande').toBeGreaterThan(entrando[2].corpo + 8);
	// tre nastri identici nella stessa direzione sembrano una ripetizione: il secondo va al contrario
	expect(entrando.map((r) => r.nastro), 'i nastri si alternano').toEqual([
		'nastro',
		'nastro-contrario',
		'nastro',
	]);

	// ognuna, una volta entrata per davvero, si posa: la sezione è più alta di una schermata,
	// quindi vanno portate in vista una alla volta invece di guardarle tutte insieme
	for (const indice of [0, 1, 2]) {
		await page.evaluate((i) => {
			document.querySelectorAll('.righe-elenco li')[i].scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
		}, indice);
		await page.waitForTimeout(350);
		const posata = await page.evaluate(
			(i) => getComputedStyle(document.querySelectorAll('.righe-feritoia > a')[i]).transform,
			indice,
		);
		expect(posata, `la riga ${indice + 1} si posa quando è in vista`).toBe('matrix(1, 0, 0, 1, 0, 0)');
	}

	// e la lavagna passa sotto il testo al passaggio del mouse
	await page.hover('.righe-elenco li:first-child a');
	await page.waitForTimeout(600);
	const lavagna = await page.evaluate(() => {
		const stile = getComputedStyle(document.querySelector('.righe-lavagna')!);
		return { trasformata: stile.transform, dietro: stile.zIndex };
	});
	expect(lavagna.trasformata, 'la lavagna è arrivata a coprire la riga').toBe('matrix(1, 0, 0, 1, 0, 0)');
	expect(lavagna.dietro, 'e resta dietro il testo').toBe('-1');
});

test('con movimento ridotto le righe stanno ferme', async ({ browser }) => {
	const contesto = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
	const pagina = await contesto.newPage();
	await pagina.goto('/lab/it/');
	await pagina.waitForTimeout(1500);
	await pagina.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' as ScrollBehavior }));
	await pagina.waitForTimeout(300);

	const misura = await pagina.evaluate(() =>
		[...document.querySelectorAll('.righe-feritoia > a')].map((riga) => ({
			nome: getComputedStyle(riga).animationName,
			trasformata: getComputedStyle(riga).transform,
			nastro: getComputedStyle(riga.querySelector('.righe-treno')!).animationName,
		})),
	);
	for (const riga of misura) {
		expect(riga.nome).toBe('none');
		expect(riga.trasformata).toBe('none');
		expect(riga.nastro).toBe('none');
	}
	await contesto.close();
});
