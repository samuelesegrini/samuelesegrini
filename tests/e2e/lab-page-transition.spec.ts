import { expect, test, type Page } from '@playwright/test';

type TransitionRecord = {
	direction: string;
	animations: Array<{ name: string; pseudo: string | null; duration: number | string; delay: number }>;
};

const osservaProssimaTransizione = async (page: Page) => {
	await page.evaluate(() => {
		(window as typeof window & { __labTransition?: TransitionRecord }).__labTransition = undefined;
		document.addEventListener(
			'astro:before-swap',
			(event) => {
				const record: TransitionRecord = { direction: event.direction, animations: [] };
				(window as typeof window & { __labTransition?: TransitionRecord }).__labTransition = record;
				event.viewTransition.ready.then(() => {
					record.animations = document.getAnimations().flatMap((animation) => {
						if (!(animation instanceof CSSAnimation) || !(animation.effect instanceof KeyframeEffect)) return [];
						const durata = animation.effect.getTiming().duration;
						return [{
							name: animation.animationName,
							pseudo: animation.effect.pseudoElement,
							duration: typeof durata === 'number' || typeof durata === 'string' ? durata : String(durata ?? 'auto'),
							delay: animation.effect.getTiming().delay ?? 0,
						}];
					});
				});
			},
			{ once: true },
		);
	});
};

const leggiTransizione = (page: Page) =>
	page.evaluate(() => (window as typeof window & { __labTransition?: TransitionRecord }).__labTransition);

test('la pagina usa un solo snapshot opaco della viewport e mantiene la barra', async ({ page }) => {
	await page.goto('/lab/it/');

	const foglio = page.locator('[data-lab-page]');
	await expect(foglio).toHaveCSS('view-transition-name', 'none');
	await expect(foglio.locator('.toolbar-shell'), 'la barra non deve essere catturata anche nello snapshot del foglio').toHaveCount(0);
	await expect(page.locator('.hero h1')).toHaveCSS('view-transition-name', 'none');
	expect(await page.evaluate(() => [document.documentElement, document.body, document.querySelector('.stage')]
		.map((elemento) => getComputedStyle(elemento!).backgroundColor)))
		.toEqual(['rgb(244, 241, 233)', 'rgb(244, 241, 233)', 'rgb(244, 241, 233)']);

	// Il nome sta sul guscio, non sulla riga dentro: con il nome all'interno il rettangolo
	// nero restava nel gruppo root e scorreva su con la pagina a ogni cambio, mentre il suo
	// contenuto stava fermo.
	const barra = page.locator('.toolbar-shell');
	await expect(barra).toHaveCSS('view-transition-name', 'labtoolbar');
	await expect(barra.locator('.identity-row')).toHaveCSS('view-transition-name', 'none');
	expect(await page.evaluate(() => ({
		root: getComputedStyle(document.documentElement, '::view-transition-group(root)').zIndex,
		toolbar: getComputedStyle(document.documentElement, '::view-transition-group(labtoolbar)').zIndex,
	}))).toEqual({ root: '0', toolbar: '50' });
	await barra.evaluate((elemento) => elemento.setAttribute('data-e2e-persisted', 'true'));
	await osservaProssimaTransizione(page);

	await page.getByRole('button', { name: /apri menu/i }).click();
	await page.evaluate(() => {
		(window as typeof window & { __menuOpenAtNavigation?: boolean }).__menuOpenAtNavigation = true;
		document.addEventListener('astro:before-preparation', () => {
			(window as typeof window & { __menuOpenAtNavigation?: boolean }).__menuOpenAtNavigation =
				document.querySelector('.toolbar-shell')?.classList.contains('open') ?? false;
		}, { once: true });
	});
	await page.locator('.nav-item[href="/lab/it/progetti/"]').click();
	await page.waitForURL('/lab/it/progetti/');
	await expect(barra).toHaveAttribute('data-e2e-persisted', 'true');
	expect(await page.evaluate(() => (window as typeof window & { __menuOpenAtNavigation?: boolean }).__menuOpenAtNavigation)).toBe(false);

	await expect.poll(() => leggiTransizione(page)).toMatchObject({ direction: 'forward' });
	const avanti = (await leggiTransizione(page))!;
	expect(avanti.animations).toEqual(expect.arrayContaining([
		expect.objectContaining({ name: 'lab-root-forward-out', pseudo: '::view-transition-old(root)', duration: 760 }),
		expect.objectContaining({ name: 'lab-root-forward-in', pseudo: '::view-transition-new(root)', duration: 760 }),
		expect.objectContaining({ name: 'lab-toolbar-hold', pseudo: '::view-transition-new(labtoolbar)', duration: 760 }),
	]));

	await osservaProssimaTransizione(page);
	await page.goBack();
	await page.waitForURL('/lab/it/');
	await expect.poll(() => leggiTransizione(page)).toMatchObject({ direction: 'back' });
	const indietro = (await leggiTransizione(page))!;
	expect(indietro.animations).toEqual(expect.arrayContaining([
		expect.objectContaining({ name: 'lab-root-back-out', pseudo: '::view-transition-old(root)', duration: 760 }),
		expect.objectContaining({ name: 'lab-root-back-in', pseudo: '::view-transition-new(root)', duration: 760 }),
	]));
});

test('il titolo home non si muove mentre la pagina sta entrando', async ({ page }) => {
	// L'ingresso non è più annullato: è in coda dietro un'attesa tarata perché il titolo
	// parta dopo che la transizione ha chiuso. La garanzia da difendere resta la stessa —
	// niente si muove sotto lo snapshot — ma ora si misura la posizione, non il nome
	// dell'animazione: è la posizione che si vedeva saltare.
	await page.goto('/lab/it/');

	const righeTitolo = page.locator('.hero-marchio .mascherina > *');
	await expect(righeTitolo.first()).toHaveCSS('animation-name', 'sale');

	await page.goto('/lab/it/progetti/');
	await page.evaluate(() => {
		type FinestraDiagnostica = typeof window & {
			__homeTitleTransforms?: string[];
			__homeTitleTransformsAfterTransition?: string[];
		};
		const finestra = window as FinestraDiagnostica;
		const posizioni = () =>
			Array.from(document.querySelectorAll<HTMLElement>('.hero-marchio .mascherina > *'))
				.map((elemento) => getComputedStyle(elemento).transform);
		document.addEventListener('astro:before-swap', (event) => {
			event.viewTransition.finished.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
				finestra.__homeTitleTransformsAfterTransition = posizioni();
			})));
		}, { once: true });
		document.addEventListener('astro:after-swap', () => {
			finestra.__homeTitleTransforms = posizioni();
		}, { once: true });
	});

	await page.getByRole('button', { name: /apri menu/i }).click();
	await page.locator('.nav-item[href="/lab/it/"]').click();
	await page.waitForURL('/lab/it/');

	// fuori dalla feritoia, fermo al punto di partenza: 105% dell'altezza della riga
	const fermoInBasso = (posizioni: string[] | undefined) =>
		posizioni?.every((posizione) => {
			const scostamento = Number.parseFloat(posizione.split(',').at(-1) ?? '0');
			return Number.isFinite(scostamento) && scostamento > 40;
		});

	await expect.poll(() => page.evaluate(() =>
		(window as typeof window & { __homeTitleTransforms?: string[] }).__homeTitleTransforms,
	).then(fermoInBasso)).toBe(true);
	await expect.poll(() => page.evaluate(() =>
		(window as typeof window & { __homeTitleTransformsAfterTransition?: string[] }).__homeTitleTransformsAfterTransition,
	).then(fermoInBasso)).toBe(true);

	// e una volta chiusa la transizione sale davvero
	await expect.poll(() => page.evaluate(() =>
		getComputedStyle(document.querySelector('.hero-marchio .mascherina > *')!).transform,
	)).toBe('none');
});

test('il movimento ridotto disattiva le animazioni della transizione', async ({ browser }) => {
	const context = await browser.newContext({
		baseURL: 'http://127.0.0.1:4321',
		reducedMotion: 'reduce',
	});
	const page = await context.newPage();
	await page.goto('/lab/it/');

	const animations = await page.evaluate(() => ({
		root: getComputedStyle(document.documentElement, '::view-transition-new(root)').animationName,
		toolbar: getComputedStyle(document.documentElement, '::view-transition-new(labtoolbar)').animationName,
	}));
	expect(animations).toEqual({ root: 'none', toolbar: 'none' });

	await context.close();
});

test('senza View Transition API il lab continua a navigare', async ({ browser }) => {
	const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4321' });
	await context.addInitScript(() => {
		Object.defineProperty(document, 'startViewTransition', { configurable: true, value: undefined });
	});
	const page = await context.newPage();
	await page.goto('/lab/it/');

	await page.getByRole('button', { name: /apri menu/i }).click();
	await page.locator('.nav-item[href="/lab/it/progetti/"]').click();
	await page.waitForURL('/lab/it/progetti/');
	await expect(page.getByRole('heading', { level: 1, name: /Progetti/ })).toBeVisible();
	await expect(page.locator('.toolbar-shell')).toBeVisible();

	await context.close();
});
