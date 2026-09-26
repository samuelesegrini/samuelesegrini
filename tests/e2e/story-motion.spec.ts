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
	expect(await gallery.locator('[data-hg-dot][aria-pressed="true"] span').evaluate((el) => getComputedStyle(el, '::after').animationName)).toMatch(/^st-dot-fill/);

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
	expect(await page.locator('.pv-orbit').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('pv-orbit-x');
	// a fine giro sono tutti in orbita, con l'app al centro
	await expect.poll(() => chips.evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1')), { timeout: 5000 }).toBe(true);
	await expect.poll(() => page.locator('.pv-core').evaluate((el) => getComputedStyle(el).opacity), { timeout: 5000 }).toBe('1');

	// senza movimento, e senza script, il disegno è già al punto d'arrivo
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await arriva(page);
	expect(await chips.evaluateAll((els) => els.map((el) => [getComputedStyle(el).animationName, getComputedStyle(el).opacity]))).toEqual(Array(6).fill(['none', '1']));
	// fermi, ognuno al suo posto sull'ellisse dell'anello, in senso orario dall'alto
	const places = await page.locator('.pv-combine').evaluate((combine) => {
		const box = combine.getBoundingClientRect();
		return [...combine.querySelectorAll('.pv-orbit-y')].map((el) => {
			const r = el.getBoundingClientRect();
			const x = (r.left - box.left - box.width * 0.5) / (box.width * 0.38);
			const y = (r.top - box.top - box.height * 0.54) / (box.height * 0.36);
			return (Math.round((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
		});
	});
	expect(places).toEqual([270, 330, 30, 90, 150, 210]);
	const context = await browser.newContext({ javaScriptEnabled: false });
	const still = await context.newPage();
	await still.goto(poliverse);
	expect(await still.locator('.pv-combine .pv-chip').evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1'))).toBe(true);
	await context.close();
});

test('the six services keep orbiting the app until the pause button stops them', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const gallery = page.locator('.st-hgallery');
	const play = page.locator('[data-hg-play]');
	// dove si trova ora il primo servizio: lo spostamento orizzontale e quello verticale
	const spot = () => page.locator('.pv-orbit').first().evaluate((el) => `${getComputedStyle(el).translate} ${getComputedStyle(el.firstElementChild!).translate}`);
	const moving = async () => {
		const before = await spot();
		await page.waitForTimeout(400);
		return (await spot()) !== before;
	};
	// la galleria in cima alla finestra: così la barra in basso non copre i comandi
	await gallery.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	await expect(gallery).toHaveAttribute('data-playing', 'true');
	// il giro parte con l'ingresso e non si ferma
	expect(await moving()).toBe(true);
	// un pallino porta alla carta e lascia scorrere le carte e l'orbita
	await page.locator('[data-hg-dot="0"]').click();
	await expect(gallery).toHaveAttribute('data-playing', 'true');
	expect(await moving()).toBe(true);
	// il tasto di pausa invece la ferma dov'è, e l'ingresso arriva comunque in fondo
	await play.click();
	await expect(gallery).toHaveAttribute('data-still', '');
	expect(await moving()).toBe(false);
	await expect.poll(() => page.locator('.pv-combine .pv-chip').evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1')), { timeout: 5000 }).toBe(true);
	// e la riproduzione la fa ripartire
	await play.click();
	await expect(gallery).not.toHaveAttribute('data-still', '');
	expect(await moving()).toBe(true);
});

test('a dot restarts the counter, pause freezes it, and play goes on from where it stopped', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const gallery = page.locator('.st-hgallery');
	await gallery.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	await expect(gallery).toHaveAttribute('data-playing', 'true');
	// quanto si è riempita la barra del pallino attivo
	const fill = () => gallery.locator('[data-hg-dot][aria-pressed="true"] span').evaluate((el) => {
		const a = el.getAnimations({ subtree: true })[0];
		return a ? { time: Number(a.currentTime), state: a.playState } : null;
	});
	await page.waitForTimeout(1500);
	// un altro pallino: la carta cambia, la riproduzione resta, la barra riparte da vuota
	await page.locator('[data-hg-dot="2"]').click();
	await expect(gallery).toHaveAttribute('data-playing', 'true');
	await expect(page.locator('.st-hg-card').nth(2)).toHaveAttribute('data-current', '');
	expect((await fill())!.time).toBeLessThan(700);
	await page.waitForTimeout(1200);
	// pausa: la barra si ferma dov'è
	await page.locator('[data-hg-play]').click();
	await expect(gallery).toHaveAttribute('data-still', '');
	const held = (await fill())!;
	expect(held.state).toBe('paused');
	await page.waitForTimeout(800);
	expect((await fill())!.time).toBe(held.time);
	// riprendendo continua da lì, non da capo
	await page.locator('[data-hg-play]').click();
	await expect(gallery).toHaveAttribute('data-playing', 'true');
	await page.waitForTimeout(300);
	const after = (await fill())!;
	expect(after.state).toBe('running');
	expect(after.time).toBeGreaterThanOrEqual(held.time);
	// in pausa, un pallino porta alla sua carta e fa ripartire la riproduzione, con la barra da vuota
	await page.locator('[data-hg-play]').click();
	await expect(gallery).toHaveAttribute('data-still', '');
	await page.locator('[data-hg-dot="1"]').click();
	await expect(gallery).toHaveAttribute('data-playing', 'true');
	await expect(gallery).not.toHaveAttribute('data-still', '');
	await expect(page.locator('.st-hg-card').nth(1)).toHaveAttribute('data-current', '');
	const restarted = (await fill())!;
	expect(restarted.state).toBe('running');
	expect(restarted.time).toBeLessThan(700);
	// un clic dentro una carta non ferma nulla
	await page.locator('.st-hg-card[data-current]').click({ position: { x: 40, y: 40 } });
	await expect(gallery).toHaveAttribute('data-playing', 'true');
});

test('pause freezes the whole card in front, drawing and line, and play lets it go on', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const gallery = page.locator('.st-hgallery');
	await gallery.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	await page.locator('[data-hg-dot="3"]').click();
	const last = page.locator('.st-hg-card').last();
	await expect(last).toHaveAttribute('data-played', '');
	await page.waitForTimeout(600);
	const states = () => last.evaluate((card) => card.getAnimations({ subtree: true }).map((a) => a.playState));
	expect(await states()).toContain('running');
	await page.locator('[data-hg-play]').click();
	await expect(gallery).toHaveAttribute('data-still', '');
	expect((await states()).filter((s) => s === 'running')).toEqual([]);
	await page.locator('[data-hg-play]').click();
	expect(await states()).toContain('running');
});

test('the controls arrive once as a rising circle that opens into the dots and the button', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const gallery = page.locator('.st-hgallery');
	const controls = gallery.locator('.st-hg-controls');
	// prima di entrare in vista i controlli non si vedono ancora
	expect(await controls.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
	await gallery.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	await expect(gallery).toHaveAttribute('data-arrived', '');
	const names = await page.evaluate(() => document.getAnimations().map((a) => (a as CSSAnimation).animationName).filter((n) => /^st-hg-(rise|open|drop|show)$/.test(n)));
	expect(new Set(names)).toEqual(new Set(['st-hg-rise', 'st-hg-open', 'st-hg-drop', 'st-hg-show']));
	// finita l'entrata restano come sempre: niente ritaglio, niente spostamento, il tasto si preme ancora
	await expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => /^st-hg-(rise|open|drop|show)$/.test((a as CSSAnimation).animationName)).length), { timeout: 4000 }).toBe(0);
	expect(await controls.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
	expect(await gallery.locator('.st-hg-dots').evaluate((el) => [getComputedStyle(el).clipPath, getComputedStyle(el).translate])).toEqual(['none', 'none']);
	// fuori e di nuovo in vista non riparte
	await page.evaluate(() => window.scrollTo(0, 0));
	await expect(gallery).not.toHaveAttribute('data-inview', '');
	await gallery.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	await expect(gallery).toHaveAttribute('data-inview', '');
	expect(await page.evaluate(() => document.getAnimations().filter((a) => /^st-hg-(rise|open|drop|show)$/.test((a as CSSAnimation).animationName)).length)).toBe(0);
});

test('without motion the controls are simply there', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(poliverse);
	await arriva(page);
	const gallery = page.locator('.st-hgallery');
	expect(await gallery.locator('.st-hg-controls').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
	await gallery.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	await expect(gallery).toHaveAttribute('data-arrived', '');
	expect(await page.evaluate(() => document.getAnimations().filter((a) => /^st-hg-/.test((a as CSSAnimation).animationName)).length)).toBe(0);
});

test('reaching the last card keeps playing, while a sideways swipe stops it', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	const gallery = page.locator('.st-hgallery');
	const track = gallery.locator('[data-hg-track]');
	await gallery.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	await expect(gallery).toHaveAttribute('data-playing', 'true');
	// la pagina scorsa in verticale col trackpad sopra la fila non è un gesto sulla fila
	await track.hover();
	await page.mouse.wheel(0, 30);
	await gallery.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	const last = page.locator('.st-hg-card').last();
	await page.locator('[data-hg-dot="3"]').click();
	await expect(last).toHaveAttribute('data-current', '');
	await page.waitForTimeout(1800);
	// lo snap che si riassesta sull'ultima carta, come fa Safari, lascia la riproduzione com'era
	await track.evaluate((el) => el.scrollBy({ left: -1, behavior: 'instant' }));
	await page.waitForTimeout(300);
	await expect(gallery).toHaveAttribute('data-playing', 'true');
	await expect(last).toHaveAttribute('data-current', '');
	// una passata di lato porta a un'altra carta e ferma lo scorrimento da solo
	await track.hover();
	await page.mouse.wheel(-2000, 0);
	await expect(gallery).toHaveAttribute('data-playing', 'false');
	await expect(last).not.toHaveAttribute('data-current', '');
});

test('each big card plays its own entrance the first time it comes to the front, then stays', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	await page.locator('.st-hgallery').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	await expect(page.locator('.st-hgallery')).toHaveAttribute('data-inview', '');
	const second = page.locator('.st-hg-card').nth(1);
	// finché non è stata davanti, la seconda carta aspetta al primo fotogramma
	await expect(second).not.toHaveAttribute('data-played', '');
	expect(await second.locator('.pv-stage').evaluate((el) => getComputedStyle(el.querySelector('[style*="pvk-grow"]')!).animationPlayState)).toBe('paused');
	await page.locator('[data-hg-dot="1"]').click();
	await expect(second).toHaveAttribute('data-current', '');
	await expect(second).toHaveAttribute('data-played', '');
	// il tempo del disegno va avanti da quando la carta è davanti
	const time = () => second.locator('[style*="pvk-grow"]').first().evaluate((el) => Number(el.getAnimations()[0]?.currentTime ?? 0));
	await expect.poll(time, { timeout: 5000 }).toBeGreaterThan(1500);
	// via e ritorno: la carta resta arrivata e non riparte da capo
	await page.locator('[data-hg-dot="2"]').click();
	await expect(page.locator('.st-hg-card').nth(2)).toHaveAttribute('data-played', '');
	await page.locator('[data-hg-dot="1"]').click();
	await expect(second).toHaveAttribute('data-current', '');
	expect(await time()).toBeGreaterThan(1500);
	// la carta resta davanti il suo tempo: il pallino si riempie in nove secondi
	expect(await page.locator('.st-hgallery').evaluate((el) => el.style.getPropertyValue('--hg-every'))).toBe('9000ms');
});

test('a gathered first highlight stays gathered when it comes back', async ({ page }) => {
	await page.goto(poliverse);
	await arriva(page);
	await page.locator('.st-hgallery').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	const chips = page.locator('.pv-combine .pv-chip');
	await expect.poll(() => chips.evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1')), { timeout: 5000 }).toBe(true);
	await page.locator('[data-hg-dot="3"]').click();
	await page.locator('[data-hg-dot="0"]').click();
	// subito tutti in orbita: nessuno riparte dal suo punto sparso
	expect(await chips.evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1'))).toBe(true);
});

test('without motion every highlight is already complete', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(poliverse);
	await arriva(page);
	const drawn = page.locator('.st-hg-media *');
	expect(await drawn.evaluateAll((els) => els.filter((el) => getComputedStyle(el).animationName !== 'none').length)).toBe(0);
	// quello che serve solo durante il movimento (la chiave in volo, i corsi scartati, gli stati di
	// passaggio della riga in fondo) porta data-gone: il resto si vede tutto
	expect(await drawn.evaluateAll((els) => els.filter((el) => !el.closest('[data-gone]') && getComputedStyle(el).opacity === '0').length)).toBe(0);
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
