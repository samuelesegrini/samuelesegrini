import { expect, test, type Page } from '@playwright/test';

const toolbarUrl = '/toolbar-only-v2.html';

// Ogni bordo della barra deve essere una tinta piena: l'alfa faceva leggere gli accenti
// come grigio contro il fondo scuro. Vale in tutti gli stati, menu aperto compreso.
async function bordiConAlfa(page: Page) {
	return page.evaluate(() => {
		const alfaDi = (colore: string) => {
			if (colore === 'transparent') return 0;
			const funzione = colore.match(/^(rgba?|color)\((.*)\)$/);
			if (!funzione) return 1;
			const barra = funzione[2].split('/');
			if (barra.length > 1) return parseFloat(barra[1]);
			const virgole = funzione[2].split(',');
			return virgole.length > 3 ? parseFloat(virgole[3]) : 1;
		};
		const lati = ['Top', 'Right', 'Bottom', 'Left'] as const;
		const fuori: string[] = [];
		document.querySelectorAll('*').forEach((el) => {
			const cs = getComputedStyle(el);
			lati.forEach((lato) => {
				if (!parseFloat(cs[`border${lato}Width` as 'borderTopWidth'])) return;
				const colore = cs[`border${lato}Color` as 'borderTopColor'];
				if (alfaDi(colore) < 1) {
					fuori.push(`${el.tagName.toLowerCase()}.${(el as HTMLElement).className || '—'} border-${lato.toLowerCase()}: ${colore}`);
				}
			});
		});
		return [...new Set(fuori)];
	});
}

test.beforeEach(async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 820 });
	await page.goto(toolbarUrl);
	await page.waitForTimeout(500);
});

test('nessun bordo trasparente sulla hero', async ({ page }) => {
	await expect(page.locator('.toolbar-shell')).toHaveAttribute('data-mode', 'hero');
	expect(await bordiConAlfa(page)).toEqual([]);
});

test('nessun bordo trasparente con l indice aperto', async ({ page }) => {
	await page.evaluate(() => document.querySelector('#lavoro')!.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior }));
	await expect(page.locator('.toolbar-shell')).toHaveAttribute('data-mode', 'index');
	expect(await bordiConAlfa(page)).toEqual([]);
});

test('nessun bordo trasparente con il menu aperto, su ogni rotta', async ({ page }) => {
	for (const rotta of ['Home', 'Progetti', 'Articoli', 'Chi sono']) {
		await page.locator('#menu-toggle').click();
		await expect(page.locator('.toolbar-shell')).toHaveClass(/open/);
		// il pannello aperto è l'unico punto in cui compaiono frecce e anteprime
		expect(await bordiConAlfa(page), `menu aperto prima di ${rotta}`).toEqual([]);
		await page.locator(`.nav-item[data-page="${rotta}"]`).click();
		await page.waitForTimeout(600);
		expect(await bordiConAlfa(page), `rotta ${rotta}`).toEqual([]);
	}
});

test('il bordo degli strumenti prende il colore della rotta e resta opaco', async ({ page }) => {
	await page.evaluate(() => document.querySelector('#lavoro')!.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior }));
	await page.waitForTimeout(600);
	const bordo = () => page.locator('.plane-slot').evaluate((e) => getComputedStyle(e).borderTopColor);
	const visti = new Set<string>();
	for (const rotta of ['Home', 'Progetti', 'Articoli', 'Chi sono']) {
		await page.locator('#menu-toggle').click();
		await page.locator(`.nav-item[data-page="${rotta}"]`).click();
		await page.waitForTimeout(600);
		const colore = await bordo();
		visti.add(colore);
		// aereo, torna su e le due metà della lingua devono concordare
		for (const sel of ['.top-slot', '.segment-bed']) {
			expect(await page.locator(sel).first().evaluate((e) => getComputedStyle(e).borderTopColor), `${sel} su ${rotta}`).toBe(colore);
		}
	}
	expect(visti.size, 'ogni rotta ha il suo colore').toBe(4);
	expect(await bordiConAlfa(page)).toEqual([]);
});

test('le celle escluse restano senza bordo', async ({ page }) => {
	await page.evaluate(() => document.querySelector('#lavoro')!.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior }));
	await page.waitForTimeout(600);
	for (const sel of ['.identity-mark', '.shuffle-slot', '[data-detail]', '.menu-toggle']) {
		expect(parseFloat(await page.locator(sel).first().evaluate((e) => getComputedStyle(e).borderTopWidth)), sel).toBe(0);
	}
	for (const sel of ['.plane-slot', '.top-slot', '.segment-bed']) {
		expect(parseFloat(await page.locator(sel).first().evaluate((e) => getComputedStyle(e).borderTopWidth)), sel).toBeGreaterThan(0);
	}
});
