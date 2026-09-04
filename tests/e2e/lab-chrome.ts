import type { Page } from '@playwright/test';

/**
 * Gesti condivisi dai test del banco di prova.
 *
 * La sequenza «apri il menu, aspetta il pannello, clicca la voce» era ricopiata otto volte
 * su quattro file, con tre selettori diversi per lo stesso bottone: qui sta una volta sola.
 */

/** Il sipario ha finito e ha passato la mano alla hero. */
export const attendiCaricato = (page: Page, timeout = 8000) =>
	page.waitForFunction(() => document.documentElement.hasAttribute('data-caricato'), null, { timeout });

/** Apre il pannello e aspetta che la barra abbia finito di crescere. */
export async function apriMenu(page: Page) {
	await page.click('.toolbar-shell .menu-toggle');
	await page.waitForTimeout(700);
}

/** Apre il menu e segue una voce, per etichetta come la legge chi naviga. */
export async function vaiDalMenu(page: Page, voce: string, attesa = 1400) {
	await apriMenu(page);
	await page.click(`.toolbar-shell .nav-item[data-page="${voce}"]`);
	await page.waitForTimeout(attesa);
}

/**
 * Quanto la riga della barra si discosta dal guscio che la contiene, e se il guscio è scorso
 * dentro di sé. Entrambe le cose sono andate storte davvero: la riga era position: fixed e
 * scappava a destra sotto un transform, e overflow: hidden faceva del guscio un contenitore
 * scorrevole che se la portava via al primo fuoco da tastiera.
 */
export const rigaSulGuscio = (page: Page) =>
	page.evaluate(() => {
		const guscio = document.querySelector('.toolbar-shell') as HTMLElement;
		const g = guscio.getBoundingClientRect();
		const r = document.querySelector('.identity-row')!.getBoundingClientRect();
		return {
			dalLato: Math.abs(r.left - g.left),
			dalFondo: Math.abs(r.bottom - g.bottom),
			scorrimento: guscio.scrollTop,
		};
	});
