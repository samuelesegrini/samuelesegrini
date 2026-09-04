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
	expect(Number.parseFloat(fermo.media.scale), 'da ferma il riquadro è piccolo').toBeLessThan(0.45);
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

test('sul telefono la hero è compatta e non eredita il fondo dell\'ultima sezione', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1600);

	const misura = await page.evaluate(() => {
		const hero = document.querySelector('.home-section.hero')!;
		const pillola = document.querySelector('.hero-hint')!.getBoundingClientRect();
		const riquadro = document.querySelector('.hero-media')!.getBoundingClientRect();
		const ultima = document.querySelector('.home-section:last-child')!;
		return {
			// :last-of-type prendeva anche la hero, unico <header> fra i fratelli
			fondoHero: Number.parseFloat(getComputedStyle(hero).paddingBottom),
			fondoUltima: Number.parseFloat(getComputedStyle(ultima).paddingBottom),
			ultima: ultima.id,
			altezzaHero: Math.round(hero.getBoundingClientRect().height),
			// con tutte le righe auto e align-content: stretch la pillola si gonfiava
			altezzaPillola: Math.round(pillola.height),
			pillolaSottoIlRiquadro: pillola.top > riquadro.bottom,
			stacco: Math.round(riquadro.top - hero.getBoundingClientRect().bottom),
		};
	});

	expect(misura.ultima, 'l\'ultima sezione è contatto, non la hero').toBe('contatto');
	expect(misura.fondoHero, 'la hero non porta il fondo dell\'ultima sezione').toBeLessThan(80);
	expect(misura.fondoUltima, 'che invece resta sull\'ultima').toBeGreaterThan(140);
	expect(misura.altezzaPillola, 'la pillola resta una pillola').toBeLessThan(48);
	expect(misura.altezzaHero, 'la hero sta in una schermata').toBeLessThan(844);
	expect(misura.stacco, 'il riquadro arriva subito dopo').toBeLessThan(90);
});

test('il marchio non deriva sul telefono', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1600);
	const prima = await page.evaluate(() =>
		document.querySelector('.hero-marchio > .mascherina')!.getBoundingClientRect().left,
	);
	await scorriA(page, 300);
	const misura = await page.evaluate(() => {
		const meta = document.querySelector('.hero-marchio > .mascherina')!;
		return { nome: getComputedStyle(meta).animationName, sinistra: meta.getBoundingClientRect().left };
	});
	expect(misura.nome, 'nessuna animazione sul marchio').toBe('none');
	expect(misura.sinistra, 'e resta dov\'è').toBe(prima);
});

test('il riquadro piccolo tiene una misura leggibile su ogni schermo', async ({ page }) => {
	for (const [larghezza, altezza] of [[768, 1024], [834, 1194], [1024, 1366], [1280, 800], [1600, 900], [1920, 1080]] as const) {
		await page.setViewportSize({ width: larghezza, height: altezza });
		await page.goto('/lab/it/');
		await page.waitForTimeout(1500);
		const misura = await page.evaluate(() => {
			const riquadro = document.querySelector('.hero-media')!.getBoundingClientRect();
			const pillola = document.querySelector('.hero-hint')!.getBoundingClientRect();
			const barra = document.querySelector('.toolbar-shell')!.getBoundingClientRect();
			return {
				quota: riquadro.width / window.innerWidth,
				larghezza: riquadro.width,
				sovrappostaAllaBarra:
					pillola.right > barra.left + 4 && pillola.left < barra.right - 4 && pillola.bottom > barra.top + 4,
				pillolaInSchermo: pillola.top >= 0 && pillola.bottom <= window.innerHeight,
			};
		});
		// la misura piccola è capped: resta la stessa manciata di pixel su ogni schermo
		expect(misura.larghezza, `${larghezza}: il riquadro non è un francobollo`).toBeGreaterThan(340);
		expect(misura.larghezza, `${larghezza}: e non è già quasi pieno`).toBeLessThan(560);
		expect(misura.quota, `${larghezza}: e non invade lo schermo`).toBeLessThan(0.56);
		expect(misura.sovrappostaAllaBarra, `${larghezza}: la pillola non finisce sotto la barra`).toBe(false);
		expect(misura.pillolaInSchermo, `${larghezza}: la pillola si vede senza scorrere`).toBe(true);
	}
});

test('l\'ingresso aspetta la transizione invece di essere annullato', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });

	// caricamento pieno: nessuna attesa, i pezzi partono col loro sfalsamento
	await page.goto('/lab/it/');
	await page.waitForTimeout(300);
	const carico = await page.evaluate(() => ({
		discesa: getComputedStyle(document.querySelector('.hero-media-fill')!).animationName,
		ritardoDiscesa: getComputedStyle(document.querySelector('.hero-media-fill')!).animationDelay,
		crescita: getComputedStyle(document.querySelector('.hero-media')!).animationName,
		bandiera: document.documentElement.hasAttribute('data-lab-client-arrival'),
	}));
	expect(carico.bandiera, 'un caricamento pieno non è un arrivo client').toBe(false);
	expect(carico.discesa).toBe('scopre');
	expect(carico.ritardoDiscesa, 'solo il suo sfalsamento').toBe('0.26s');
	expect(carico.crescita).toBe('cresce');

	// arrivo dal menu: l'ingresso c'è ancora, spostato in avanti perché la transizione
	// copre i primi istanti e altrimenti si consumerebbe dove nessuno lo vede
	await page.goto('/lab/it/progetti/');
	await page.waitForTimeout(1400);
	await page.click('.toolbar-shell .menu-toggle');
	await page.waitForTimeout(700);
	await page.click('.toolbar-shell .nav-item[data-page="Home"]');
	await page.waitForTimeout(250);

	const durante = await page.evaluate(() => {
		const riga = document.querySelector('.hero-marchio > .mascherina:nth-child(1) > *')!;
		const stile = getComputedStyle(riga);
		return {
			percorso: location.pathname,
			bandiera: document.documentElement.hasAttribute('data-lab-client-arrival'),
			nome: stile.animationName,
			ritardo: stile.animationDelay,
			// ancora dentro la feritoia: l'animazione non è partita
			trasformato: stile.transform !== 'none' && stile.transform !== 'matrix(1, 0, 0, 1, 0, 0)',
			crescita: getComputedStyle(document.querySelector('.hero-media')!).animationName,
		};
	});
	expect(durante.percorso).toBe('/lab/it/');
	expect(durante.bandiera).toBe(true);
	expect(durante.nome, 'l\'ingresso non è annullato').toBe('sale');
	expect(durante.ritardo, 'sfalsamento più l\'attesa, oltre la durata della transizione').toBe('0.818s');
	expect(durante.trasformato, 'e a 250ms non è ancora salito').toBe(true);
	expect(durante.crescita, 'la crescita resta agganciata allo scroll').toBe('cresce');

	// il riquadro è il pezzo più pesante da comporre: non deve partire dentro la transizione
	const riquadro = await page.evaluate(() => {
		const stile = getComputedStyle(document.querySelector('.hero-media-fill')!);
		const durata = getComputedStyle(document.documentElement).getPropertyValue('--transizione').trim();
		return { ritardo: Number.parseFloat(stile.animationDelay) * 1000, transizione: Number.parseFloat(durata), nome: stile.animationName };
	});
	expect(riquadro.nome).toBe('scopre');
	expect(riquadro.ritardo, 'parte dopo che la transizione ha chiuso').toBeGreaterThan(riquadro.transizione);

	// a transizione finita i pezzi sono al loro posto
	await page.waitForTimeout(1900);
	const dopo = await page.evaluate(() => {
		const riga = document.querySelector('.hero-marchio > .mascherina:nth-child(1) > *')!;
		return {
			trasform: getComputedStyle(riga).transform,
			riquadro: Math.round(document.querySelector('.hero-media')!.getBoundingClientRect().width),
		};
	});
	expect(dopo.trasform, 'il marchio è arrivato').toBe('none');
	expect(dopo.riquadro, 'e il riquadro è ancora quello piccolo').toBeLessThan(560);

	await scorriA(page, 500);
	const cresciuto = await page.evaluate(() =>
		Math.round(document.querySelector('.hero-media')!.getBoundingClientRect().width),
	);
	expect(cresciuto, 'e scorrendo cresce davvero').toBeGreaterThan(dopo.riquadro + 200);
});

test('la crescita del riquadro non porta variabili nei fotogrammi', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1600);

	const lette = await page.evaluate(() => {
		// getKeyframes() restituisce sempre valori risolti, anche quando la regola contiene
		// var(): per sapere com'è scritta davvero si legge il testo della regola
		let testo: string | null = null;
		for (const foglio of [...document.styleSheets]) {
			let regole: CSSRuleList;
			try { regole = foglio.cssRules } catch { continue }
			const cerca = (lista: CSSRuleList) => {
				for (const regola of [...lista] as CSSRule[]) {
					const gruppo = regola as CSSGroupingRule;
					if ((regola as CSSKeyframesRule).name === 'cresce') testo = regola.cssText;
					else if (gruppo.cssRules && regola.constructor.name !== 'CSSStyleRule') cerca(gruppo.cssRules);
				}
			};
			cerca(regole);
		}
		const riquadro = document.querySelector('.hero-media')!;
		const animazione = riquadro
			.getAnimations()
			.find((corrente) => (corrente as CSSAnimation).animationName === 'cresce') as CSSAnimation | undefined;
		return { testo, agganciata: Boolean(animazione), partenza: getComputedStyle(riquadro).scale };
	});

	// un'animazione i cui fotogrammi contengono var() resta sul thread principale: la misura
	// di partenza sta sull'elemento, non dentro la regola
	expect(lette.agganciata, 'la crescita è agganciata').toBe(true);
	expect(lette.testo, 'la regola dei fotogrammi si trova').not.toBeNull();
	expect(lette.testo, 'niente variabili da risolvere a ogni fotogramma').not.toContain('var(');
	expect(lette.partenza, 'la partenza è sull-elemento').toMatch(/^0\.\d+$/);

	// e i ripieghi restano corretti: dove l'animazione non c'è, il riquadro è a grandezza piena
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/lab/it/');
	await page.waitForTimeout(1400);
	const telefono = await page.evaluate(() => {
		const stile = getComputedStyle(document.querySelector('.hero-media')!);
		return { scala: stile.scale, spostamento: stile.translate };
	});
	expect(telefono.scala, 'sul telefono non resta rimpicciolito').toBe('none');
	expect(telefono.spostamento, 'né spostato').toBe('none');
});
