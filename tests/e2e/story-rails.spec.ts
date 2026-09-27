import { expect, test, type Locator, type Page } from '@playwright/test';

// Le file orizzontali con le frecce (Highlights, Gallery, MediaCards): le frecce portano alla carta
// accanto e restano giuste con ogni modo di muovere la fila. Due passate: con scrollend, e senza,
// come in Safari.

const arriva = (page: Page) => page.waitForFunction(() => !document.documentElement.hasAttribute('data-caricando'), null, { timeout: 8000 });
const sections = '/en/preview/sections/';
const poliverse = '/en/preview/poliverse/';

// dove deve stare la fila per avere la carta i all'inizio, e dove sta
const place = (track: Locator) => track.evaluate((el) => {
	const max = el.scrollWidth - el.clientWidth;
	const lefts = [...el.children].map((c) => Math.min(max, Math.round(c.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft)));
	return { at: Math.round(el.scrollLeft), lefts, max };
});
const buttons = (rail: Locator) => rail.evaluate((el) => ({
	prev: (el.querySelector('[data-rail-prev]') as HTMLButtonElement).disabled,
	next: (el.querySelector('[data-rail-next]') as HTMLButtonElement).disabled,
}));
const still = async (track: Locator) => {
	let last = -1;
	await expect.poll(async () => { const now = (await place(track)).at; const same = now === last; last = now; return same; }, { intervals: [150], timeout: 5000 }).toBe(true);
};

for (const safari of [false, true]) {
	const tag = safari ? ' (without scrollend, as in Safari)' : '';
	const open = async (page: Page, route: string, which: string) => {
		if (safari) await page.addInitScript(() => window.addEventListener('scrollend', (e) => e.stopImmediatePropagation(), true));
		await page.setViewportSize({ width: 1024, height: 800 });
		await page.goto(route);
		await arriva(page);
		const rail = page.locator(`.st-rail:has(${which})`).first();
		await rail.scrollIntoViewIfNeeded();
		return { rail, track: rail.locator('[data-rail-track]') };
	};

	for (const [name, route, which] of [['Highlights', sections, '.st-highlights'], ['Gallery', sections, '.st-gallery'], ['MediaCards', poliverse, '.st-mc-track']] as const) {
		test(`${name}: each arrow goes to exactly the next card, and fast clicks count from where the row is heading${tag}`, async ({ page }) => {
			const { rail, track } = await open(page, route, which);
			expect(await buttons(rail)).toEqual({ prev: true, next: false });
			await rail.locator('[data-rail-next]').click();
			await still(track);
			let p = await place(track);
			expect(Math.abs(p.at - p.lefts[1])).toBeLessThanOrEqual(2);
			expect(await buttons(rail)).toEqual({ prev: false, next: p.at >= p.max - 2 });
			// due clic subito uno dopo l'altro: due carte più in là, non a metà
			if (!(await buttons(rail)).next) {
				await rail.locator('[data-rail-next]').click();
				if (!(await buttons(rail)).next) await rail.locator('[data-rail-next]').click();
				await still(track);
				p = await place(track);
				expect(p.lefts.some((l) => Math.abs(l - p.at) <= 2)).toBe(true);
			}
			// e indietro fino all'inizio
			for (let k = 0; k < 6 && !(await buttons(rail)).prev; k++) { await rail.locator('[data-rail-prev]').click(); await still(track); }
			expect((await place(track)).at).toBeLessThanOrEqual(2);
			expect(await buttons(rail)).toEqual({ prev: true, next: false });
		});

		test(`${name}: a swipe, the keyboard and the ends all keep the arrows right${tag}`, async ({ page }) => {
			const { rail, track } = await open(page, route, which);
			// due dita sul trackpad fino in fondo
			await track.hover();
			await page.mouse.wheel(4000, 0);
			await still(track);
			expect(await buttons(rail)).toEqual({ prev: false, next: true });
			// le frecce della tastiera con la fila a fuoco, fino all'inizio
			await track.focus();
			for (let k = 0; k < 10 && (await place(track)).at > 2; k++) { await page.keyboard.press('ArrowLeft'); await still(track); }
			expect((await place(track)).at).toBeLessThanOrEqual(2);
			await expect.poll(() => buttons(rail)).toEqual({ prev: true, next: false });
			// dopo una passata la freccia conta da dove la fila è ferma
			await track.hover();
			await page.mouse.wheel(500, 0);
			await still(track);
			const from = await place(track);
			const at = from.lefts.findIndex((l) => Math.abs(l - from.at) <= 2);
			await rail.locator('[data-rail-next]').click();
			await still(track);
			const to = await place(track);
			expect(to.lefts.findIndex((l) => Math.abs(l - to.at) <= 2)).toBeGreaterThan(at);
		});

		test(`${name}: an arrow that switches off at the end hands the focus to the other${tag}`, async ({ page }) => {
			const { rail, track } = await open(page, route, which);
			const next = rail.locator('[data-rail-next]');
			await next.focus();
			for (let k = 0; k < 8 && !(await buttons(rail)).next; k++) { await page.keyboard.press('Enter'); await still(track); }
			expect((await buttons(rail)).next).toBe(true);
			await expect(rail.locator('[data-rail-prev]')).toBeFocused();
		});
	}
}

test('the rows follow the window: with every card in view the arrows go away', async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 800 });
	await page.goto(sections);
	await arriva(page);
	const rail = page.locator('.st-rail:has(.st-highlights)').first();
	await expect(rail.locator('.st-rail-controls')).toBeVisible();
	// la fila stretta a quattro carte piccole: tutte nella finestra, niente da scorrere
	await rail.locator('[data-rail-track]').evaluate((el) => { el.style.gridAutoColumns = '60px'; });
	await expect(rail).toHaveAttribute('data-rail-static', '');
	await expect(rail.locator('.st-rail-controls')).toBeHidden();
	await rail.locator('[data-rail-track]').evaluate((el) => { el.style.gridAutoColumns = ''; });
	await expect(rail).not.toHaveAttribute('data-rail-static', '');
});

test('the arrows speak Italian on the Italian pages', async ({ page }) => {
	await page.goto('/it/anteprima/poliverse/');
	await arriva(page);
	const rail = page.locator('.st-rail:has(.st-mc-track)').first();
	await expect(rail.locator('[data-rail-prev]')).toHaveAttribute('aria-label', 'Carta precedente');
	await expect(rail.locator('[data-rail-next]')).toHaveAttribute('aria-label', 'Carta successiva');
});
