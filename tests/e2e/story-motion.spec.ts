import { expect, test, type Page } from '@playwright/test';

// Il sipario si vede una volta per sessione: alle visite successive non c'è niente da aspettare.
const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });

// Il movimento dei racconti: le salite legate allo scroll, i blocchi fissati, i controlli che si
// animano, e che senza movimento o senza script tutto resti leggibile e usabile.
const poliverse = '/en/preview/poliverse/';
const catalogue = '/en/preview/sections-v2/';

const scrollTo = (page: Page, y: number) => page.evaluate((v) => window.scrollTo(0, v), y);
const topOf = (page: Page, selector: string) => page.locator(selector).first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
const animationOf = (page: Page, selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).animationName);

test('titles and cards rise with the scroll, and stand still with reduced motion', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	expect(await animationOf(page, '#numbers .st-head')).toBe('st-rise');
	// ben dentro la finestra la salita è finita: opaco e al suo posto
	await scrollTo(page, (await topOf(page, '#numbers .st-head')) - 150);
	await expect.poll(() => page.locator('#numbers .st-head').evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.99);

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await arriva(page);
	expect(await animationOf(page, '#numbers .st-head')).toBe('none');
	expect(await animationOf(page, '.st-ahero h1')).toBe('none');
	expect(await page.locator('#numbers .st-head').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});

test('the segmented control slides one thumb between choices', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const set = page.locator('.st-toggle .st-segments');
	await expect(set).toHaveAttribute('data-thumb', 'on');
	const x = () => set.evaluate((el) => parseFloat(el.style.getPropertyValue('--seg-x')));
	const before = await x();
	await page.locator('.st-toggle').getByText('Vicino', { exact: true }).click();
	await expect.poll(x).toBeGreaterThan(before);
	expect(await set.evaluate((el) => parseFloat(el.style.getPropertyValue('--seg-w')))).toBeGreaterThan(40);
});

test('the highlights play when they come into view, and never on their own with reduced motion', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const gallery = page.locator('.st-hgallery');
	await expect(gallery).not.toHaveAttribute('data-playing', 'true');
	await gallery.scrollIntoViewIfNeeded();
	await expect(gallery).toHaveAttribute('data-playing', 'true');
	await expect(gallery.getByRole('button', { name: 'Pause the highlights' })).toBeVisible();
	// il pallino attivo si riempie nel tempo di una carta
	expect(await gallery.locator('[data-hg-dot][aria-pressed="true"] span').evaluate((el) => getComputedStyle(el, '::after').animationName)).toBe('st-dot-fill');

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await arriva(page);
	await page.locator('.st-hgallery').scrollIntoViewIfNeeded();
	await page.waitForTimeout(600);
	await expect(page.locator('.st-hgallery')).not.toHaveAttribute('data-playing', 'true');
});

test('the first highlight gathers the six services into the app once it is in view', async ({ page, browser }) => {
	await page.goto(poliverse);
	await arriva(page);
	const chips = page.locator('.pv-combine .pv-chip');
	await expect(chips).toHaveCount(6);
	// fuori vista la carta aspetta il suo turno: i servizi non ci sono ancora
	expect(await chips.first().evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
	await page.locator('.st-hgallery').scrollIntoViewIfNeeded();
	await expect(page.locator('.st-hgallery')).toHaveAttribute('data-inview', '');
	await expect(page.locator('.st-hg-card').first()).toHaveAttribute('data-current', '');
	expect(await chips.first().evaluate((el) => getComputedStyle(el).animationName)).toBe('pv-chip-in');
	// a fine giro sono tutti in orbita, con l'app al centro
	await expect.poll(() => chips.evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1')), { timeout: 5000 }).toBe(true);
	await expect.poll(() => page.locator('.pv-core').evaluate((el) => getComputedStyle(el).opacity), { timeout: 5000 }).toBe('1');

	// senza movimento, e senza script, il disegno è già al punto d'arrivo
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await arriva(page);
	expect(await chips.evaluateAll((els) => els.map((el) => [getComputedStyle(el).animationName, getComputedStyle(el).opacity]))).toEqual(Array(6).fill(['none', '1']));
	const context = await browser.newContext({ javaScriptEnabled: false });
	const still = await context.newPage();
	await still.goto(poliverse);
	expect(await still.locator('.pv-combine .pv-chip').evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1'))).toBe(true);
	await context.close();
});

test('the numbers count up once they are seen, and keep their value for screen readers', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const commits = page.locator('#numbers .st-stats-grid li').first();
	await expect(commits.locator('[data-count]')).toHaveText('0');
	await expect(commits.locator('.st-sr')).toHaveText('309');
	await commits.scrollIntoViewIfNeeded();
	await expect(commits.locator('[data-count]')).toHaveText('309', { timeout: 4000 });
	await expect(page.locator('#numbers .st-stats-grid li').nth(1).locator('[data-count]')).toHaveText('1,220', { timeout: 4000 });
});

test('the pinned scenes hand over one after another while the stage stays put', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const scenes = page.locator('.st-scenes');
	expect(await scenes.locator('.st-scenes-stage').evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
	const top = await topOf(page, '.st-scenes');
	const height = await scenes.evaluate((el) => el.getBoundingClientRect().height);
	const vh = await page.evaluate(() => innerHeight);
	const opacities = () => scenes.locator('.st-scene').evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
	// a metà del secondo quarto dello scroll fissato si vede la seconda scena, e solo quella
	await scrollTo(page, top + 0.375 * (height - vh));
	await expect.poll(async () => (await opacities()).map((o) => Math.round(o))).toEqual([0, 1, 0, 0]);
	await scrollTo(page, top + 0.875 * (height - vh));
	await expect.poll(async () => (await opacities()).map((o) => Math.round(o))).toEqual([0, 0, 0, 1]);

	// senza movimento le scene sono un elenco: ferme, tutte visibili
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await arriva(page);
	expect(await page.locator('.st-scenes-stage').evaluate((el) => getComputedStyle(el).position)).not.toBe('sticky');
	expect(await page.locator('.st-scene').evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity))).toEqual(['1', '1', '1', '1']);
});

test('the pinned intro holds the title for a screen, and is a plain title without motion', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const intro = page.locator('.st-intro');
	const vh = await page.evaluate(() => innerHeight);
	expect(await intro.evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(1.9 * vh);
	expect(await intro.locator('.st-intro-pin').evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await arriva(page);
	expect(await page.locator('.st-intro').evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(vh);
	expect(await animationOf(page, '.st-intro-title')).toBe('none');
});

test('the comparison moves with the keyboard, and stands side by side without script', async ({ page, browser }) => {
	await page.goto(poliverse);
	await arriva(page);
	const figure = page.locator('.st-ba').first();
	await expect(figure).toHaveAttribute('data-ba-live', '');
	const range = figure.getByRole('slider', { name: /Compare a white label/ });
	await range.focus();
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');
	await expect(range).toHaveValue('52');
	await expect(range).toHaveAttribute('aria-valuetext', '52% White · 2.4:1, 48% Near-black · 7.8:1');
	expect(await figure.evaluate((el) => el.style.getPropertyValue('--ba'))).toBe('52');

	const context = await browser.newContext({ javaScriptEnabled: false });
	const still = await context.newPage();
	await still.goto(poliverse);
	const stage = still.locator('.st-ba-stage').first();
	expect(await stage.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(2);
	await expect(still.locator('.st-ba-range').first()).toBeHidden();
	await context.close();
});

test('a plus opens its sheet, Escape closes it, and it works without script', async ({ page, browser }) => {
	await page.goto(catalogue);
	await arriva(page);
	const card = page.locator('.st-plus-card').nth(1);
	const open = card.getByRole('button', { name: 'More about: One lane per device.' });
	await open.click();
	const sheet = card.locator('.st-plus-sheet');
	await expect(sheet).toBeVisible();
	await expect(sheet.getByRole('heading', { name: 'One lane per device.' })).toBeVisible();
	await expect(sheet.getByRole('button', { name: 'Close' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(sheet).toBeHidden();
	await expect(open).toBeFocused();

	const context = await browser.newContext({ javaScriptEnabled: false });
	const still = await context.newPage();
	await still.goto(catalogue);
	await still.locator('.st-plus-card').first().getByRole('button', { name: /More about/ }).click();
	await expect(still.locator('.st-plus-sheet').first()).toBeVisible();
	await context.close();
});

test('the explorer opens the chosen item instead of swapping it', async ({ page }) => {
	await page.goto(catalogue);
	await arriva(page);
	const fx = page.locator('.st-fx');
	const inner = (i: number) => fx.locator('.st-fx-body-in').nth(i);
	await expect(inner(0)).toBeVisible();
	await expect(inner(1)).toBeHidden();
	await fx.locator('.st-fx-list').getByText('Order pad', { exact: true }).click();
	await expect(inner(1)).toBeVisible();
	await expect(inner(0)).toBeHidden();
});

test('the explorer keeps its whole device inside a short window', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 720 });
	await page.goto(catalogue);
	await arriva(page);
	// fissato sotto la testata e sopra il dock: il dispositivo non si taglia mai in altezza
	expect(await page.locator('.st-fx .st-fx-figure > .st-frame').evaluate((el) => el.getBoundingClientRect().height)).toBeLessThanOrEqual(720 - 200);
});

test('the hero shows every device in one still picture, whole', async ({ page }) => {
	for (const width of [390, 1440]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto(poliverse);
		await arriva(page);
		const shot = page.locator('.st-ahero-shot');
		// niente entrata e niente deriva con lo scroll: la foto è ferma
		expect(await shot.evaluate((el) => [el, ...el.querySelectorAll('*')].every((n) => getComputedStyle(n).animationName === 'none'))).toBe(true);
		// e intera: sta nella finestra, e il fondo dell'apertura non la taglia
		const { height, below } = await shot.locator('.st-shot-stage').evaluate((el) => {
			const r = el.getBoundingClientRect();
			return { height: r.height, below: el.closest('.st-ahero')!.getBoundingClientRect().bottom - r.bottom };
		});
		expect(height).toBeLessThan(844);
		expect(below).toBeGreaterThan(0);
	}
});

// Una passata per pagina e per larghezza. Lo scroll e la misura restano dentro la pagina, con due
// fotogrammi a ogni passo perché le animazioni legate allo scroll arrivino al punto: un giro di
// andata e ritorno con Playwright per ogni passo costava più dei trenta secondi del test.
for (const route of [poliverse, catalogue]) {
	for (const width of [390, 1440]) {
		test(`nothing overflows sideways while the motion runs · ${route} at ${width}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 844 });
			await page.goto(route);
			await arriva(page);
			const wide = await page.evaluate(async (limit) => {
				const frame = () => new Promise((done) => requestAnimationFrame(() => done(null)));
				const found: string[] = [];
				for (let y = 0; y < document.documentElement.scrollHeight; y += 1400) {
					window.scrollTo(0, y);
					await frame();
					await frame();
					const w = document.documentElement.scrollWidth;
					if (w > limit) found.push(`y ${y}: ${w}px`);
				}
				return found;
			}, width);
			expect(wide).toEqual([]);
		});
	}
}
